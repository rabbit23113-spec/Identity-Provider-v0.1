import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import {
  OutboxRepository,
  OutboxStatus,
} from '../../repositories/outbox.repository';
import { Repository } from 'typeorm';
import { ClientKafka } from '@nestjs/microservices';
import { constants } from '../../constants/app.constants';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OutboxWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxWorker.name);

  private running = false;

  constructor(
    private readonly outboxRepository: Repository<OutboxRepository>,
    @Inject(constants.KAFKA_CLIENT)
    private readonly clientKafka: ClientKafka,
  ) {}

  async onModuleInit() {
    await this.clientKafka.connect();

    this.running = true;

    this.checkForEvents().catch((error) => {
      this.logger.error(error);
    });
  }

  async onModuleDestroy() {
    this.running = false;

    await this.clientKafka.close();
  }

  private async checkForEvents() {
    while (this.running) {
      try {
        const events = await this.lockEvents();

        for (const event of events) {
          await this.publishEvent(event);
        }
      } catch (error) {
        this.logger.error(error);
      }

      await this.sleep(200);
    }
  }

  private async lockEvents(): Promise<OutboxRepository[]> {
    return this.outboxRepository.manager.transaction(async (manager) => {
      const events: OutboxRepository[] = await manager.query(`
        SELECT *
        FROM outbox
        WHERE status = 'pending'
        ORDER BY created_at ASC
        LIMIT 100
        FOR UPDATE SKIP LOCKED
      `);

      if (!events.length) {
        return [];
      }

      const ids = events.map((event) => event.id);

      await manager
        .createQueryBuilder()
        .update(OutboxRepository)
        .set({
          status: OutboxStatus.PROCESSING,
        })
        .whereInIds(ids)
        .execute();

      return events;
    });
  }

  private async publishEvent(event: OutboxRepository) {
    const topic = `${event.domain}.${event.action}`;

    if (!topic || topic.includes('undefined')) {
      this.logger.error(`Invalid Kafka topic: ${topic}, eventId=${event.id}`);

      await this.outboxRepository.update(event.id, {
        status: OutboxStatus.PENDING,
      });

      return;
    }

    try {
      await firstValueFrom(
        this.clientKafka.emit(topic, {
          id: event.id,
          payload: event.payload,
        }),
      );

      await this.outboxRepository.update(event.id, {
        status: OutboxStatus.SENT,
        processedAt: new Date(),
      });

      this.logger.log(`Event published: ${topic}`);
    } catch (error) {
      this.logger.error(`Kafka publish failed: ${topic}`, error);

      await this.outboxRepository.update(event.id, {
        status: OutboxStatus.PENDING,
      });
    }
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

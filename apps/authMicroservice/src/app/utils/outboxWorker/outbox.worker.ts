import {
  Inject,
  Injectable,
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

@Injectable()
export class OutboxWorker implements OnModuleInit, OnModuleDestroy {
  private running = false;

  constructor(
    private outboxRepository: Repository<OutboxRepository>,
    @Inject(constants.KAFKA_CLIENT) private readonly clientKafka: ClientKafka,
  ) {}

  async onModuleInit() {
    this.running = true;
    await this.checkForEvents();
  }

  async onModuleDestroy() {
    this.running = false;
  }

  private async checkForEvents() {
    while (this.running) {
      await this.outboxRepository.manager.transaction(async (manager) => {
        const events: OutboxRepository[] = await manager.query(`
          SELECT *
          FROM outbox
          WHERE status = 'pending'
          ORDER BY created_at ASC LIMIT 100
        FOR
          UPDATE SKIP LOCKED
        `);

        if (!events.length) {
          return;
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
      });

      const events = await this.outboxRepository.find({
        where: {
          status: OutboxStatus.PROCESSING,
        },
        take: 100,
        order: {
          createdAt: 'ASC',
        },
      });

      for (const event of events) {
        try {
          this.clientKafka.send(
            `${event.domain}:${event.action}`,
            event.payload,
          );

          await this.outboxRepository.update(event.id, {
            status: OutboxStatus.SENT,
            processedAt: new Date(),
          });
        } catch (e) {
          await this.outboxRepository.update(event.id, {
            status: OutboxStatus.PENDING,
          });
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }
}

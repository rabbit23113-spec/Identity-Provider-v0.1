import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum OutboxStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SENT = 'sent',
}

export enum OutboxDomain {
  USER = 'user',
  SESSION = 'session',
  OAUTH = 'oauth',
  AUTH_CODE = 'auth_code',
}

export enum OutboxAction {
  CREATE = 'create',
  REVOKE = 'revoke',
  ROTATE = 'rotate',
  DELETE = 'delete',
}

@Entity()
export class OutboxRepository {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'idempotency_id',
    type: 'uuid',
    default: () => 'gen_random_uuid()',
  })
  idempotencyId: string;

  @Column({ enum: OutboxDomain })
  domain: OutboxDomain;

  @Column({ enum: OutboxAction })
  action: OutboxAction;

  @Column({ enum: OutboxStatus, default: OutboxStatus.PENDING })
  status: OutboxStatus;

  @Column({ type: 'jsonb' })
  payload: Record<string, any>;

  @Column({ name: 'processed_at', type: 'timestamp', nullable: true })
  processedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

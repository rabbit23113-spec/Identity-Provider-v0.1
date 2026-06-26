import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class SessionRepository {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'session_id',
    type: 'uuid',
    default: () => 'gen_random_uuid()',
  })
  sessionId: string;

  @Column({ name: "refresh_token_hash" })
  refreshTokenHash: string;

  @Column({ name: "expires_at", type: "datetime" })
  expiresAt: Date;

  @Column({ name: "revoked_at", type: "datetime", nullable: true })
  revokedAt: Date;

  @Column({ name: "rotated_at", type: "datetime", nullable: true })
  rotatedAt: Date;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}

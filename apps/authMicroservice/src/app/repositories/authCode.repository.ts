import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AuthCodeRepository {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  code: string;

  @Column({ name: "user_id" })
  userId: string;

  @Column({ name: "oauth_client_id" })
  oauthClientId: string;

  @Column({ name: "redirect_uri" })
  redirectUri: string;

  @Column({ name: "expires_at", type: "timestamptz" })
  expiresAt: Date;

  @Column({ name: "used_at", type: "timestamptz", default: Date.now() })
  used_at: Date;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}

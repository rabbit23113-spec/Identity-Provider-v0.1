import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class OauthRepository {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'client_id',
  })
  clientId: string;

  @Column({ name: 'client_secret_hash' })
  clientSecretHash: string;

  @Column()
  name: string;

  @Column({ name: 'redirect_uris', type: 'simple-array', default: [] })
  redirectUris: string[];

  @Column({ name: 'grant_types', type: 'simple-array', default: [] })
  grantTypes: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

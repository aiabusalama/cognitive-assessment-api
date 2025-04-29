import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Journal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  text: string;

  @Column('json') // Changed to jsonb for better Postgres support
  scores: Record<string, number>;

  @ManyToOne(() => User, user => user.journals)
  user: User;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}

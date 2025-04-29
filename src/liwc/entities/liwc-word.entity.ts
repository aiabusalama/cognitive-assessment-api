import { Entity, PrimaryColumn, Column, Index } from 'typeorm';

@Entity()
export class LiwcWord {
  @PrimaryColumn()
  word: string; // The actual word (primary key)

  @Column()
  @Index() // Add index for faster category lookups
  category: string; // e.g. 'positive_emotion'
}

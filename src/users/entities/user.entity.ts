import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { Journal } from '../../journals/entities/journal.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1, description: 'Unique identifier' })
  id: number;

  @Column({ unique: true })
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  email: string;

  @Column()
  password: string;

  @OneToMany(() => Journal, journal => journal.user)
  journals: Journal[];
  
  @CreateDateColumn()
  @ApiProperty({ 
    example: '2023-01-01T00:00:00.000Z', 
    description: 'Account creation date' 
  })
  createdAt: Date;
}

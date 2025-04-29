import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(email: string, password: string): Promise<User> {
    const existingUser = await this.usersRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({ email, password: hashedPassword });
    return this.usersRepository.save(user);
  }

  async findOne(email: string): Promise<User | null> {
    // remove all in usersRepository
    return this.usersRepository.findOne({ 
      where: { email },
      select: ['id', 'email', 'createdAt', 'password']
    });
  }

  async getUserProfile(userId: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'createdAt']
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}

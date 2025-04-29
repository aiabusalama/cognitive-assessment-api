import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConflictException, NotFoundException } from '@nestjs/common';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword',
    createdAt: new Date(),
    journals: []
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn().mockImplementation((dto) => dto),
            save: jest.fn().mockImplementation((user) => 
              Promise.resolve({ ...user, id: 1, createdAt: new Date() })
            ),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('create', () => {
    it('should create and return user with hashed password', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await service.create('new@example.com', 'password123');
      
      expect(result).toMatchObject({
        email: 'new@example.com',
        password: 'hashedPassword'
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException for duplicate email', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser);
      await expect(service.create('test@example.com', 'pass'))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('getUserProfile', () => {
    it('should return user profile', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser);
      
      const result = await service.getUserProfile(1);
      
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        createdAt: mockUser.createdAt,
        journals: [],
        password: "hashedPassword"
      });
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        select: ['id', 'email', 'createdAt']
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      await expect(service.getUserProfile(999))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return user with password for auth purposes', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser);
      
      const result = await service.findOne('test@example.com');
      
      expect(result).toEqual(mockUser);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        select: ['id', 'email', 'createdAt', 'password']
      });
    });
  });
});

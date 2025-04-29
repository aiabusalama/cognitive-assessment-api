import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';

describe('AuthController Integration', () => {
  let controller: AuthController;
  let authService: AuthService;
  let usersService: UsersService;

  // Complete User mock
  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: 'hashed',
    journals: [],
    createdAt: new Date(),
  };

  // Mock bcrypt at the module level
  jest.mock('bcrypt', () => ({
    compare: jest.fn().mockImplementation(() => true),
    hash: jest.fn().mockImplementation(() => 'hashedPassword'),
  }));

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        UsersService,
        JwtService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return access token with valid credentials', async () => {
      // Setup mocks
      jest.spyOn(authService, 'validateUser').mockResolvedValue({
        id: mockUser.id,
        email: mockUser.email,
      });
      
      jest.spyOn(authService, 'login').mockResolvedValue({ 
        access_token: 'mockToken' 
      });

      const result = await controller.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual({ access_token: 'mockToken' });
      expect(authService.validateUser).toHaveBeenCalledWith(
        'test@example.com',
        'password123'
      );
    });

    it('should throw UnauthorizedException with invalid credentials', async () => {
      jest.spyOn(authService, 'validateUser').mockRejectedValue(
        new UnauthorizedException('Invalid credentials')
      );

      await expect(controller.login({
        email: 'wrong@example.com',
        password: 'wrongpass',
      })).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should successfully register new user', async () => {
      jest.spyOn(authService, 'register').mockResolvedValue(undefined);

      const result = await controller.register({
        email: 'new@example.com',
        password: 'password123',
      });

      expect(result).toEqual({ message: 'Registration successful' });
    });

    it('should throw ConflictException for duplicate email', async () => {
      jest.spyOn(authService, 'register').mockRejectedValue(
        new ConflictException('Email already in use')
      );

      await expect(controller.register({
        email: 'existing@example.com',
        password: 'password123',
      })).rejects.toThrow(ConflictException);
    });
  });
});

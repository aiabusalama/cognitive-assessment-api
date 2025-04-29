import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { User } from '../users/entities/user.entity';

// Mock bcrypt at the module level
jest.mock('bcrypt', () => ({
  compare: jest.fn().mockImplementation(() => Promise.resolve(true)),
  hash: jest.fn().mockImplementation(() => Promise.resolve('hashedPassword'))
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let bcrypt: any;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword',
    journals: [],
    createdAt: new Date(),
  };

  beforeEach(async () => {
    bcrypt = await import('bcrypt');
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn().mockImplementation((email: string) => 
              email === mockUser.email ? Promise.resolve(mockUser) : Promise.resolve(null)
            ),
            create: jest.fn().mockImplementation(async (email: string, password: string) => {
              if (email === 'existing@example.com') {
                throw new ConflictException('Email already in use');
              }
              return { ...mockUser, email, password: await bcrypt.hash(password, 10) };
            }),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mockToken'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should call usersService.create with plain password and return hashed user', async () => {
      await service.register('new@example.com', 'password123');
      
      expect(usersService.create).toHaveBeenCalledWith(
        'new@example.com',
        'password123' // Now expecting the plain password
      );
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    });

    it('should throw ConflictException for duplicate email', async () => {
      await expect(service.register('existing@example.com', 'pass'))
        .rejects.toThrow(ConflictException);
    });
  });
});

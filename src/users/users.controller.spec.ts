import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ExecutionContext, NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from './entities/user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword',
    createdAt: new Date(),
    journals: []
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            getUserProfile: jest.fn().mockResolvedValue({
              id: mockUser.id,
              email: mockUser.email,
              createdAt: mockUser.createdAt
            }),
          },
        },
        {
          provide: Reflector,
          useValue: {},
        },
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({
      canActivate: (context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        req.user = mockUser;
        return true;
      },
    })
    .compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  describe('getProfile', () => {
    it('should return user profile without sensitive data', async () => {
      const result = await controller.getProfile(mockUser);
      
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        createdAt: mockUser.createdAt
      });
      expect(service.getUserProfile).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw if user not found', async () => {
      jest.spyOn(service, 'getUserProfile').mockRejectedValue(
        new NotFoundException('User not found')
      );
      await expect(controller.getProfile(mockUser))
        .rejects.toThrow(NotFoundException);
    });
  });
});

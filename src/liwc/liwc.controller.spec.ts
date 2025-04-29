import { Test, TestingModule } from '@nestjs/testing';
import { LiwcController } from './liwc.controller';
import { LiwcService } from './liwc.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

describe('LiwcController', () => {
  let controller: LiwcController;
  let service: LiwcService;

  const mockDictionary = {
    positive_emotion: ['happy', 'joy'],
    negative_emotion: ['sad', 'angry']
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LiwcController],
      providers: [
        {
          provide: LiwcService,
          useValue: {
            updateDictionary: jest.fn().mockResolvedValue(undefined),
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
        return true;
      },
    })
    .compile();

    controller = module.get<LiwcController>(LiwcController);
    service = module.get<LiwcService>(LiwcService);
  });

  describe('updateDictionary', () => {
    it('should update dictionary successfully', async () => {
      const result = await controller.updateDictionary(mockDictionary);
      
      expect(result).toEqual({ message: 'Dictionary updated successfully' });
      expect(service.updateDictionary).toHaveBeenCalledWith(mockDictionary);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { JournalsController } from './journals.controller';
import { JournalsService } from './journals.service';
import { CreateJournalDto } from './dto/create-journal.dto';
import { User } from '../users/entities/user.entity';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

describe('JournalsController', () => {
  let controller: JournalsController;
  let service: JournalsService;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: 'hashed',
    journals: [],
    createdAt: new Date(),
  };

  const mockJournal = {
    id: 1,
    text: 'Test journal',
    scores: { positive: 1 },
    userId: 1,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JournalsController],
      providers: [
        {
          provide: JournalsService,
          useValue: {
            createJournal: jest.fn().mockResolvedValue(mockJournal),
            getScores: jest.fn().mockResolvedValue(mockJournal.scores),
            getUserJournals: jest.fn().mockResolvedValue([mockJournal]),
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

    controller = module.get<JournalsController>(JournalsController);
    service = module.get<JournalsService>(JournalsService);
  });

  describe('getAllJournals', () => {
    it('should return user journals', async () => {
      const result = await controller.getAllJournals(mockUser);
      expect(result).toEqual([mockJournal]);
      expect(service.getUserJournals).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('create', () => {
    it('should create a journal', async () => {
      const createDto: CreateJournalDto = { text: 'Test journal' };
      const result = await controller.create(mockUser, createDto);
      
      expect(result).toEqual(mockJournal);
      expect(service.createJournal).toHaveBeenCalledWith(
        mockUser.id,
        createDto.text
      );
    });
  });

  describe('getScore', () => {
    it('should return journal scores', async () => {
      const result = await controller.getScore(mockUser, 1);
      expect(result).toEqual(mockJournal.scores);
      expect(service.getScores).toHaveBeenCalledWith(mockUser.id, 1);
    });

    it('should throw if journal not found', async () => {
      jest.spyOn(service, 'getScores').mockRejectedValue(
        new NotFoundException('Journal not found')
      );
      await expect(controller.getScore(mockUser, 999))
        .rejects.toThrow(NotFoundException);
    });
  });
});

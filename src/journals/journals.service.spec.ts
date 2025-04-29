import { Test, TestingModule } from '@nestjs/testing';
import { JournalsService } from './journals.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Journal } from './entities/journal.entity';
import { LiwcService } from '../liwc/liwc.service';
import { NotFoundException } from '@nestjs/common';

describe('JournalsService', () => {
  let service: JournalsService;
  let journalRepo: any;
  let liwcService: LiwcService;

  const mockJournal = {
    id: 1,
    text: 'Test entry',
    scores: { positive: 3 },
    userId: 1,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JournalsService,
        {
          provide: getRepositoryToken(Journal),
          useValue: {
            create: jest.fn().mockImplementation((dto) => dto),
            save: jest.fn().mockImplementation((journal) => 
              Promise.resolve({ ...journal, id: 1, createdAt: new Date() })
            ),
            find: jest.fn().mockResolvedValue([mockJournal]),
            findOne: jest.fn().mockImplementation((options) => 
              options.where.id === 1 ? Promise.resolve(mockJournal) : Promise.resolve(null)
            ),
          },
        },
        {
          provide: LiwcService,
          useValue: {
            analyzeText: jest.fn().mockResolvedValue({ positive: 3 }),
            getCategories: jest.fn().mockResolvedValue(['positive']),
          },
        },
      ],
    }).compile();

    service = module.get<JournalsService>(JournalsService);
    journalRepo = module.get(getRepositoryToken(Journal));
    liwcService = module.get<LiwcService>(LiwcService);
  });

  describe('createJournal', () => {
    it('should create and return a journal with LIWC scores', async () => {
      const result = await service.createJournal(1, 'Test entry');
      
      expect(result).toMatchObject({
        text: 'Test entry',
        scores: { positive: 3 },
        user: { id: 1 }
      });
      expect(liwcService.analyzeText).toHaveBeenCalledWith('Test entry');
      expect(journalRepo.save).toHaveBeenCalled();
    });
  });

  describe('getScores', () => {
    it('should return journal scores', async () => {
      const result = await service.getScores(1, 1);
      expect(result).toEqual(mockJournal.scores);
    });

    it('should throw if journal not found', async () => {
      await expect(service.getScores(1, 999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserJournals', () => {
    it('should return user journals sorted by date', async () => {
      const result = await service.getUserJournals(1);
      expect(result).toEqual([mockJournal]);
      expect(journalRepo.find).toHaveBeenCalledWith({
        where: { user: { id: 1 } },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('getAvailableCategories', () => {
    it('should return LIWC categories', async () => {
      const result = await service.getAvailableCategories();
      expect(result).toEqual(['positive']);
    });
  });
});

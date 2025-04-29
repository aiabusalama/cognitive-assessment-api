import { Test, TestingModule } from '@nestjs/testing';
import { LiwcService } from './liwc.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LiwcWord } from './entities/liwc-word.entity';
import { InsertQueryBuilder, Repository } from 'typeorm';

describe('LiwcService', () => {
  let service: LiwcService;
  let repository: Repository<LiwcWord>;

  const mockDictionary = {
    positive_emotion: ['happy', 'joy'],
    negative_emotion: ['sad', 'angry']
  };

  beforeEach(async () => {
    // Mock for analyzeText query
    const selectQueryBuilderMock = {
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([
        { category: 'positive_emotion', count: '2' },
        { category: 'negative_emotion', count: '1' }
      ]),
      getMany: jest.fn().mockResolvedValue([  // Add this line
        { word: 'happy', category: 'positive_emotion' },
        { word: 'sad', category: 'negative_emotion' }
      ]),
    };

    // Mock for getCategories query
    const categoriesQueryBuilderMock = {
      select: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([
        { category: 'positive_emotion' },
        { category: 'negative_emotion' }
      ]),
    };

    // Mock for insert operations
    const insertQueryBuilderMock = {
      insert: jest.fn().mockReturnThis(),
      into: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LiwcService,
        {
          provide: getRepositoryToken(LiwcWord),
          useValue: {
            clear: jest.fn().mockResolvedValue(undefined),
            createQueryBuilder: jest.fn().mockImplementation((method) => {
              if (method === 'insert') {
                return insertQueryBuilderMock;
              }
              if (method === 'categories') {
                return categoriesQueryBuilderMock;
              }
              return selectQueryBuilderMock;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<LiwcService>(LiwcService);
    repository = module.get<Repository<LiwcWord>>(getRepositoryToken(LiwcWord));
  });

  describe('analyzeText', () => {
    it('should return LIWC scores for text', async () => {
      const result = await service.analyzeText('I feel happy but also sad');
      
      expect(result).toEqual({
        positive_emotion: 1,
        negative_emotion: 1,
        social: 0,
        cognitive: 0
      });
    
      // Verify query builder was called correctly
      const qb = repository.createQueryBuilder();
      expect(qb.where).toHaveBeenCalledWith('word.word IN (:...words)', {
        words: ['i', 'feel', 'happy', 'but', 'also', 'sad']
      });
    });
  });

  describe('getCategories', () => {
    it('should return all categories', async () => {
      const result = await service.getCategories();
      expect(result).toEqual(['positive_emotion', 'negative_emotion']);
    });
  });
  // TODO: Add tests for updateDictionary
});

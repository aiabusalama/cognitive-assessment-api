import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Journal } from './entities/journal.entity';
import { LiwcService } from '../liwc/liwc.service';

@Injectable()
export class JournalsService {
  constructor(
    @InjectRepository(Journal)
    private journalsRepository: Repository<Journal>,
    private liwcService: LiwcService,
  ) {}

  async createJournal(userId: number, text: string): Promise<Journal> {
    const scores = await this.liwcService.analyzeText(text);
    
    const journal = this.journalsRepository.create({
      text,
      scores,
      user: { id: userId }
    });
    return this.journalsRepository.save(journal);
  }

  async getScores(userId: number, journalId: number): Promise<Record<string, number>> {
    const journal = await this.journalsRepository.findOne({
      where: { id: journalId, user: { id: userId } },
    });
    if (!journal) throw new NotFoundException('Journal not found');
    return journal.scores;
  }

  async getUserJournals(userId: number): Promise<Journal[]> {
    return this.journalsRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async getAvailableCategories(): Promise<string[]> {
    return this.liwcService.getCategories();
  }
}

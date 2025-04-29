import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LiwcWord } from './entities/liwc-word.entity';

@Injectable()
export class LiwcService {
  constructor(
    @InjectRepository(LiwcWord)
    private readonly liwcWordRepository: Repository<LiwcWord>,
  ) { }

  // looks very optimized, but doesn't handle repeated words!
  // async analyzeText(text: string): Promise<Record<string, number>> {
  //   const words = text.toLowerCase().split(/\W+/).filter(Boolean);

  //   // Single optimized query
  //   const matches = await this.liwcWordRepository
  //     .createQueryBuilder('word')
  //     .select('word.category, COUNT(*) as count')
  //     .where('word.word IN (:...words)', { words })
  //     .groupBy('word.category')
  //     .getRawMany();

  //   // Initialize all categories with 0 counts
  //   const categories = await this.getCategories();
  //   const scores = Object.fromEntries(categories.map(cat => [cat, 0]));
  //   console.log({})
  //   // Update scores with matches
  //   matches.forEach(match => {
  //     scores[match.category] = parseInt(match.count);
  //   });

  //   return scores;
  // }
  // handles repeated words, but looks very complicated!!

  async analyzeText(text: string): Promise<Record<string, number>> {
    // Predefined categories avoid initial DB call
    const scores = {
      positive_emotion: 0,
      negative_emotion: 0,
      social: 0,
      cognitive: 0
    };

    // Fast empty check and return
    if (!text?.trim()) return scores;

    // tokenization
    const words = text.toLowerCase().match(/[a-z']+/g) ?? [];
    if (!words.length) return scores;

    // word counting
    const wordCounts = new Map<string, number>();
    const uniqueWords = new Set<string>();

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
      uniqueWords.add(word);
    }

    const matches = await this.liwcWordRepository
      .createQueryBuilder('word')
      .select(['word.word', 'word.category'])
      .where('word.word IN (:...words)', { words: Array.from(uniqueWords) })
      .getMany();

    // Fast score accumulation
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      scores[match.category] += wordCounts.get(match.word) || 0;
    }
    return scores;
  }


  async getCategories(): Promise<string[]> {
    return this.liwcWordRepository
      .createQueryBuilder()
      .select('DISTINCT category')
      .getRawMany()
      .then(result => result.map(item => item.category));
  }

  async getDictionary(): Promise<Record<string, string[]>> {
    try {
      const wordsByCategory = await this.liwcWordRepository
        .createQueryBuilder('word')
        .select('word.category', 'category')
        .addSelect('GROUP_CONCAT(word.word)', 'words')
        .groupBy('word.category')
        .getRawMany();

      const dictionary: Record<string, string[]> = {};
      wordsByCategory.forEach(row => {
        dictionary[row.category] = row.words ? row.words.split(',') : [];
      });

      return dictionary;
    } catch (error) {
      console.error(new Error('Error fetching LIWC dictionary: ' + error.message));
      throw error;
    }
  }

  async updateDictionary(categories: Record<string, string[]>): Promise<void> {
    // Clear existing data
    await this.liwcWordRepository.clear();
    // Prepare batch insert with proper typing
    const wordsToInsert: Partial<LiwcWord>[] = [];
    for (const [category, wordList] of Object.entries(categories)) {
      for (const word of wordList) {
        wordsToInsert.push({
          word: word.toLowerCase(),
          category
        });
      }
    }

    // Batch insert all words
    await this.liwcWordRepository
      .createQueryBuilder()
      .insert()
      .into(LiwcWord)
      .values(wordsToInsert)
      .execute();
  }
}
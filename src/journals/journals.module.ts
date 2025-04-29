import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JournalsController } from './journals.controller';
import { JournalsService } from './journals.service';
import { Journal } from './entities/journal.entity';
import { LiwcModule } from '../liwc/liwc.module'; // Import LIWC module

@Module({
  imports: [
    TypeOrmModule.forFeature([Journal]),
    LiwcModule, // Import LIWC module to access its service
  ],
  controllers: [JournalsController],
  providers: [JournalsService],
})
export class JournalsModule {}

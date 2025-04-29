import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiwcService } from './liwc.service';
import { LiwcWord } from './entities/liwc-word.entity';
import { LiwcController } from './liwc.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LiwcWord])],
  controllers: [LiwcController],
  providers: [LiwcService],
  exports: [LiwcService], // Important: Export service for JournalsModule
})
export class LiwcModule {}

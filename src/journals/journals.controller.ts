import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { JournalsService } from './journals.service';
import { CreateJournalDto } from './dto/create-journal.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Journals')
@ApiBearerAuth()
@Controller('journals')
@UseGuards(JwtAuthGuard)
export class JournalsController {
  constructor(private readonly journalsService: JournalsService) {}

  @Get() // Add this endpoint to get all journals for the authenticated user
  @ApiOperation({ summary: 'Get all journal entries for the current user' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns all journal entries for the user, sorted by creation date (newest first)' 
  })
  getAllJournals(
    @GetUser() user: User,
  ) {
    return this.journalsService.getUserJournals(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a single journal entry' })
  @ApiResponse({ 
    status: 201, 
    description: 'Journal created with LIWC analysis' 
  })
  create(
    @GetUser() user: User,
    @Body() createJournalDto: CreateJournalDto,
  ) {
    return this.journalsService.createJournal(user.id, createJournalDto.text);
  }

  @Get(':id/score')
  @ApiOperation({ summary: 'Get LIWC scores for a journal' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns the LIWC analysis scores' 
  })
  getScore(
    @GetUser() user: User,
    @Param('id') id: number,
  ) {
    return this.journalsService.getScores(user.id, id);
  }
}
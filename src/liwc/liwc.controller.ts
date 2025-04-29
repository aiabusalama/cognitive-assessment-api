import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { LiwcService } from './liwc.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('LIWC Dictionary')
@ApiBearerAuth()
@Controller('liwc-dictionary')
@UseGuards(JwtAuthGuard) // for production - Admin role is needed!
export class LiwcController {
  constructor(private readonly liwcService: LiwcService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get current LIWC dictionary', 
    description: 'Returns the current LIWC dictionary categories and words' 
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the full dictionary',
    schema: {
      example: {
        positive_emotion: ['happy', 'joy'],
        negative_emotion: ['sad', 'angry'],
        cognitive_processes: ['think', 'know'],
      }
    }
  })
  async getDictionary() {
    return this.liwcService.getDictionary();
  }

  @Post('update')
  @ApiOperation({ summary: 'Update LIWC dictionary categories' })
  @ApiBody({
    description: 'Dictionary in category-wordlist format',
    examples: {
      fullDictionary: {
        value: {
          positive_emotion: ['happy', 'joy'],
          negative_emotion: ['sad', 'angry']
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Dictionary updated successfully',
    schema: {
      example: {
        message: 'Dictionary updated successfully'
      }
    }
  })
  async updateDictionary(@Body() categories: Record<string, string[]>) {
    await this.liwcService.updateDictionary(categories);
    return { message: 'Dictionary updated successfully' };
  }
}
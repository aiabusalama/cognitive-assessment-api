import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateJournalDto {
  @ApiProperty({
    example: 'Today I felt happy and excited about my project',
    description: 'The journal entry text content'
  })
  @IsString()
  @IsNotEmpty()
  text: string;
}

import { IsArray, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class JournalEntryDto {
  @IsString()
  text: string;
}

export class CreateJournalsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JournalEntryDto)
  entries: JournalEntryDto[];
}

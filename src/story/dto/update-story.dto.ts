import { IsOptional, IsString, IsNumber, IsArray } from 'class-validator';

export class UpdateStoryDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  style?: string;

  @IsOptional()
  @IsString()
  genre?: string;

  @IsOptional()
  @IsArray()
  characters?: { name: string }[];

  @IsOptional()
  @IsString()
  beginning?: string;

  @IsOptional()
  @IsNumber()
  chapterCount?: number;

  @IsOptional()
  @IsString()
  voiceId?: string;

  @IsOptional()
  generatedStory?: any[];
}

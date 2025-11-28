import { Module } from '@nestjs/common';
import { StoryService } from './story.service';
import { StoryGeneratorUtil } from '../common/utils/story-generator.util';
import { StoryController } from './story.controller';

@Module({
  providers: [StoryService, StoryGeneratorUtil],
  controllers: [StoryController],
  exports: [StoryService],
})
export class StoryModule {}

import { Module } from '@nestjs/common';
import { StoryService } from './story.service';
import { StoryGeneratorUtil } from '../common/utils/story-generator.util';

@Module({
  providers: [StoryService, StoryGeneratorUtil],
  exports: [StoryService],
})
export class StoryModule {}

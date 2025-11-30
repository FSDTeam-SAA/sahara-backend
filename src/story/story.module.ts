import { Module } from '@nestjs/common';
import { StoryService } from './story.service';
import { StoryGeneratorUtil } from '../common/utils/story-generator.util';
import { StoryController } from './story.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { StoryInfo, StoryInfoSchema } from './storyInfo.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StoryInfo.name, schema: StoryInfoSchema },
    ]),
  ],
  providers: [StoryService, StoryGeneratorUtil],
  controllers: [StoryController],
  exports: [StoryService],
})
export class StoryModule {}

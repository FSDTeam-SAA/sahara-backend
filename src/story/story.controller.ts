import { Controller, Post, Body } from '@nestjs/common';
import { StoryService } from './story.service';

@Controller('story')
export class StoryController {
  constructor(private readonly storyService: StoryService) {}

  @Post('generate')
  async generateStory(@Body() body: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.storyService.createStory(body);
  }
}

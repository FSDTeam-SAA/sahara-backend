import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { StoryService } from './story.service';
import { UpdateStoryDto } from './dto/update-story.dto';
@Controller('story')
export class StoryController {
  constructor(private readonly storyService: StoryService) { }

  @Post('generate')
  async generateStory(@Body() body: any) {
    return this.storyService.createStory(body);
  }

  @Get('user/:id')
  async getStoriesByUser(
    @Param('id') id: string,
    @Query('search') search?: string,
  ) {
    return this.storyService.getStoriesByUser(id, search);
  }

  @Get(':id')
  async getStoryById(@Param('id') id: string) {
    return this.storyService.getStoryById(id);
  }

  @Put(':id')
  async updateStory(@Param('id') id: string, @Body() payload: UpdateStoryDto) {
    return this.storyService.updateStory(id, payload);
  }

  @Delete(':id')
  async deleteStory(@Param('id') id: string) {
    return this.storyService.deleteStory(id);
  }
}

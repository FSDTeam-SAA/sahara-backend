import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VoiceService } from './voice.service';
import { StoryService } from '../story/story.service';

@Controller('voice')
export class VoiceController {
  constructor(
    private readonly voiceService: VoiceService,
    private readonly storyService: StoryService,
  ) {}

  @Post('tts/:storyId/:chapter')
  async tts(
    @Param('storyId') storyId: string,
    @Param('chapter') chapter: string,
    @Body() body: { text: string; voiceId?: string },
  ) {
    const chapterNumber = Number(chapter);
    const result = await this.voiceService.generateSpeech(
      body.text,
      body.voiceId,
      storyId,
      chapterNumber,
    );
    return { audioUrl: result?.url ?? null };
  }

  @Post('clone/:storyId')
  @UseInterceptors(FileInterceptor('file'))
  async clone(
    @Param('storyId') storyId: string,
    @UploadedFile() file?: { buffer: Buffer; originalname?: string },
  ) {
    const voiceId = await this.voiceService.cloneVoice(file);
    if (voiceId || storyId) {
      await this.storyService.setVoiceId(storyId, voiceId);
      // Fetch the story and generate audio for all chapters sequentially
      const story = await this.storyService.getStoryById(storyId);
      if (story && Array.isArray(story.generatedStory)) {
        for (const ch of story.generatedStory) {
          try {
            // ch.chapter is the chapter number and ch.text is the text to speak
            await this.voiceService.generateSpeech(
              ch.text,
              voiceId,
              storyId,
              ch.chapter,
            );
          } catch (err) {
            // swallow per-chapter errors so others continue; consider logging
            // eslint-disable-next-line no-console
            console.error('Error generating chapter audio', err);
          }
        }
      }
    }
    return { voiceId };
  }
}

import { Injectable } from '@nestjs/common';
import { ElevenLabsUtil } from '../common/utils/elevenlabs.util';
import cloudinary from '../common/cloudinary';
import { StoryService } from '../story/story.service';

@Injectable()
export class VoiceService {
  constructor(
    private readonly eleven: ElevenLabsUtil,
    private readonly storyService: StoryService,
  ) {}

  /**
   * Generate speech and optionally upload to Cloudinary and save URL
   * to the StoryInfo chapter if storyId and chapterNumber are provided.
   */
  async generateSpeech(
    text: string,
    voiceId?: string,
    storyId?: string,
    chapterNumber?: number,
  ) {
    const audio = await this.eleven.synthesizeVoiceFromText(text, voiceId);
    if (!audio) return null;

    // upload to Cloudinary using base64 data URL
    const base64 = audio.toString('base64');
    const dataUri = `data:audio/mpeg;base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      resource_type: 'auto',
      folder: 'stories',
    });

    const url = result.secure_url || result.url || null;

    if (storyId && chapterNumber && url) {
      await this.storyService.setChapterAudioUrl(storyId, chapterNumber, url);
    }

    return { url, raw: audio };
  }

  async cloneVoice(file) {
    const voiceId = await this.eleven.cloneVoiceFromUpload(file);
    return voiceId;
  }
}

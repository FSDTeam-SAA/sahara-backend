import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VoiceService } from './voice.service';

@Controller('voice')
export class VoiceController {
  constructor(private readonly voiceService: VoiceService) {}

  @Post('tts')
  async tts(@Body() body: { text: string; voiceId?: string }) {
    const audioBytes = await this.voiceService.generateSpeech(
      body.text,
      body.voiceId,
    );
    // audioBytes may be null — return empty string or handle as error upstream
    return { audio: audioBytes ? audioBytes.toString('base64') : '' }; // for returning in JSON
  }

  @Post('clone')
  @UseInterceptors(FileInterceptor('file'))
  async clone(
    @UploadedFile() file?: { buffer: Buffer; originalname?: string },
  ) {
    return this.voiceService.cloneVoice(file);
  }
}

import { Injectable } from '@nestjs/common';
import { ElevenLabsUtil } from '../common/utils/elevenlabs.util';

@Injectable()
export class VoiceService {
  constructor(private readonly eleven: ElevenLabsUtil) {}

  async generateSpeech(text: string, voiceId?: string) {
    return this.eleven.synthesizeVoiceFromText(text, voiceId);
  }

  async cloneVoice(file) {
    const voiceId = await this.eleven.cloneVoiceFromUpload(file);
    return { voiceId };
  }
}

import { Module } from '@nestjs/common';
import { VoiceController } from './voice.controller';
import { VoiceService } from './voice.service';
import { ElevenLabsUtil } from '../common/utils/elevenlabs.util';
import { StoryModule } from '../story/story.module';

@Module({
  imports: [StoryModule],
  controllers: [VoiceController],
  providers: [VoiceService, ElevenLabsUtil],
  exports: [ElevenLabsUtil],
})
export class VoiceModule {}

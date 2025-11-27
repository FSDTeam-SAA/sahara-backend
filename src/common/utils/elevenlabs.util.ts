import { Injectable } from '@nestjs/common';
import { config } from 'dotenv';
import { ElevenLabsClient } from 'elevenlabs';
import { Readable } from 'stream';

config();

@Injectable()
export class ElevenLabsUtil {
  private client: ElevenLabsClient;

  constructor() {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      throw new Error('ELEVENLABS_API_KEY not set in environment');
    }

    this.client = new ElevenLabsClient({ apiKey });
  }

  // -----------------------------------------------------
  // Normalize audio output to raw bytes (Buffer)
  // -----------------------------------------------------
  async normalizeAudioOutput(
    audio: AsyncIterable<Buffer> | Readable,
  ): Promise<Buffer | null> {
    if (!audio) return null;

    // Case: already a Buffer / Uint8Array
    if (Buffer.isBuffer(audio)) return audio;
    if (audio instanceof Uint8Array) return Buffer.from(audio);

    // Case: Readable stream
    if (audio instanceof Readable) {
      const chunks: Buffer[] = [];
      for await (const chunk of audio) {
        chunks.push(
          Buffer.isBuffer(chunk)
            ? chunk
            : (Buffer.from(chunk) as Buffer<ArrayBufferLike>),
        );
      }
      return Buffer.concat(chunks);
    }

    // Case: iterable (async generator)
    if (audio[Symbol.asyncIterator]) {
      const chunks: Buffer[] = [];
      for await (const chunk of audio) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      return Buffer.concat(chunks);
    }

    // Fallback
    try {
      const chunks: Buffer[] = [];
      for await (const chunk of audio) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      return Buffer.concat(chunks);
    } catch (err) {
      throw new Error(`Unable to normalize audio object: ${err}`);
    }
  }

  // -----------------------------------------------------
  // Text → Speech (TTS)
  // -----------------------------------------------------
  async synthesizeVoiceFromText(
    text: string,
    voiceId = 'JBFqnCBsd6RMkjVDRZzb',
  ): Promise<Buffer> {
    try {
      const response = await this.client.textToSpeech.convert({
        text,
        voiceId,
        modelId: 'eleven_multilingual_v2',
        outputFormat: 'mp3_44100_128',
      });

      return await this.normalizeAudioOutput(response);
    } catch (customError: unknown) {
      if (
        typeof customError === 'object' &&
        customError !== null &&
        'message' in customError
      ) {
        throw new Error(`Error generating voice: ${customError.message}`);
      } else {
        throw new Error('An unknown error occurred');
      }
    }
  }

  // -----------------------------------------------------
  // Clone a voice from uploaded file
  // -----------------------------------------------------
  async cloneVoiceFromUpload(file: Express.Multer.File): Promise<string> {
    if (!file) {
      return 'JBFqnCBsd6RMkjVDRZzb'; // default voice
    }

    try {
      const fileBuffer = file.buffer;

      const result = await this.client.voices.ivc.create({
        name: 'My Voice Clone',
        files: [fileBuffer],
      });

      return result.voiceId;
    } catch (error: any) {
      throw new Error(`Error cloning voice: ${error.message}`);
    }
  }
}

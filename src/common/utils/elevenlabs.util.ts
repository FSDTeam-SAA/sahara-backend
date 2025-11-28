import { Injectable } from '@nestjs/common';
import { config } from 'dotenv';
import { ElevenLabsClient } from 'elevenlabs';
import { Readable } from 'node:stream';

type ElevenLabsLike = {
  textToSpeech: {
    convert: (voiceId: string, request: unknown) => Promise<Readable>;
  };
  voices: {
    add: (request: unknown) => Promise<Record<string, unknown> | null>;
  };
};

config();

@Injectable()
export class ElevenLabsUtil {
  private readonly client: ElevenLabsClient;

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

    // Already a Buffer / Uint8Array
    if (Buffer.isBuffer(audio)) return audio;
    if (audio instanceof Uint8Array) return Buffer.from(audio);

    // Otherwise treat as an async iterable / readable stream and collect chunks.
    const chunks: Buffer[] = [];
    try {
      for await (const chunk of audio as AsyncIterable<
        Buffer | Uint8Array | string | ArrayBuffer
      >) {
        if (Buffer.isBuffer(chunk)) {
          chunks.push(chunk);
        } else if (chunk instanceof Uint8Array) {
          chunks.push(Buffer.from(chunk));
        } else if (typeof chunk === 'string') {
          chunks.push(Buffer.from(chunk));
        } else if (chunk instanceof ArrayBuffer) {
          chunks.push(Buffer.from(new Uint8Array(chunk)));
        } else {
          // As a last fallback, coerce to Buffer via string conversion
          chunks.push(Buffer.from(String(chunk)));
        }
      }
      return Buffer.concat(chunks);
    } catch (err) {
      throw new Error(
        `Unable to normalize audio object: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  // -----------------------------------------------------
  // Text → Speech (TTS)
  // -----------------------------------------------------
  async synthesizeVoiceFromText(
    text: string,
    voiceId = 'JBFqnCBsd6RMkjVDRZzb',
  ): Promise<Buffer | null> {
    try {
      // Convert signature is convert(voiceId, request)
      const request = {
        text,
        model_id: 'eleven_multilingual_v2',
        output_format: 'mp3_44100_128',
      } as unknown;
      const client = this.client as unknown as ElevenLabsLike;
      const response = await client.textToSpeech.convert(voiceId, request);

      return await this.normalizeAudioOutput(response);
    } catch (customError: unknown) {
      if (customError instanceof Error) {
        throw new Error(`Error generating voice: ${customError.message}`);
      } else {
        throw new Error('An unknown error occurred');
      }
    }
  }

  // -----------------------------------------------------
  // Clone a voice from uploaded file
  // -----------------------------------------------------
  async cloneVoiceFromUpload(
    file: { buffer: Buffer; originalname?: string } | undefined,
  ): Promise<string> {
    if (!file) {
      return 'JBFqnCBsd6RMkjVDRZzb'; // default voice
    }
    console.log(1);

    try {
      const fileBuffer = file.buffer;
      const stream = Readable.from(fileBuffer);

      // Add a voice (create a voice clone) using the client — `add` accepts files as readable streams.
      const addReq = {
        name: file.originalname || 'My Voice Clone',
        files: [stream],
      } as unknown;
      const client2 = this.client as unknown as ElevenLabsLike;
      const result = await client2.voices.add(addReq);
      console.log(2, client2, result);

      const typed = result as unknown;
      if (typeof typed === 'object' && typed !== null) {
        const r = typed as Record<string, unknown>;
        const maybeVoiceId = r['voiceId'] || r['voice_id'] || r['id'];
        if (typeof maybeVoiceId === 'string') return maybeVoiceId;
      }
      return '';
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Error cloning voice: ${error.message}`);
      }
      throw new Error('An unknown error occurred while cloning voice');
    }
  }
}

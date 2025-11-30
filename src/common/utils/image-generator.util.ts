import { Injectable } from '@nestjs/common';
import { config } from 'dotenv';
import OpenAI from 'openai';

config();

@Injectable()
export class ImageGeneratorUtil {
  private readonly client: OpenAI;

  constructor() {
    const apiKey = process.env.GROK_API_KEY;
    if (!apiKey) {
      throw new Error('GROK_API_KEY not set in environment');
    }

    this.client = new OpenAI({
      apiKey,
      baseURL: 'https://api.x.ai/v1',
    });
  }

  // ------------- Genarate Image-------------
  async generateImageFromPrompt(prompt: string): Promise<string> {
    try {
      const resp = await this.client.images.generate({
        model: 'grok-2-image',
        prompt,
      });

      // The OpenAI images response may include a hosted `url` or a `b64_json` payload.
      const item = resp.data?.[0];
      if (!item) return '';
      if ('url' in item && item.url) return item.url;
      if ('b64_json' in item && item.b64_json)
        return `data:image/png;base64,${item.b64_json}`;
      return '';
    } catch (error: unknown) {
      console.error('Error generating image', error);
      if (error instanceof Error) {
        throw new Error(`Failed to generate image: ${error.message}`);
      }
      throw new Error('Failed to generate image');
    }
  }

  // Build Ghibli-style prompt
  // ------- Build Ghibli-style Prompt -------
  cartoonizeCharacterPrompt(name: string, uploadedImageUrl?: string): string {
    let base = `Create a Studio Ghibli style character illustration of ${name}. 
Use soft colors, expressive eyes, detailed shading, and a warm cinematic atmosphere. 
Make it resemble an original Ghibli movie frame. 
Character should look friendly and storybook-appropriate.`;

    if (uploadedImageUrl) {
      base += ` Use this reference image to match the face and appearance accurately: ${uploadedImageUrl}.`;
    }

    return base;
  }
}

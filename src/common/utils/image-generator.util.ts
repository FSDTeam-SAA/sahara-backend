import { Inject, Injectable } from '@nestjs/common';
import { config } from 'dotenv';
import OpenAI from 'openai';

config();

@Injectable()
export class ImageGeneratorUtil {
  private client: OpenAI;

  constructor() {
    const apikey = process.env.GROK_API_KEY;
    if (!apiKey) {
      throw new Error('GROK_API_KEY not set in environment');
    }

    this.client = new OpenAI({
      apikey,
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

      return resp.data?.[0]?
    } catch (error) {
        console.error('Error generating image', error)
        throw new Error(`Failed to generate image ${error.message}`)
    }
  }

  // Build Ghibli-style prompt
   // ------- Build Ghibli-style Prompt -------
  cartoonizeCharacterPrompt(name: string, uploadedFilename?: string): string {
    let base = `Create a Studio Ghibli style character illustration of ${name}. 
Use soft colors, expressive eyes, detailed shading, and a warm cinematic atmosphere. 
Make it look like an original Ghibli movie frame. 
Character should look friendly and storybook-appropriate.`;

    if (uploadedFilename) {
      base += ` Use the uploaded reference photo "${uploadedFilename}" to match the face, hair style, and appearance accurately.`;
    }

    return base;
}
}
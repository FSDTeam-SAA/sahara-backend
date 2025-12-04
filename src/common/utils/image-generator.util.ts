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

  // ------------- Analyze Image with Vision (Grok-2-1212) ----------
  async analyzeImageWithVision(imageUrl: string): Promise<string> {
    try {
      console.log('Analyzing image with vision:', imageUrl);

      const response = await this.client.chat.completions.create({
        model: 'grok-2-vision-1212',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Briefly describe this person's appearance for character generation. Include gender, face shape, eye color, hair color, body shape, Image angle, skin tone, hair style and any other distinctive features. Be concise.`,
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 150,
      });

      const description =
        response.choices?.[0]?.message?.content || 'No description available';
      console.log('Vision Analysis:', description);
      return description;
    } catch (error: unknown) {
      console.error('Error analyzing image with vision', error);
      if (error instanceof Error) {
        throw new Error(`Failed to analyze image: ${error.message}`);
      }
      throw new Error('Failed to analyze image');
    }
  }

  // ------------- Generate Image-------------
  async generateImageFromPrompt(prompt: string): Promise<string> {
    try {
      console.log('promt', prompt);
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

  // Build Ghibli-style prompt with character description
  // ------- Build Ghibli-style Prompt with Vision Analysis -------
  cartoonizeCharacterPrompt(
    name: string,
    characterDescription?: string,
  ): string {
    console.log('Character Description', characterDescription);

    let prompt = `cartoon character of ${name}. ${characterDescription || ''} Soft colors, expressive eyes, warm atmosphere, friendly appearance for children.`;

    // Ensure prompt doesn't exceed 1024 characters
    if (prompt.length > 1024) {
      prompt = prompt.substring(0, 1020) + '...';
    }

    console.log('Final Prompt Length:', prompt.length);
    return prompt;
  }
}

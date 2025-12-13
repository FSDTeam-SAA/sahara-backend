import { Injectable } from '@nestjs/common';
import { config } from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

config();

@Injectable()
export class ImageGeneratorUtil {
  private readonly client: GoogleGenerativeAI;
  private readonly MODEL_NAME = 'gemini-2.0-flash-exp';

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not set in environment');
    }

    this.client = new GoogleGenerativeAI(apiKey);
  }

  // ------------- Analyze Image with Vision (Gemini) ----------
  async analyzeImageWithVision(imageUrl: string): Promise<string> {
    try {
      console.log('Analyzing image with vision:', imageUrl);

      // Fetch the image from URL
      const imageResponse = await fetch(imageUrl);
      const imageBuffer = await imageResponse.arrayBuffer();
      const imageBase64 = Buffer.from(imageBuffer).toString('base64');

      const prompt = `Briefly describe this person's appearance for character generation. Include gender, face shape, eye color, hair color, body shape, Image angle, skin tone, hair style and any other distinctive features. Be concise.`;

      const model = this.client.getGenerativeModel({ model: this.MODEL_NAME });
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: imageBase64,
          },
        },
      ]);
      const response = result.response;

      const description = response.text() || 'No description available';
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
      console.log('Generating image with prompt:', prompt);

      const model = this.client.getGenerativeModel({ model: this.MODEL_NAME });
      const result = await model.generateContent(prompt);
      const response = result.response;

      // Process the response to get image data
      const processedResult = await this.processResponse(response, 'img');
      return processedResult.base64String;
    } catch (error: unknown) {
      console.error('Error generating image', error);
      if (error instanceof Error) {
        throw new Error(`Failed to generate image: ${error.message}`);
      }
      throw new Error('Failed to generate image');
    }
  }

  // ------------- Cartoonize Character with Reference Image -------------
  async cartoonizeCharacter(
    imagePath: string,
    characterName: string,
  ): Promise<string> {
    try {
      console.log(
        `Cartoonizing ${characterName} using reference: ${imagePath}...`,
      );

      // Read the image file
      const imageBuffer = await fs.readFile(imagePath);
      const imageBase64 = imageBuffer.toString('base64');

      const prompt = `Create a Studio Ghibli style character illustration of ${characterName}. Use the uploaded reference photo to match the face, hair style, and appearance accurately. Use soft colors, expressive eyes, and a warm cinematic atmosphere.`;

      // Multimodal request: Text + Image
      const model = this.client.getGenerativeModel({ model: this.MODEL_NAME });
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: imageBase64,
          },
        },
      ]);
      const response = result.response;

      const processedResult = await this.processResponse(response, 'char');
      return processedResult.base64String;
    } catch (error: unknown) {
      console.error('Cartoonize character failed:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to cartoonize character: ${error.message}`);
      }
      throw new Error('Failed to cartoonize character');
    }
  }

  // ------------- Process Response Helper -------------
  private async processResponse(
    response: unknown,
    prefix: string,
  ): Promise<{ filepath: string; base64String: string }> {
    // Narrow unknown to expected structure safely
    const resp = response as {
      candidates?: Array<{
        content?: { parts?: Array<{ inlineData?: { data?: string } }> };
      }>;
    };
    const candidates = resp?.candidates;
    if (Array.isArray(candidates) && candidates.length > 0) {
      for (const candidate of candidates) {
        const parts = candidate?.content?.parts;
        if (Array.isArray(parts) && parts.length > 0) {
          for (const part of parts) {
            const imageBytes = part?.inlineData?.data;
            if (typeof imageBytes === 'string' && imageBytes.length > 0) {
              // 1. Ensure directory exists
              const outputDir = path.join(process.cwd(), 'output_images');
              await fs.mkdir(outputDir, { recursive: true });

              // 2. Generate unique filename
              const filename = `${prefix}_${uuidv4()}.png`;
              const filepath = path.join(outputDir, filename);

              // 3. Save to disk
              const buffer = Buffer.from(imageBytes, 'base64');
              await fs.writeFile(filepath, buffer);

              // 4. Return filepath and base64 string
              const base64String = `data:image/png;base64,${imageBytes}`;

              return { filepath, base64String };
            }
          }
        }
      }
    }

    throw new Error('Model response did not contain image data');
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

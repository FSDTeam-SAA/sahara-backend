import { Injectable } from '@nestjs/common';
import { config } from 'dotenv';
import OpenAI from 'openai';

config();

@Injectable()
export class StoryGeneratorUtil {
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

  // ---------- Build Story Prompt ----------
  buildStoryPrompt(
    title: string,
    language: string,
    style: string,
    genre: string,
    characters: { name: string }[],
    beginning: string,
    chapterCount = 4,
  ): string {
    const charactersText =
      characters?.length > 0
        ? characters.map((c) => `- ${c.name}`).join('\n')
        : 'None';

    return `
You are a creative children's (or general) story writer.

Title: ${title}
Language: ${language}
Writing style: ${style}
Genre: ${genre}

Characters:
${charactersText}

Beginning: ${beginning || 'Start from scratch.'}

Requirements:
- Produce ${chapterCount} chapters.
- Use explicit chapter headers: "CHAPTER 1: <short title>" followed by the paragraph for that chapter.
- Keep language appropriate to the genre and style.
- Make each chapter a short, self-contained paragraph (2-6 sentences).
- At the end, provide a short one-line summary.

Begin now.
    `.trim();
  }

  // ---------- Generate Story ----------
  async generateStory(
    title: string,
    language: string,
    style: string,
    genre: string,
    characters: { name: string }[],
    beginning: string,
    chapterCount = 4,
  ): Promise<string> {
    const prompt = this.buildStoryPrompt(
      title,
      language,
      style,
      genre,
      characters,
      beginning,
      chapterCount,
    );

    try {
      const resp = await this.client.chat.completions.create({
        model: 'grok-4',
        messages: [
          { role: 'system', content: 'You are a creative story writer.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 5000,
        temperature: 0.8,
      });

      return resp.choices?.[0]?.message?.content || '';
    } catch (error: unknown) {
      console.error('Error generating story', error);
      if (error instanceof Error) {
        throw new Error(`Failed to generate story: ${error.message}`);
      }
      throw new Error('Failed to generate story');
    }
  }

  // ---------- Split Into Chapters ----------
  splitIntoChapters(storyText: string) {
    const chapterRegex = /(CHAPTER\s*\d+[:.-]?\s*[^\n]*)/i;

    const parts = storyText.split(chapterRegex);

    if (parts.length <= 1) {
      return [{ title: 'Full Story', text: storyText.trim() }];
    }

    const chapters: Array<{ title: string; text: string }> = [];
    for (let i = 1; i < parts.length; i += 2) {
      const title = parts[i].trim();
      const body = parts[i + 1]?.trim() ?? '';
      chapters.push({ title, text: body });
    }

    return chapters;
  }
}

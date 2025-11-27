import { Injectable } from '@nestjs/common';
import { StoryGeneratorUtil } from '../common/utils/story-generator.util';

@Injectable()
export class StoryService {
  constructor(private readonly storyUtil: StoryGeneratorUtil) {}

  async createStory(payload: {
    title: string;
    language: string;
    style: string;
    genre: string;
    characters: { name: string }[];
    beginning: string;
    chapterCount?: number;
  }) {
    const {
      title,
      language,
      style,
      genre,
      characters,
      beginning,
      chapterCount = 4,
    } = payload;

    const text = await this.storyUtil.generateStory(
      title,
      language,
      style,
      genre,
      characters,
      beginning,
      chapterCount,
    );

    const chapters = this.storyUtil.splitIntoChapters(text);

    return {
      story: text,
      chapters,
    };
  }
}

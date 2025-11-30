import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StoryGeneratorUtil } from '../common/utils/story-generator.util';
import { StoryInfo, StoryInfoDocument } from './storyInfo.schema';

@Injectable()
export class StoryService {
  constructor(
    private readonly storyUtil: StoryGeneratorUtil,

    @InjectModel(StoryInfo.name)
    private storyModel: Model<StoryInfoDocument>,
  ) {}

  async createStory(payload: {
    userId: string;
    title: string;
    language: string;
    style: string;
    genre: number;
    characters: { name: string }[];
    beginning: string;
    chapterCount?: number;
  }) {
    const {
      userId,
      title,
      language,
      style,
      genre,
      characters,
      beginning,
      chapterCount = 4,
    } = payload;

    // generate story
    const text = await this.storyUtil.generateStory(
      title,
      language,
      style,
      genre.toString(),
      characters,
      beginning,
      chapterCount,
    );

    const chapters = this.storyUtil.splitIntoChapters(text);

    const created = await this.storyModel.create({
      userId,
      title,
      language,
      style,
      genre,
      characters,
      beginning,
      chapterCount,
    });

    return {
      story: text,
      chapters,
      saved: created,
    };
  }
}

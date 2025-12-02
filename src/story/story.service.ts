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

  // Step 1: Generate raw story text
  const text = await this.storyUtil.generateStory(
    title,
    language,
    style,
    genre.toString(),
    characters,
    beginning,
    chapterCount,
  );

  // Step 2: Split into chapter objects
  const rawChapters = this.storyUtil.splitIntoChapters(text);

  // Step 3: Convert chapter objects to your required structure
  const processedChapters = rawChapters.map((ch, index) => ({
    chapter: index + 1,
    title: ch.title,
    text: ch.text,
    audioUrl: null, // you can fill this later after ElevenLabs TTS
  }));

  // Step 4: Save to database
  const created = await this.storyModel.create({
    userId,
    title,
    language,
    style,
    genre,
    characters,
    beginning,
    chapterCount,
    generatedStory: processedChapters,
  });

  return {
    storyText: text,
    chapters: processedChapters,
    saved: created,
  };
}
}

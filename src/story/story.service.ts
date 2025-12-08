import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StoryGeneratorUtil } from '../common/utils/story-generator.util';
import { StoryInfo, StoryInfoDocument } from './storyInfo.schema';
import { ImageGeneratorUtil } from '../common/utils/image-generator.util';

@Injectable()
export class StoryService {
  constructor(
    private readonly storyUtil: StoryGeneratorUtil,
    private readonly imageGenerator: ImageGeneratorUtil,
    @InjectModel(StoryInfo.name)
    private storyModel: Model<StoryInfoDocument>,
  ) { }

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

    // Step 5: Asynchronously generate images for each chapter
    this.generateChapterImages(created);

    return {
      storyText: text,
      chapters: processedChapters,
      saved: created,
    };
  }

  private async generateChapterImages(story: StoryInfoDocument) {
    for (const chapter of story.generatedStory) {
      try {
        const prompt = `A children's storybook illustration for a chapter titled '${chapter.title}' from the story '${story.title}' in a ${story.style} style.`;
        const imageUrl =
          await this.imageGenerator.generateImageFromPrompt(prompt);

        if (imageUrl) {
          await this.storyModel.updateOne(
            { _id: story._id, 'generatedStory.chapter': chapter.chapter },
            { $set: { 'generatedStory.$.chapterImage': imageUrl } },
          );
        }
      } catch (error) {
        console.error(
          `Failed to generate image for chapter ${chapter.chapter} of story ${story._id as string}`,
          error,
        );
      }
    }
  }

  async setVoiceId(storyId: string, voiceId: string) {
    return this.storyModel.findByIdAndUpdate(
      storyId,
      { voiceId },
      { new: true },
    );
  }

  async setChapterAudioUrl(
    storyId: string,
    chapterNumber: number,
    audioUrl: string,
  ) {
    const story = await this.storyModel.findById(storyId);
    if (!story) return null;
    const idx = story.generatedStory.findIndex(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (c: any) => c.chapter === chapterNumber,
    );
    if (idx === -1) return null;
    story.generatedStory[idx].audioUrl = audioUrl;
    await story.save();
    return story;
  }

  async getStoryById(storyId: string) {
    return this.storyModel.findById(storyId).lean();
  }

  async findAll(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
    const query: any = {};

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const total = await this.storyModel.countDocuments(query);
    const stories = await this.storyModel
      .find(query)
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    const totalPages = Math.ceil(total / limit);

    return {
      stories,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getStoriesByUser(userId: string, search?: string) {
    const query: any = { userId };

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    return this.storyModel.find(query).lean();
  }

  async updateStory(storyId: string, payload: any) {
    return this.storyModel.findByIdAndUpdate(storyId, payload, { new: true });
  }

  async deleteStory(storyId: string) {
    return this.storyModel.findByIdAndDelete(storyId);
  }
}

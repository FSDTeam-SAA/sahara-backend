import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StoryInfoDocument = StoryInfo & Document;

@Schema()
export class Chapter {
  @Prop({ required: true })
  chapter: number;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  text: string;

  @Prop()
  audioUrl?: string;
}

export const ChapterSchema = SchemaFactory.createForClass(Chapter);

@Schema({ timestamps: true })
export class StoryInfo {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  language: string;

  @Prop({ required: true })
  style: string;

  @Prop({ required: true })
  genre: string;

  @Prop({ type: [{ name: String }], required: true })
  characters: { name: string }[];

  @Prop({ required: true })
  beginning: string;

  @Prop({ required: true })
  chapterCount: number;

  @Prop({ type: [ChapterSchema], default: [] })
  generatedStory: Chapter[];
}

export const StoryInfoSchema = SchemaFactory.createForClass(StoryInfo);

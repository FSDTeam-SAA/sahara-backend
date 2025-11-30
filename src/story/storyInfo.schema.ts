import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StoryInfoDocument = StoryInfo & Document;

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

  @Prop()
  genaratedStory: string;
}

export const StoryInfoSchema = SchemaFactory.createForClass(StoryInfo);

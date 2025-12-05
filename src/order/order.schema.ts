import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

export enum OrderStatus {
  COMPLETED = 'completed',
  IN_PROCESS = 'inProcess',
  CANCELED = 'canceled',
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, ref: 'StoryInfo' })
  storyBookId: string;

  @Prop({ required: true, enum: ['ebook', 'print + ebook'], default: 'ebook' })
  formate: string;

  @Prop({ required: true })
  price: number;

  @Prop({
    type: String,
    enum: OrderStatus,
    default: OrderStatus.IN_PROCESS,
  })
  status: OrderStatus;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

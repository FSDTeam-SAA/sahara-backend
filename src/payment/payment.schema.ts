import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PaymentDocument = Payment & Document;

export enum PaymentStatus {
  COMPLETED = 'completed',
  IN_PROCESS = 'inProcess',
  CANCELED = 'canceled',
}

@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  orderId: Types.ObjectId;

  @Prop({ required: true })
  totalAmount: number;

  @Prop({
    type: String,
    enum: PaymentStatus,
    default: PaymentStatus.IN_PROCESS,
  })
  status: PaymentStatus;

  @Prop()
  sessionId: string; // Stripe session_id (checkout)

  @Prop()
  paymentIntentId: string; // Stripe payment_intent id

  @Prop({ default: 'usd' })
  currency: string;

  @Prop()
  paymentMethod: string; // "card" | "wallet" | any method

  @Prop()
  receiptUrl: string;

  @Prop()
  stripeEventId: string; // For webhook idempotency
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

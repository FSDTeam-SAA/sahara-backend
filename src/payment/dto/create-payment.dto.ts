import { IsNotEmpty, IsNumber } from 'class-validator';
import { Types } from 'mongoose';

export class CreatePaymentDto {
  @IsNotEmpty()
  userId: Types.ObjectId;

  @IsNotEmpty()
  orderId: Types.ObjectId;

  @IsNumber()
  totalAmount: number;
}

import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateOrderDto {
  @IsNotEmpty()
  userId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  bookName: string;

  @IsNotEmpty()
  storyBookId: Types.ObjectId;

  @IsString()
  date: string;

  @IsString()
  formate: string;

  @IsNumber()
  price: number;
}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { StoryInfo, StoryInfoSchema } from '../story/storyInfo.schema';
import { Payment, PaymentSchema } from '../payment/payment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StoryInfo.name, schema: StoryInfoSchema },
      { name: Payment.name, schema: PaymentSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}

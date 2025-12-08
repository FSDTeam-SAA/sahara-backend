import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { User, UserSchema } from '../user/user.schema';
import { Order, OrderSchema } from '../order/order.schema';
import { Payment, PaymentSchema } from '../payment/payment.schema';
import { StoryInfo, StoryInfoSchema } from '../story/storyInfo.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Order.name, schema: OrderSchema },
            { name: Payment.name, schema: PaymentSchema },
            { name: StoryInfo.name, schema: StoryInfoSchema },
        ]),
    ],
    controllers: [StatisticsController],
    providers: [StatisticsService],
})
export class StatisticsModule { }

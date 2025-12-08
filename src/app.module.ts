import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { ContactUsModule } from './contact-us/contact-us.module';
import { OrderModule } from './order/order.module';
import { PaymentModule } from './payment/payment.module';
import { AiModule } from './ai/ai.module';
import { ImageGenarateModule } from './image-genarate/image-genarate.module';
import { StoryModule } from './story/story.module';
import { VoiceModule } from './voice/voice.module';
import { StatisticsModule } from './statistics/statistics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('DATABASE_URL'),
      }),
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    EmailModule,
    ContactUsModule,
    OrderModule,
    PaymentModule,
    AiModule,
    ImageGenarateModule,
    StoryModule,
    VoiceModule,
    StatisticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [UserModule, EmailModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}

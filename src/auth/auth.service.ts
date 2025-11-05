import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { EmailService } from '../email/email.service';
import { randomInt } from 'crypto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private emailService: EmailService,
    private jwtService: JwtService,
  ) {}

  async register(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ) {
    const existing = await this.userService.findByEmail(email);
    if (existing) throw new BadRequestException('Email already registered');

    // 1️⃣ Create the user
    const user = await this.userService.create({
      firstName,
      lastName,
      email,
      password,
    });

    // 2️⃣ Generate OTP
    const otp = this.generateOtp();

    // 3️⃣ Save OTP in verificationInfo
    user.verificationInfo.token = otp;
    await user.save();

    // 4️⃣ Send OTP email
    await this.emailService.sendOtpMail(email, otp);

    return {
      message: 'User registered successfully. OTP sent to email.',
      userId: user._id,
    };
  }

  private generateOtp(): string {
    // 6-digit OTP
    return randomInt(100000, 999999).toString();
  }

  async verifyOtp({ email, token }: VerifyOtpDto) {
    const user = await this.userService.findByEmail(email);

    if (!user) throw new BadRequestException('User not found');
    if (!user.verificationInfo?.token)
      throw new BadRequestException('No OTP found. Please register again');

    if (user.verificationInfo.token !== token)
      throw new BadRequestException('Invalid OTP');

    // ✅ OTP matches, mark user as verified
    user.verificationInfo.verified = true;
    user.verificationInfo.token = undefined; // remove OTP after verification
    await user.save();

    return { message: 'Email verified successfully' };
  }

  async login(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    const payload = {
      sub: (user as { _id: string })._id,
      role: user.role,
      name: user.firstName + ' ' + user.lastName,
    };
    const token = await this.jwtService.signAsync(payload);
    return { token };
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}

  async register(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ) {
    const existing = await this.userService.findByEmail(email);

    if (existing) throw new BadRequestException('Email already registered');

    const user = await this.userService.create({
      firstName,
      lastName,
      email,
      password,
    });

    return user;
  }
}

import { ExtractJwt, Strategy as JwtStrategyBase } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

interface JwtPayload {
  sub: string;
  role: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(JwtStrategyBase) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken() as () =>
        | string
        | null,
      secretOrKey: process.env.JWT_SECRET || 'secret',
    });
  }

  validate(payload: JwtPayload) {
    console.log('JWT Payload:', payload);
    return { userId: payload.sub, role: payload.role };
  }
}

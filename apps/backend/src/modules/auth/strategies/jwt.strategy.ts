import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') || 'dev_secret_key_123', // Fallback for dev
        });
    }

    async validate(payload: any) {
        // Minimal validation. Payload sub is userId.
        if (!payload.sub) {
            throw new UnauthorizedException();
        }
        return { userId: payload.sub, username: payload.username };
    }
}

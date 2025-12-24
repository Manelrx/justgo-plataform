import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './services/auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    async login(@Body() body: { userId: string }) {
        if (!body.userId) {
            throw new UnauthorizedException('UserId is required');
        }
        // Dev logic: Pass generic payload, AuthService should handle signature
        return this.authService.login(body.userId);
    }
}

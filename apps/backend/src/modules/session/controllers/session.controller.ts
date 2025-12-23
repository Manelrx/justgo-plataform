import { Controller, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SessionService } from '../services/session.service';

@Controller('session')
@UseGuards(AuthGuard('jwt'))
export class SessionController {
    constructor(private readonly sessionService: SessionService) { }

    @Post('start')
    async startSession(@Request() req: any, @Body('storeId') storeId: string) {
        return this.sessionService.startSession(req.user.userId, storeId);
    }

    @Patch(':id/cart')
    async updateCart(
        @Request() req: any,
        @Param('id') sessionId: string,
        @Body() body: { productCode: string; quantity: number }
    ) {
        return this.sessionService.addItem(sessionId, req.user.userId, body.productCode, body.quantity);
    }

    @Post(':id/close')
    async closeSession(@Request() req: any, @Param('id') sessionId: string) {
        return this.sessionService.closeSession(sessionId, req.user.userId);
    }
}

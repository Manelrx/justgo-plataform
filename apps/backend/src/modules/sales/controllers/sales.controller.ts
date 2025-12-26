import { Controller, Post, Body, Get, Param, UseGuards, Request } from '@nestjs/common';
import { SalesService } from '../services/sales.service';
import { PaymentWebhookDto } from '../dtos/payment-webhook.dto';
import { CreateOfflineSaleDto } from '../dtos/create-offline-sale.dto';
import { CreateDirectSaleDto } from '../dtos/create-direct-sale.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('sales')
export class SalesController {
    constructor(private readonly salesService: SalesService) { }

    @Post('debug/seed')
    async seedTestProduct() {
        return this.salesService.seedTestProduct();
    }

    @Post('checkout')
    @UseGuards(AuthGuard('jwt'))
    async checkout(@Body() dto: CreateDirectSaleDto, @Request() req: any) {
        // userId from JWT
        const userId = req.user.payload.sub;
        return this.salesService.processDirectCheckout(userId, dto);
    }

    @Post('from-session/:sessionId')
    @UseGuards(AuthGuard('jwt'))
    async createSale(@Request() req: any, @Param('sessionId') sessionId: string) {
        return this.salesService.createSaleFromSession(sessionId, req.user.userId);
    }

    @Get(':id')
    @UseGuards(AuthGuard('jwt'))
    async getSale(@Request() req: any, @Param('id') id: string) {
        return this.salesService.getSale(id, req.user.userId);
    }

    @Post('offline/sync')
    @UseGuards(AuthGuard('jwt'))
    async syncOfflineSale(@Body() dto: CreateOfflineSaleDto) {
        return this.salesService.syncOfflineSale(dto);
    }

    @Post('webhook/payment')
    async confirmPayment(@Body() dto: PaymentWebhookDto) {
        return this.salesService.confirmPayment(dto);
    }
}

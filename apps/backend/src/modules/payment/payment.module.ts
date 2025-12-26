import { Module } from '@nestjs/common';
import { PaymentService } from './services/payment.service';

@Module({
    providers: [PaymentService],
    exports: [PaymentService],
})
export class PaymentModule { }

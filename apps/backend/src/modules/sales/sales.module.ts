import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { Sale } from './entities/sale.entity';
import { SalesService } from './services/sales.service';
import { SalesController } from './controllers/sales.controller';
import { SessionModule } from '../session/session.module';
import { SalesExportProcessor } from './processors/sales-export.processor';

import { PaymentModule } from '../payment/payment.module';
import { CatalogModule } from '../catalog/catalog.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Sale]),
        BullModule.registerQueue({
            name: 'sales-export',
        }),
        SessionModule,
        PaymentModule,
        CatalogModule,
    ],
    providers: [SalesService, SalesExportProcessor],
    controllers: [SalesController],
})
export class SalesModule { }

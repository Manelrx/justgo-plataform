import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { DlqController } from './controllers/dlq.controller';
import { DlqService } from './services/dlq.service';
import erpQueueConfig from './erp.queue.config';

import { ErpMockService } from './services/erp-mock.service';
import { ErpSyncService } from './services/erp-sync.service';
import { ErpSyncProcessor } from './processors/erp-sync.processor';
import { CatalogModule } from '../catalog/catalog.module';

@Module({
    imports: [
        ConfigModule.forFeature(erpQueueConfig),
        BullModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                connection: {
                    host: configService.get('REDIS_HOST', 'localhost'),
                    port: configService.get('REDIS_PORT', 6379),
                    password: configService.get('REDIS_PASSWORD'),
                },
            }),
            inject: [ConfigService],
        }),
        BullModule.registerQueue({
            name: 'erp-sync',
        }),
        CatalogModule,
    ],
    controllers: [DlqController],
    providers: [DlqService, ErpMockService, ErpSyncService, ErpSyncProcessor],
    exports: [BullModule, ErpMockService, ErpSyncService],
})
export class ErpModule { }

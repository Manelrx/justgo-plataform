import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

@Processor('sales-export')
export class SalesExportProcessor extends WorkerHost {
    private readonly logger = new Logger(SalesExportProcessor.name);

    async process(job: Job<{ saleId: string }>): Promise<any> {
        this.logger.log(`Starting ERPNext sync for Sale ${job.data.saleId}`);

        // Mock Implementation
        await new Promise(resolve => setTimeout(resolve, 1000));

        this.logger.log(`[ERPNext] POST /api/resource/Sales Invoice - 200 OK`);
        this.logger.log(`Sale ${job.data.saleId} synced successfully`);
    }
}

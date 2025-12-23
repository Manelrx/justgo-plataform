import { Injectable, Logger, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, Job } from 'bullmq';

@Injectable()
export class DlqService {
    private readonly logger = new Logger(DlqService.name);
    private readonly MAX_MANUAL_RETRIES = 3;

    constructor(@InjectQueue('erp-sync') private readonly erpQueue: Queue) { }

    async getFailedJobs(): Promise<any[]> {
        const jobs = await this.erpQueue.getJobs(['failed']);
        return jobs.map(job => ({
            id: job.id,
            name: job.name,
            failedReason: job.failedReason,
            attempts: job.attemptsMade,
            data: job.data,
            timestamp: job.timestamp,
            manualRetries: job.data?.manualRetries || 0
        }));
    }

    async retryJob(jobId: string, userId: string): Promise<{ status: string, jobId: string, message: string }> {
        const job = await this.erpQueue.getJob(jobId);

        if (!job) {
            throw new NotFoundException(`Job ${jobId} not found.`);
        }

        const currentState = await job.getState();
        if (currentState !== 'failed') {
            throw new BadRequestException(`Job ${jobId} is in status '${currentState}', cannot retry. Only 'failed' jobs can be retried.`);
        }

        // Manual Retry Limiter
        const currentManualRetries = job.data?.manualRetries || 0;
        if (currentManualRetries >= this.MAX_MANUAL_RETRIES) {
            throw new BadRequestException(`Max manual retries (${this.MAX_MANUAL_RETRIES}) reached for Job ${jobId}. Investigation required.`);
        }

        // Update Audit Metadata in Job Data
        const updatedData = {
            ...job.data,
            manualRetries: currentManualRetries + 1,
            lastRetryBy: userId,
            lastRetryAt: new Date().toISOString()
        };

        await job.updateData(updatedData);

        // Audit Log
        this.logger.log(`[AUDIT] Manual Retry | Op: ${userId} | Job: ${jobId} | Attempt: ${updatedData.manualRetries}`);

        // Trigger Retry
        await job.retry();

        return {
            status: 'queued',
            jobId: job.id || 'unknown',
            message: 'Job re-queued successfully.'
        };
    }
}

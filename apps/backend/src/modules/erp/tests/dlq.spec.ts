import { Test, TestingModule } from '@nestjs/testing';
import { DlqService } from '../services/dlq.service';
import { getQueueToken } from '@nestjs/bullmq';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('DlqService', () => {
    let service: DlqService;

    // Mock BullMQ Job
    const mockJob = {
        id: '1',
        name: 'sync-sale',
        failedReason: 'Timeout',
        attemptsMade: 5,
        timestamp: Date.now(),
        data: { saleId: '123' } as any,
        getState: jest.fn(),
        updateData: jest.fn(),
        retry: jest.fn(),
    };

    // Mock BullMQ Queue
    const mockQueue = {
        getJobs: jest.fn(),
        getJob: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DlqService,
                {
                    provide: getQueueToken('erp-sync'),
                    useValue: mockQueue,
                },
            ],
        }).compile();

        service = module.get<DlqService>(DlqService);
        jest.clearAllMocks();
    });

    it('should list failed jobs', async () => {
        mockQueue.getJobs.mockResolvedValue([mockJob]);
        const result = await service.getFailedJobs();
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('1');
        expect(mockQueue.getJobs).toHaveBeenCalledWith(['failed']);
    });

    it('should retry a failed job successfully', async () => {
        mockQueue.getJob.mockResolvedValue(mockJob);
        mockJob.getState.mockResolvedValue('failed');
        mockJob.data.manualRetries = 0; // Reset

        const result = await service.retryJob('1', 'msg-admin');

        expect(result.status).toBe('queued');
        expect(mockJob.retry).toHaveBeenCalled();
        expect(mockJob.updateData).toHaveBeenCalledWith(expect.objectContaining({
            manualRetries: 1,
            lastRetryBy: 'msg-admin'
        }));
    });

    it('should THROW BadRequest if job is NOT failed', async () => {
        mockQueue.getJob.mockResolvedValue(mockJob);
        mockJob.getState.mockResolvedValue('completed');

        await expect(service.retryJob('1', 'admin')).rejects.toThrow(BadRequestException);
    });

    it('should THROW BadRequest if manual retry limit reached', async () => {
        mockQueue.getJob.mockResolvedValue(mockJob);
        mockJob.getState.mockResolvedValue('failed');
        mockJob.data.manualRetries = 3; // MAX is 3

        await expect(service.retryJob('1', 'admin')).rejects.toThrow(BadRequestException);
        expect(mockJob.retry).not.toHaveBeenCalled();
    });
});

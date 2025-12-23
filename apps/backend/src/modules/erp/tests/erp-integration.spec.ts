import { Test, TestingModule } from '@nestjs/testing';
import { ErpSyncService } from '../services/erp-sync.service';
import { ErpMockService } from '../services/erp-mock.service';
import { getQueueToken } from '@nestjs/bullmq';
import { InternalServerErrorException } from '@nestjs/common';

describe('ErpSyncService Integration', () => {
    let syncService: ErpSyncService;
    let mockService: ErpMockService;
    let queueMock: any;

    beforeEach(async () => {
        queueMock = {
            add: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ErpSyncService,
                ErpMockService, // Use REAL Mock Service
                {
                    provide: getQueueToken('erp-sync'),
                    useValue: queueMock,
                },
            ],
        }).compile();

        syncService = module.get<ErpSyncService>(ErpSyncService);
        mockService = module.get<ErpMockService>(ErpMockService);
    });

    it('should fetch data from ERP and queue jobs', async () => {
        await syncService.triggerFullSync();

        // Expectation based on initial data in ErpMockService
        // 2 Products + 2 Stocks + 2 Prices
        expect(queueMock.add).toHaveBeenCalledTimes(6);

        // Verify specific call structure
        expect(queueMock.add).toHaveBeenCalledWith(
            'product-update',
            expect.objectContaining({ code: 'COC-350' }),
            expect.objectContaining({ jobId: 'product-COC-350' })
        );

        expect(queueMock.add).toHaveBeenCalledWith(
            'stock-update',
            expect.objectContaining({ productCode: 'COC-350' }),
            expect.objectContaining({ jobId: 'stock-COC-350-LOJA_01' })
        );
    });

    it('should handle ERP failures gracefully (Simulated)', async () => {
        mockService.simulateFailure(true);

        await expect(syncService.triggerFullSync()).rejects.toThrow(InternalServerErrorException);

        // Should NOT queue anything if fetch failed (logic: step by step)
        // If fetch products fails, it stops there.
        expect(queueMock.add).not.toHaveBeenCalled();
    });
});

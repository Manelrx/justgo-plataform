import { Test, TestingModule } from '@nestjs/testing';
import { SalesService } from '../services/sales.service';
import { Sale, SaleStatus } from '../entities/sale.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { getQueueToken } from '@nestjs/bullmq';
import { CreateOfflineSaleDto } from '../dtos/create-offline-sale.dto';
import { SessionService } from '../../session/services/session.service';
import { BadRequestException } from '@nestjs/common';

// Mock SessionService
const mockSessionService = {
    getSession: jest.fn(),
};

// Mock Bull Queue
const mockQueue = {
    add: jest.fn(),
};

// Mock Repository
const mockRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
};

// Mock DataSource
const mockDataSource = {
    transaction: jest.fn(),
};

describe('Sales Lifecycle Integration (Mocked DB)', () => {
    let service: SalesService;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SalesService,
                { provide: SessionService, useValue: mockSessionService },
                { provide: getQueueToken('sales-export'), useValue: mockQueue },
                { provide: getRepositoryToken(Sale), useValue: mockRepo },
                { provide: DataSource, useValue: mockDataSource },
            ],
        }).compile();

        service = module.get<SalesService>(SalesService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should THROW BadRequest if offline sale total does not match items sum (Anti-Fraud)', async () => {
        const dto: CreateOfflineSaleDto = {
            offlineId: 'off-1',
            storeId: 'store-1',
            customerId: 'cust-1',
            total: 5.00, // FRAUD
            occurredAt: new Date(),
            items: [
                {
                    productCode: 'PROD-1',
                    quantity: 1,
                    unitPrice: 10.00,
                    totalPrice: 10.00
                }
            ]
        };

        await expect(service.syncOfflineSale(dto)).rejects.toThrow(BadRequestException);
    });

    it('should CREATE offline sale if math is valid', async () => {
        const dto: CreateOfflineSaleDto = {
            offlineId: 'off-valid-1',
            storeId: 'store-1',
            customerId: 'cust-1',
            total: 10.00,
            occurredAt: new Date(),
            items: [
                {
                    productCode: 'PROD-1',
                    quantity: 1,
                    unitPrice: 10.00,
                    totalPrice: 10.00
                }
            ]
        };

        // Mock FindOne (Idempotency) -> null (New)
        mockRepo.findOne.mockResolvedValue(null);
        // Mock Create -> Validation object
        const createdEntity = { ...dto, id: 'sales-uuid-1', status: SaleStatus.CREATED, erpSyncStatus: 'PENDING' };
        mockRepo.create.mockReturnValue(createdEntity);
        // Mock Save -> Return entity
        mockRepo.save.mockResolvedValue(createdEntity);

        const sale = await service.syncOfflineSale(dto);

        expect(mockRepo.create).toHaveBeenCalled();
        expect(sale.id).toBe('sales-uuid-1');
    });

    it('should SET PAID and DISPATCH to Queue on confirmPayment', async () => {
        const paymentDto = {
            saleId: 'sales-uuid-1',
            status: 'APPROVED',
            transactionId: 'tx-123',
            payload: { bank: 'TestBank' }
        };

        // Mock FindOne -> Return existing sale
        const existingSale = {
            id: 'sales-uuid-1',
            status: SaleStatus.CREATED,
            total: 10.00,
            save: jest.fn() // TypeORM Active Record pattern often uses .save() on entity, but here we use Repo
        };
        mockRepo.findOne.mockResolvedValue(existingSale);

        // Mock Save -> Return updated sale
        const updatedSale = { ...existingSale, status: SaleStatus.PAID, paymentMeta: paymentDto.payload };
        mockRepo.save.mockResolvedValue(updatedSale);

        const paidSale = await service.confirmPayment(paymentDto);

        // Assert
        expect(paidSale.status).toBe(SaleStatus.PAID);
        expect(mockRepo.save).toHaveBeenCalled();

        // Queue Assertion
        expect(mockQueue.add).toHaveBeenCalledWith(
            'erpnext-sync-invoice',
            { saleId: 'sales-uuid-1' }
        );
    });
});

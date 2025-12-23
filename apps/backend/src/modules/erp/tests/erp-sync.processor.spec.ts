import { Test, TestingModule } from '@nestjs/testing';
import { ErpSyncProcessor } from '../processors/erp-sync.processor';
import { CatalogService } from '../../catalog/services/catalog.service';
import { PriceService } from '../../catalog/services/price.service';
import { Job } from 'bullmq';

describe('ErpSyncProcessor', () => {
    let processor: ErpSyncProcessor;
    let catalogService: any;
    let priceService: any;

    beforeEach(async () => {
        catalogService = {
            saveProduct: jest.fn(),
            updateStock: jest.fn(),
        };
        priceService = {
            savePrice: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ErpSyncProcessor,
                {
                    provide: CatalogService,
                    useValue: catalogService,
                },
                {
                    provide: PriceService,
                    useValue: priceService,
                },
            ],
        }).compile();

        processor = module.get<ErpSyncProcessor>(ErpSyncProcessor);
    });

    it('should process product-update jobs', async () => {
        const job = {
            id: '1',
            name: 'product-update',
            data: { code: 'COC-350', name: 'Cola' },
        } as unknown as Job;

        await processor.process(job);

        expect(catalogService.saveProduct).toHaveBeenCalledWith({
            code: 'COC-350',
            name: 'Cola',
        });
    });

    it('should process stock-update jobs', async () => {
        const job = {
            id: '2',
            name: 'stock-update',
            data: { productCode: 'COC-350', warehouseId: 'MAIN', quantity: 100 },
        } as unknown as Job;

        await processor.process(job);

        expect(catalogService.updateStock).toHaveBeenCalledWith({
            productCode: 'COC-350',
            warehouseId: 'MAIN',
            quantity: 100,
        });
    });

    it('should process price-update jobs', async () => {
        const job = {
            id: '3',
            name: 'price-update',
            data: { productCode: 'COC-350', priceList: 'Standard', rate: 5.50, currency: 'BRL' },
        } as unknown as Job;

        await processor.process(job);

        expect(priceService.savePrice).toHaveBeenCalledWith({
            productCode: 'COC-350',
            priceList: 'Standard',
            rate: 5.50,
            currency: 'BRL',
        });
    });

    it('should ignore unknown job types', async () => {
        const job = {
            id: '3',
            name: 'unknown-type',
            data: {},
        } as unknown as Job;

        await processor.process(job);

        expect(catalogService.saveProduct).not.toHaveBeenCalled();
        expect(catalogService.updateStock).not.toHaveBeenCalled();
    });
});

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { CatalogService } from '../../catalog/services/catalog.service';
import { PriceService } from '../../catalog/services/price.service';
import { ProductDTO, StockDTO, PriceListDTO } from '../domain/contracts';

@Processor('erp-sync')
export class ErpSyncProcessor extends WorkerHost {
    private readonly logger = new Logger(ErpSyncProcessor.name);

    constructor(
        private readonly catalogService: CatalogService,
        private readonly priceService: PriceService,
    ) {
        super();
    }

    async process(job: Job<any, any, string>): Promise<any> {
        this.logger.log(`Processing Job ${job.id} | Type: ${job.name}`);

        switch (job.name) {
            case 'product-update':
                return this.handleProductUpdate(job.data as ProductDTO);
            case 'stock-update':
                return this.handleStockUpdate(job.data as StockDTO);
            case 'price-update':
                return this.handlePriceUpdate(job.data as PriceListDTO);
            default:
                this.logger.warn(`Unknown Job Type: ${job.name}. Ignored.`);
                return;
        }
    }

    private async handleProductUpdate(data: ProductDTO) {
        this.logger.debug(`Upserting Product: ${data.code}`);
        await this.catalogService.saveProduct(data);
        this.logger.log(`Product ${data.code} synced successfully.`);
    }

    private async handleStockUpdate(data: StockDTO) {
        this.logger.debug(`Upserting Stock: ${data.productCode} @ ${data.warehouseId}`);
        await this.catalogService.updateStock(data);
        this.logger.log(`Stock for ${data.productCode} synced successfully.`);
    }

    private async handlePriceUpdate(data: PriceListDTO) {
        this.logger.debug(`Upserting Price: ${data.productCode} @ ${data.priceList}`);
        await this.priceService.savePrice(data);
        this.logger.log(`Price for ${data.productCode} synced successfully.`);
    }
}

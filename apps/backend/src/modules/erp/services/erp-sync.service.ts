import { Injectable, Logger } from '@nestjs/common';
import { ErpMockService } from './erp-mock.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class ErpSyncService {
    private readonly logger = new Logger(ErpSyncService.name);

    constructor(
        private readonly erpMockService: ErpMockService,
        @InjectQueue('erp-sync') private readonly erpQueue: Queue
    ) { }

    /**
     * Trigger a full synchronization cycle.
     * This simulates the polling mechanism.
     */
    async triggerFullSync() {
        this.logger.log('Starting Full ERP Sync...');

        try {
            // 1. Sync Products
            const products = await this.erpMockService.fetchProducts();
            this.logger.log(`Fetched ${products.length} products. Queuing updates...`);

            for (const product of products) {
                await this.erpQueue.add('product-update', product, {
                    jobId: `product-${product.code}`, // Idempotency Key for Queue
                    removeOnComplete: true
                });
            }

            // 2. Sync Stock
            const stocks = await this.erpMockService.fetchStock();
            this.logger.log(`Fetched ${stocks.length} stock entries. Queuing updates...`);

            for (const stock of stocks) {
                await this.erpQueue.add('stock-update', stock, {
                    jobId: `stock-${stock.productCode}-${stock.warehouseId}`,
                    removeOnComplete: true
                });
            }

            // 3. Sync Prices
            const prices = await this.erpMockService.fetchPrices();
            this.logger.log(`Fetched ${prices.length} price entries. Queuing updates...`);

            for (const price of prices) {
                await this.erpQueue.add('price-update', price, {
                    jobId: `price-${price.productCode}-${price.priceList}`,
                    removeOnComplete: true
                });
            }

        } catch (error) {
            this.logger.error('Error during ERP Sync:', error);
            // In a real poller, we might alert or retry the polling cycle later.
            throw error;
        }
    }
}

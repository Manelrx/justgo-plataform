import { Injectable, Logger, HttpServer, InternalServerErrorException } from '@nestjs/common';
import { ProductDTO, StockDTO, PriceListDTO } from '../domain/contracts';

@Injectable()
export class ErpMockService {
    private readonly logger = new Logger(ErpMockService.name);
    private failureMode = false;

    // Simulate database
    private products: ProductDTO[] = [
        { code: 'COC-350', name: 'Coca Cola 350ml', uom: 'UN', isActive: true, barcode: '789123456' },
        { code: 'AGU-500', name: 'Agua 500ml', uom: 'UN', isActive: true, barcode: '789999999' },
    ];

    private stocks: StockDTO[] = [
        { productCode: 'COC-350', warehouseId: 'LOJA_01', quantity: 100, updatedAt: new Date().toISOString() },
        { productCode: 'AGU-500', warehouseId: 'LOJA_01', quantity: 50, updatedAt: new Date().toISOString() },
    ];

    private prices: PriceListDTO[] = [
        { productCode: 'COC-350', priceList: 'Standard Selling', rate: 5.50, currency: 'BRL', validFrom: new Date().toISOString() },
        { productCode: 'AGU-500', priceList: 'Standard Selling', rate: 3.00, currency: 'BRL', validFrom: new Date().toISOString() },
    ];

    /**
     * Enable or Disable failure simulation (Timeouts / 500 Errors).
     */
    simulateFailure(enabled: boolean) {
        this.failureMode = enabled;
        this.logger.warn(`ERP Mock Failure Mode set to: ${enabled}`);
    }

    async fetchProducts(since?: Date): Promise<ProductDTO[]> {
        this.checkFailure();
        this.logger.log('ERP Mock: Fetching products...');
        return this.products;
    }

    async fetchStock(since?: Date): Promise<StockDTO[]> {
        this.checkFailure();
        this.logger.log('ERP Mock: Fetching stock...');
        // Update timestamp on fetch to simulate dynamic response
        return this.stocks.map(s => ({ ...s, updatedAt: new Date().toISOString() }));
    }

    async fetchPrices(since?: Date): Promise<PriceListDTO[]> {
        this.checkFailure();
        this.logger.log('ERP Mock: Fetching prices...');
        return this.prices;
    }

    private checkFailure() {
        if (this.failureMode) {
            throw new InternalServerErrorException('ERP Connection Timeout (Simulated)');
        }
    }
}

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { Stock } from '../entities/stock.entity';
import { ProductDTO, StockDTO } from '../../erp/domain/contracts';

@Injectable()
export class CatalogService {
    private readonly logger = new Logger(CatalogService.name);

    constructor(
        @InjectRepository(Product) private readonly productRepo: Repository<Product>,
        @InjectRepository(Stock) private readonly stockRepo: Repository<Stock>,
    ) { }

    async saveProduct(dto: ProductDTO): Promise<Product> {
        const product = this.productRepo.create({
            code: dto.code,
            name: dto.name,
            description: dto.description,
            uom: dto.uom,
            barcode: dto.barcode,
            isActive: dto.isActive,
        });
        return this.productRepo.save(product);
    }

    async updateStock(dto: StockDTO): Promise<Stock> {
        const { productCode, warehouseId, quantity, updatedAt } = dto;

        // Check if Product exists
        const product = await this.productRepo.findOneBy({ code: productCode });
        if (!product) {
            this.logger.warn(`Skipping Stock Update: Product ${productCode} not found.`);
            throw new Error(`Product ${productCode} not found for stock update.`);
        }

        // Check existing stock
        let stock = await this.stockRepo.findOneBy({ product: { code: productCode }, warehouseId });

        if (stock) {
            const newUpdate = new Date(updatedAt);
            const lastUpdate = stock.lastUpdatedAtSource ? new Date(stock.lastUpdatedAtSource) : new Date(0);

            // Idempotency / Order Check: Only update if source is newer
            if (newUpdate <= lastUpdate) {
                this.logger.warn(`Skipping Stock Update: Obsolete event. Current: ${lastUpdate}, Incoming: ${newUpdate}`);
                return stock;
            }

            stock.quantity = quantity;
            stock.lastUpdatedAtSource = newUpdate;
        } else {
            stock = this.stockRepo.create({
                product,
                warehouseId,
                quantity,
                lastUpdatedAtSource: new Date(updatedAt),
            });
        }

        return this.stockRepo.save(stock);
    }
}

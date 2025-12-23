import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Price } from '../entities/price.entity';
import { Product } from '../entities/product.entity';
import { PriceListDTO } from '../../erp/domain/contracts';

@Injectable()
export class PriceService {
    private readonly logger = new Logger(PriceService.name);

    constructor(
        @InjectRepository(Price) private readonly priceRepo: Repository<Price>,
        @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    ) { }

    async savePrice(dto: PriceListDTO): Promise<Price> {
        const { productCode, priceList, rate, currency, validFrom } = dto;

        const product = await this.productRepo.findOneBy({ code: productCode });
        if (!product) {
            this.logger.error(`Product ${productCode} not found for price update.`);
            throw new Error(`Product ${productCode} not found`);
        }

        let price = await this.priceRepo.findOneBy({
            product: { code: productCode },
            priceList
        });

        if (price) {
            price.price = rate;
            price.currency = currency;
            if (validFrom) price.validFrom = new Date(validFrom);
            price.lastUpdatedAtSource = new Date(); // Or use validFrom as source time
        } else {
            price = this.priceRepo.create({
                product,
                priceList,
                price: rate,
                currency,
                validFrom: validFrom ? new Date(validFrom) : undefined,
                lastUpdatedAtSource: new Date(),
            });
        }

        return this.priceRepo.save(price);
    }
    async getPrice(productCode: string, priceList: string): Promise<{ price: number; currency: string; productName: string } | null> {
        const price = await this.priceRepo.findOne({
            where: { product: { code: productCode }, priceList },
            relations: ['product'],
        });

        if (!price) return null;

        return {
            price: Number(price.price),
            currency: price.currency,
            productName: price.product.name,
        };
    }
}

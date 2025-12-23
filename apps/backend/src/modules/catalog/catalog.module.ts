import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Stock } from './entities/stock.entity';
import { Price } from './entities/price.entity';
import { CatalogService } from './services/catalog.service';
import { PriceService } from './services/price.service';

@Module({
    imports: [TypeOrmModule.forFeature([Product, Stock, Price])],
    providers: [CatalogService, PriceService],
    exports: [CatalogService, PriceService],
})
export class CatalogModule { }

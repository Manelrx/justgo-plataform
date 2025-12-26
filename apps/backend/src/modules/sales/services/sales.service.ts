import { Injectable, Logger, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Sale, SaleStatus } from '../entities/sale.entity';
import { CreateOfflineSaleDto } from '../dtos/create-offline-sale.dto';
import { PaymentWebhookDto } from '../dtos/payment-webhook.dto';
import { CreateDirectSaleDto } from '../dtos/create-direct-sale.dto';
import { SessionService } from '../../session/services/session.service';
import { SessionStatus } from '../../session/entities/session.entity';
import { PaymentService } from '../../payment/services/payment.service';
import { CatalogService } from '../../catalog/services/catalog.service';
import { PriceService } from '../../catalog/services/price.service';

@Injectable()
export class SalesService {
    private readonly logger = new Logger(SalesService.name);

    constructor(
        @InjectRepository(Sale) private readonly saleRepo: Repository<Sale>,
        private readonly sessionService: SessionService,
        private readonly dataSource: DataSource,
        @InjectQueue('sales-export') private readonly salesQueue: Queue,
        private readonly paymentService: PaymentService,
        private readonly catalogService: CatalogService,
        private readonly priceService: PriceService,
    ) { }

    async createSaleFromSession(sessionId: string, userId: string): Promise<Sale> {
        // Transactional Lock
        return this.dataSource.transaction(async (manager) => {
            // 1. Fetch Session (Locked? For now, standard fetch, relying on Status check)
            // Accessing Session via Service restricted to public API. 
            // Better: We need access to Entity or a specialized method in SessionService.
            // For MVP: We assume SessionService exposes methods or we reuse Repository pattern if strictly needed,
            // but plan said "Prefer accessing Sessions via SessionService".
            // So we call a method. We might need to add `getSession` to SessionService.
            const session = await this.sessionService.getSession(sessionId);

            if (!session) throw new NotFoundException('Session not found');
            if (session.customerId !== userId) throw new BadRequestException('Session belongs to another user');

            // 2. Validate Status
            if (session.status !== SessionStatus.CLOSED) {
                throw new BadRequestException(`Session must be CLOSED to convert to Sale. Current: ${session.status}`);
            }

            // 3. Idempotency Check
            const existingSale = await manager.findOne(Sale, { where: { sessionId } });
            if (existingSale) {
                return existingSale;
            }

            // 4. Create Snapshot
            const sale = manager.create(Sale, {
                sessionId: session.id,
                storeId: session.storeId,
                customerId: session.customerId,
                total: session.total,
                status: SaleStatus.CREATED,
                items: JSON.parse(JSON.stringify(session.cart)), // Deep Copy Snapshot
            });

            const savedSale = await manager.save(Sale, sale);
            this.logger.log(`Sale ${savedSale.id} created from Session ${sessionId}`);
            return savedSale;
        });
    }

    async getSale(saleId: string, userId: string): Promise<Sale> {
        const sale = await this.saleRepo.findOne({ where: { id: saleId } });
        if (!sale) throw new NotFoundException('Sale not found');
        if (sale.customerId !== userId) throw new BadRequestException('Access denied');
        return sale;
    }

    async syncOfflineSale(dto: CreateOfflineSaleDto): Promise<Sale> {
        // Validation: Math Integrity Check
        const calculatedTotal = dto.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
        // Using tolerance for floating point math
        if (Math.abs(calculatedTotal - dto.total) > 0.05) {
            throw new BadRequestException("Integrity Check Failed: Item sum does not match Total");
        }

        // Idempotency Check
        const existing = await this.saleRepo.findOne({ where: { offlineId: dto.offlineId } });
        if (existing) {
            return existing;
        }

        const sale = this.saleRepo.create({
            offlineId: dto.offlineId,
            storeId: dto.storeId,
            customerId: dto.customerId,
            total: dto.total,
            status: SaleStatus.CREATED,
            items: dto.items,
            createdAt: new Date(dto.occurredAt),
        });

        const savedSale = await this.saleRepo.save(sale);
        this.logger.log(`Offline Sale ${savedSale.id} synced (Offline Ref: ${dto.offlineId})`);
        return savedSale;
    }

    async confirmPayment(dto: PaymentWebhookDto): Promise<Sale> {
        const sale = await this.saleRepo.findOne({ where: { id: dto.saleId } });
        if (!sale) throw new NotFoundException(`Sale ${dto.saleId} not found`);

        // Idempotency: Already paid?
        if (sale.status === SaleStatus.PAID) {
            this.logger.warn(`Sale ${dto.saleId} already PAID. Ignoring webhook.`);
            return sale;
        }

        // State Check
        if (sale.status === SaleStatus.CANCELLED) {
            throw new BadRequestException(`Cannot pay CANCELLED sale ${dto.saleId}`);
        }

        sale.status = SaleStatus.PAID;
        sale.paymentMeta = dto.payload || { transactionId: dto.transactionId, status: dto.status };

        const updatedSale = await this.saleRepo.save(sale);
        this.logger.log(`Sale ${sale.id} confirmed via Webhook (Tx: ${dto.transactionId})`);

        // Dispatch to ERP Queue
        await this.salesQueue.add('erpnext-sync-invoice', { saleId: updatedSale.id });
        this.logger.log(`Sale ${sale.id} queued for ERPNext export`);

        return updatedSale;
    }

    async processDirectCheckout(userId: string, dto: CreateDirectSaleDto): Promise<any> {
        // 1. Process Items & Validate Stock (Mock logic for now)
        // In real implementation: Inject PriceService/StockService
        let total = 0;
        const saleItems = [];

        for (const item of dto.items) {
            // Mock Price Lookup (should be from DB)
            const unitPrice = 10.00; // Mock price
            const itemTotal = unitPrice * item.quantity;

            // Mock Stock Check
            if (item.quantity > 999) {
                throw new BadRequestException(`Insufficient stock for product ${item.productCode}`);
            }

            total += itemTotal;
            saleItems.push({
                productCode: item.productCode,
                quantity: item.quantity,
                unitPrice: unitPrice,
                totalPrice: itemTotal,
                description: `Product ${item.productCode}` // Mock description
            });
        }

        // 2. Create Sale
        const sale = this.saleRepo.create({
            storeId: 'STORE-001', // Should come from context or dto
            customerId: userId || 'GUEST',
            total: total,
            status: SaleStatus.PENDING_PAYMENT,
            items: saleItems,
            erpSyncStatus: 'PENDING'
        });

        const savedSale = await this.saleRepo.save(sale);

        // 3. Generate Real PIX (Mercado Pago)
        const paymentData = await this.paymentService.generatePix(
            total,
            `Honest Market Sale #${savedSale.id}`,
            'cliente@pdv-jgm.com' // Should be dynamic if user has email
        );

        // Update Sale with Payment Meta
        savedSale.paymentMeta = {
            transactionId: paymentData.transactionId,
            provider: 'mercadopago',
            fullResponse: paymentData
        };
        await this.saleRepo.save(savedSale);

        return {
            saleId: savedSale.id,
            total: savedSale.total,
            pixCode: paymentData.copyPaste,
            qrCodeBase64: paymentData.qrCodeBase64,
            status: savedSale.status
        };
    }

    async seedTestProduct(): Promise<any> {
        // 1. Create Product
        const product = await this.catalogService.saveProduct({
            code: 'COCA_350',
            name: 'Coca-Cola 350ml',
            description: 'Refrigerante Coca-Cola Lata 350ml',
            uom: 'UN',
            barcode: '789123456',
            isActive: true
        });

        // 2. Set Stock
        await this.catalogService.updateStock({
            productCode: product.code,
            warehouseId: 'DEFAULT',
            quantity: 100,
            updatedAt: new Date().toISOString()
        });

        // 3. Set Price
        await this.priceService.savePrice({
            productCode: product.code,
            priceList: 'Standard',
            rate: 1.00,
            currency: 'BRL',
            validFrom: new Date().toISOString()
        });

        return {
            message: 'Coca-Cola seeded successfully',
            product: {
                name: product.name,
                barcode: product.barcode,
                stock: 100,
                price: 1.00
            }
        };
    }
}

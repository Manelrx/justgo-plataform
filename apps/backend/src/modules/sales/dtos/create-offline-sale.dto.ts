export class OfflineSaleItemDto {
    productCode!: string;
    quantity!: number;
    unitPrice!: number;
    totalPrice!: number; // Redundant but good for integrity check
}

export class CreateOfflineSaleDto {
    offlineId!: string;
    storeId!: string;
    customerId!: string;
    total!: number;
    items!: OfflineSaleItemDto[];
    occurredAt!: string | Date;
}

export interface IOfflineSaleItemDto {
    productCode: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface ICreateOfflineSaleDto {
    offlineId: string;
    storeId: string;
    customerId: string;
    total: number;
    items: IOfflineSaleItemDto[];
    occurredAt: string | Date;
}

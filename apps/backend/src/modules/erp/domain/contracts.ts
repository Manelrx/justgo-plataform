export interface ProductDTO {
    code: string; // ERP Item Code
    name: string;
    description?: string;
    uom: string; // Unit of Measure (e.g., 'UN', 'KAIXA')
    barcode?: string;
    isActive: boolean;

    // Separation of Concerns: Price is often separate, but basics might be here.
    // We will keep Price strictly separate in PriceListDTO if needed, 
    // but for simple sync, standard_rate might be included in Product.
    // However, per user request, we treat Price separate.
}

export interface StockDTO {
    productCode: string;
    warehouseId: string;
    quantity: number;
    updatedAt: string; // ISO String - Critical for conflict resolution
}

export interface PriceListDTO {
    productCode: string;
    priceList: string; // e.g., 'Standard Selling', 'PDV_JGM'
    rate: number;
    currency: string;
    validFrom?: string;
}

export class PaymentWebhookDto {
    saleId!: string;
    status!: string;
    transactionId!: string;
    payload?: any;
}

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { MercadoPagoConfig, Payment } from 'mercadopago';

@Injectable()
export class PaymentService {
    private readonly logger = new Logger(PaymentService.name);
    private readonly client: MercadoPagoConfig;
    private readonly payment: Payment;

    constructor() {
        if (!process.env.MP_ACCESS_TOKEN) {
            this.logger.error('MP_ACCESS_TOKEN not defined in environment');
        }

        this.client = new MercadoPagoConfig({
            accessToken: process.env.MP_ACCESS_TOKEN || '',
            options: { timeout: 10000 }
        });

        this.payment = new Payment(this.client);
    }

    async generatePix(transactionAmount: number, description: string, payerEmail: string) {
        try {
            const idempotencyKey = `PIX-${Date.now()}-${Math.random().toString(36).substring(7)}`;

            const response = await this.payment.create({
                body: {
                    transaction_amount: transactionAmount,
                    description: description,
                    payment_method_id: 'pix',
                    payer: {
                        email: payerEmail
                    },
                },
                requestOptions: { idempotencyKey }
            });

            if (!response.point_of_interaction?.transaction_data) {
                throw new Error('QR Code data missing from MP response');
            }

            return {
                transactionId: response.id?.toString(),
                copyPaste: response.point_of_interaction.transaction_data.qr_code,
                qrCodeBase64: response.point_of_interaction.transaction_data.qr_code_base64,
                ticketUrl: response.point_of_interaction.transaction_data.ticket_url,
                status: response.status
            };

        } catch (error: any) {
            this.logger.error(`Failed to generate PIX: ${error.message}`, error.stack);
            throw new BadRequestException('Payment generation failed');
        }
    }
}

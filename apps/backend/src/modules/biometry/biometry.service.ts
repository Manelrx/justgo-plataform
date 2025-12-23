import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class BiometryService {
    private readonly logger = new Logger(BiometryService.name);

    async verify(userId: string): Promise<boolean> {
        this.logger.log(`Verifying biometric access for User: ${userId}`);

        // Mock Logic:
        // 'USER_FAIL' -> Denied
        // Others -> Approved
        if (userId === 'USER_FAIL') {
            this.logger.warn(`Biometric Access DENIED for ${userId}`);
            return false;
        }

        this.logger.log(`Biometric Access APPROVED for ${userId}`);
        return true;
    }
}

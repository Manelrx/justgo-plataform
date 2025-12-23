import { Injectable, CanActivate, ExecutionContext, ConflictException, Logger } from '@nestjs/common';
import { CacheService } from '../services/cache.service';

@Injectable()
export class IdempotencyGuard implements CanActivate {
    private readonly logger = new Logger(IdempotencyGuard.name);

    constructor(
        private readonly cacheService: CacheService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const key = request.headers['x-idempotency-key'] || request.body.idempotencyKey;

        if (!key) return true;

        const cacheKey = `IDEMPOTENCY:${key}`;
        const ttl = 60 * 60 * 24; // 24h default

        // Metadata for Audit
        const metadata = {
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            ip: request.ip
        };

        // ATOMIC LOCK: Try to acquire lock.
        const acquired = await this.cacheService.setNx(cacheKey, metadata, ttl);

        if (!acquired) {
            this.logger.warn(`Idempotency Conflict: Key ${key} already exists.`);
            // If lock not acquired, it means it's a duplicate request.
            // We throw Conflict to indicate "Already Processed" or "Processing".
            throw new ConflictException('Request already processed or in progress. (Idempotency)');
        }

        return true;
    }
}

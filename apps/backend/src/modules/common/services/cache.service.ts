import { Injectable, Inject, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../../../config/redis.config';

@Injectable()
export class CacheService {
    private readonly logger = new Logger(CacheService.name);

    constructor(
        @Inject(REDIS_CLIENT) private readonly redis: Redis,
    ) { }

    async get<T>(key: string): Promise<T | null> {
        const value = await this.redis.get(key);
        if (!value) return null;
        try {
            return JSON.parse(value) as T;
        } catch {
            return value as unknown as T;
        }
    }

    async set(key: string, value: any, ttlSeconds: number): Promise<void> {
        const stringValue = typeof value === 'object' ? JSON.stringify(value) : value;
        await this.redis.set(key, stringValue, 'EX', ttlSeconds);
    }

    /**
     * ATOMIC IDEMPOTENCY GUARD
     * Sets the key only if it does not exist.
     * 
     * @param key Key to consistency
     * @param value Metadata for audit (e.g. { timestamp: '...', requestId: '...' } )
     * @param ttlSeconds Lock duration
     * @returns true if lock acquired (new operation), false if key exists (duplicate)
     */
    async setNx(key: string, value: any, ttlSeconds: number): Promise<boolean> {
        const stringValue = typeof value === 'object' ? JSON.stringify(value) : value;
        try {
            // SET key value EX (Seconds) NX (Only if Not exists)
            const result = await this.redis.set(key, stringValue, 'EX', ttlSeconds, 'NX');
            return result === 'OK';
        } catch (err) {
            this.logger.error(`Redis Error on SETNX for key ${key}`, err);
            // Fail-safe: If Redis fails, assume lock failed (deny) to ensure safety?
            // Or throw to let Guard decide? 
            // The guard catches generic errors, so throwing is better.
            throw err;
        }
    }

    async del(key: string): Promise<void> {
        await this.redis.del(key);
    }
}

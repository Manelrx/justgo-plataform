import { Test, TestingModule } from '@nestjs/testing';
import { IdempotencyGuard } from '../guards/idempotency.guard';
import { CacheService } from '../services/cache.service';
import { ExecutionContext, ConflictException } from '@nestjs/common';
import { REDIS_CLIENT } from '../../../config/redis.config';

describe('IdempotencyGuard', () => {
    let guard: IdempotencyGuard;
    let cacheService: CacheService;

    const mockRedis = {
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                IdempotencyGuard,
                CacheService,
                {
                    provide: REDIS_CLIENT,
                    useValue: mockRedis,
                },
            ],
        }).compile();

        guard = module.get<IdempotencyGuard>(IdempotencyGuard);
        cacheService = module.get<CacheService>(CacheService);
    });

    it('should return TRUE if setNx returns true (New Request)', async () => {
        // Mock setNx to return TRUE (Lock Acquired)
        jest.spyOn(cacheService, 'setNx').mockResolvedValue(true);

        const context = {
            switchToHttp: () => ({
                getRequest: () => ({
                    headers: { 'x-idempotency-key': 'uuid-123' },
                    body: {},
                    url: '/test',
                    method: 'POST',
                    ip: '127.0.0.1'
                }),
            }),
        } as unknown as ExecutionContext;

        const result = await guard.canActivate(context);
        expect(result).toBe(true);
        expect(cacheService.setNx).toHaveBeenCalledWith(
            'IDEMPOTENCY:uuid-123',
            expect.objectContaining({ path: '/test' }),
            expect.any(Number)
        );
    });

    it('should THROW ConflictException if setNx returns false (Duplicate)', async () => {
        // Mock setNx to return FALSE (Lock Failed - Key exists)
        jest.spyOn(cacheService, 'setNx').mockResolvedValue(false);

        const context = {
            switchToHttp: () => ({
                getRequest: () => ({
                    headers: { 'x-idempotency-key': 'uuid-duplicate' },
                    body: {},
                }),
            }),
        } as unknown as ExecutionContext;

        await expect(guard.canActivate(context)).rejects.toThrow(ConflictException);
    });

    it('should IGNORE request without idempotency key', async () => {
        const context = {
            switchToHttp: () => ({
                getRequest: () => ({
                    headers: {}, // No key
                    body: {},
                }),
            }),
        } as unknown as ExecutionContext;

        const result = await guard.canActivate(context);
        expect(result).toBe(true);
        // Should NOT call cache
        jest.spyOn(cacheService, 'setNx');
        expect(cacheService.setNx).not.toHaveBeenCalled();
    });
});

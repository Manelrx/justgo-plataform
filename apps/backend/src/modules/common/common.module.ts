import { Module, Global } from '@nestjs/common';
import { CacheService } from './services/cache.service';
import { IdempotencyGuard } from './guards/idempotency.guard';
import { RedisModule } from '../../config/redis.config';

@Global()
@Module({
    imports: [RedisModule],
    providers: [CacheService, IdempotencyGuard],
    exports: [CacheService, IdempotencyGuard],
})
export class CommonModule { }

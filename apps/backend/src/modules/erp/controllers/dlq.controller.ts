import { Controller, Get, Post, Param, SetMetadata, UseGuards, Req } from '@nestjs/common';
import { DlqService } from '../services/dlq.service';

// Mock Roles Decorator for hardening awareness
const Roles = (...roles: string[]) => SetMetadata('roles', roles);

@Controller('erp/dlq')
export class DlqController {
    constructor(private readonly dlqService: DlqService) { }

    @Get()
    @Roles('ADMIN')
    async listFailedJobs() {
        // Read-only endpoint
        return this.dlqService.getFailedJobs();
    }

    @Post(':id/retry')
    @Roles('ADMIN')
    async retryJob(@Param('id') id: string, @Req() req: any) {
        // Mock User ID extraction (in real scenario, from JWT)
        const userId = req.user?.id || 'admin-placeholder';
        return this.dlqService.retryJob(id, userId);
    }
}

import { Test, TestingModule } from '@nestjs/testing';
import { BiometryService } from '../biometry.service';

describe('BiometryService', () => {
    let service: BiometryService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [BiometryService],
        }).compile();

        service = module.get<BiometryService>(BiometryService);
    });

    it('should approve valid users', async () => {
        const result = await service.verify('VALID_USER');
        expect(result).toBe(true);
    });

    it('should deny specific failed user', async () => {
        const result = await service.verify('USER_FAIL');
        expect(result).toBe(false);
    });
});

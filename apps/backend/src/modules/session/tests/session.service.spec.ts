import { Test, TestingModule } from '@nestjs/testing';
import { SessionService } from '../services/session.service';
import { Session, SessionStatus } from '../entities/session.entity';
import { PriceService } from '../../catalog/services/price.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';

const mockSessionRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
};

const mockPriceService = {
    getPrice: jest.fn(),
};

describe('SessionService', () => {
    let service: SessionService;
    let repo: any;
    let priceService: any;

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SessionService,
                {
                    provide: getRepositoryToken(Session),
                    useValue: mockSessionRepo,
                },
                {
                    provide: PriceService,
                    useValue: mockPriceService,
                },
            ],
        }).compile();

        service = module.get<SessionService>(SessionService);
        repo = module.get(getRepositoryToken(Session));
        priceService = module.get<PriceService>(PriceService);
    });

    describe('startSession', () => {
        it('should create a new session if none active', async () => {
            repo.findOne.mockResolvedValue(null);
            const newSession = { id: 's1', status: 'ACTIVE' };
            repo.create.mockReturnValue(newSession);
            repo.save.mockResolvedValue(newSession);

            const result = await service.startSession('u1', 'store1');

            expect(repo.findOne).toHaveBeenCalledWith({ where: { customerId: 'u1', storeId: 'store1', status: SessionStatus.ACTIVE } });
            expect(repo.create).toHaveBeenCalled();
            expect(result).toEqual(newSession);
        });

        it('should throw Conflict if active session exists', async () => {
            repo.findOne.mockResolvedValue({ id: 'existing' });

            await expect(service.startSession('u1', 'store1')).rejects.toThrow(ConflictException);
        });
    });

    describe('addItem', () => {
        it('should add item to cart and recalculate total', async () => {
            const session = { id: 's1', status: 'ACTIVE', cart: [], total: 0 };
            repo.findOne.mockResolvedValue(session);
            priceService.getPrice.mockResolvedValue({ price: 10, currency: 'BRL', productName: 'Item A' });
            repo.save.mockImplementation((s: any) => Promise.resolve(s));

            await service.addItem('s1', 'u1', 'CODE1', 2);

            expect(session.cart).toHaveLength(1);
            expect(session.cart[0]).toMatchObject({
                productCode: 'CODE1',
                productName: 'Item A',
                quantity: 2,
                unitPrice: 10,
                totalPrice: 20
            });
            expect(session.total).toBe(20);
        });

        it('should throw NotFound if price missing', async () => {
            repo.findOne.mockResolvedValue({ id: 's1', status: 'ACTIVE' });
            priceService.getPrice.mockResolvedValue(null);

            await expect(service.addItem('s1', 'u1', 'CODE1', 1)).rejects.toThrow(NotFoundException);
        });
    });

    describe('closeSession', () => {
        it('should close active session', async () => {
            const session = { id: 's1', status: 'ACTIVE', cart: [{ totalPrice: 10 }] };
            repo.findOne.mockResolvedValue(session);
            repo.save.mockImplementation((s: any) => Promise.resolve(s));

            const result = await service.closeSession('s1', 'u1');

            expect(result.status).toBe(SessionStatus.CLOSED);
        });

        it('should throw BadRequest if cart empty', async () => {
            const session = { id: 's1', status: 'ACTIVE', cart: [] };
            repo.findOne.mockResolvedValue(session);

            await expect(service.closeSession('s1', 'u1')).rejects.toThrow(BadRequestException);
        });
    });
});

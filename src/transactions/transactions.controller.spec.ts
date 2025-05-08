import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { Transaction, TransactionStatus } from '../entities/transaction.entity';
import { User } from '../entities/user.entity';

// Mocked User
const mockUser = new User();
mockUser.id = 1;
mockUser.email = 'test@example.com';
mockUser.balance = 1000;

// Mock data for a transaction
const mockTransaction = new Transaction();
mockTransaction.id = 1;
mockTransaction.amount = 100;
mockTransaction.status = TransactionStatus.PENDING;
mockTransaction.origin = mockUser;
mockTransaction.destination = mockUser; // Or another user
mockTransaction.createdAt = new Date();

// Mock TransactionsService
const mockTransactionsService = {
  getTransactionsForUser: jest.fn().mockResolvedValue([mockTransaction]),
  approveTransaction: jest.fn().mockResolvedValue({ ...mockTransaction, status: TransactionStatus.COMPLETED }),
  rejectTransaction: jest.fn().mockResolvedValue({ ...mockTransaction, status: TransactionStatus.FAILED }),
};

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let service: TransactionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: TransactionsService,
          useValue: mockTransactionsService,
        },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
    service = module.get<TransactionsService>(TransactionsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTransactionsForUser', () => {
    it('should call service.getTransactionsForUser with correct userId and return its result', async () => {
      const userId = 1;
      const result = await controller.getTransactionsForUser(userId);

      expect(service.getTransactionsForUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual([mockTransaction]);
    });
  });

  describe('approveTransaction', () => {
    it('should call service.approveTransaction with correct id and return its result', async () => {
      const transactionId = 1;
      const expectedResult = { ...mockTransaction, status: TransactionStatus.COMPLETED };
      const result = await controller.approveTransaction(transactionId);

      expect(service.approveTransaction).toHaveBeenCalledWith(transactionId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('rejectTransaction', () => {
    it('should call service.rejectTransaction with correct id and return its result', async () => {
      const transactionId = 1;
      const expectedResult = { ...mockTransaction, status: TransactionStatus.FAILED };

      const result = await controller.rejectTransaction(transactionId);

      expect(service.rejectTransaction).toHaveBeenCalledWith(transactionId);
      expect(result).toEqual(expectedResult);
    });
  });
}); 
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, FindOneOptions } from 'typeorm';
import { Transaction, TransactionStatus } from '../entities/transaction.entity';
import { User } from '../entities/user.entity';

interface CreateTransactionDto {
    originId: number;
    destinationId: number;
    amount: number;
}

@Injectable()
export class TransactionsService {
    constructor(
        @InjectRepository(Transaction)
        private txRepo: Repository<Transaction>,
        @InjectRepository(User)
        private userRepo: Repository<User>,
        private entityManager: EntityManager,
    ) {}
    
    // Helper method to fetch and validate a pending transaction
    private async _getPendingTransaction(
        transactionId: number,
        manager?: EntityManager,
        relations?: string[]
    ): Promise<Transaction> {
        const findOptions: FindOneOptions<Transaction> = {
            where: { id: transactionId },
            relations: relations || []
        };

        let transaction: Transaction | null;

        try {
            if (manager) {
                transaction = await manager.findOne(Transaction, findOptions);
            } else {
                transaction = await this.txRepo.findOne(findOptions);
            }

            if (!transaction) {
                throw new NotFoundException(`Transaction with ID ${transactionId} not found.`);
            }

            if (transaction.status !== TransactionStatus.PENDING) {
                throw new BadRequestException(
                    `Transaction with ID ${transactionId} is not in PENDING state. Current status: ${transaction.status}.`
                );
            }

            return transaction;
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            console.error('Error fetching transaction:', error);
            throw new BadRequestException('Error processing transaction');
        }
    }

    async getTransactionsForUser(userId: number): Promise<Transaction[]> {
        return this.txRepo.find({
            where: [
                { origin: { id: userId } },
                { destination: { id: userId } },
            ],
            order: { createdAt: 'DESC' },
            relations: ['origin', 'destination'],
        });
    }

    async approveTransaction(id: number): Promise<Transaction> {
        return this.entityManager.transaction(async manager => {
            try {
                const tx = await this._getPendingTransaction(id, manager, ['origin', 'destination']);

                const origin = await manager.findOne(User, {
                    where: { id: tx.origin.id },
                    lock: { mode: 'pessimistic_write' }
                });
                const dest = await manager.findOne(User, {
                    where: { id: tx.destination.id },
                    lock: { mode: 'pessimistic_write' }
                });

                if (!origin) {
                    throw new BadRequestException(`Origin user with ID ${tx.origin.id} not found for transaction ${id}.`);
                }
                if (!dest) {
                    throw new BadRequestException(`Destination user with ID ${tx.destination.id} not found for transaction ${id}.`);
                }

                const originBalance = parseFloat(origin.balance.toString());
                const transactionAmount = parseFloat(tx.amount.toString());

                if (originBalance < transactionAmount) {
                    throw new BadRequestException(
                        `Insufficient funds for user ${origin.id}. Required: ${transactionAmount}, Available: ${originBalance}.`
                    );
                }

                // Perform calculations with numbers
                origin.balance = originBalance - transactionAmount;
                dest.balance = parseFloat(dest.balance.toString()) + transactionAmount;
                tx.status = TransactionStatus.COMPLETED;

                await manager.save([origin, dest, tx]);
                return tx;
            } catch (error) {
                console.error('Error in transaction:', error);
                throw error;
            }
        });
    }

    async rejectTransaction(id: number): Promise<Transaction> {
        const tx = await this._getPendingTransaction(id);
        
        tx.status = TransactionStatus.FAILED;
        return this.txRepo.save(tx);
    }

    async createTransaction(dto: CreateTransactionDto): Promise<Transaction> {
        const origin = await this.userRepo.findOne({ where: { id: dto.originId } });
        if (!origin) {
            throw new NotFoundException(`User with ID ${dto.originId} not found.`);
        }

        const destination = await this.userRepo.findOne({ where: { id: dto.destinationId } });
        if (!destination) {
            throw new NotFoundException(`User with ID ${dto.destinationId} not found.`);
        }

        if (dto.amount <= 0) {
            throw new BadRequestException('Amount must be greater than 0.');
        }

        const transaction = new Transaction();
        transaction.origin = origin;
        transaction.destination = destination;
        transaction.amount = dto.amount;
        transaction.status = TransactionStatus.PENDING;

        return this.txRepo.save(transaction);
    }
}

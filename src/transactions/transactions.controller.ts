import { Controller, Get, Post, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) {}

    @Patch(':id/approve')
    async approveTransaction(@Param('id', ParseIntPipe) id: number) {
        return this.transactionsService.approveTransaction(id);
    }

    @Patch(':id/reject')
    async rejectTransaction(@Param('id', ParseIntPipe) id: number) {
        return this.transactionsService.rejectTransaction(id);
    }
}

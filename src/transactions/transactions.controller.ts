import { Controller, Get, Post, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) {}

    @ApiOperation({ summary: 'Approve a pending transaction' })
    @ApiParam({ name: 'id', type: 'number', description: 'Transaction ID' })
    @ApiResponse({ status: 200, description: 'Transaction approved successfully' })
    @ApiResponse({ status: 400, description: 'Transaction is not in PENDING state' })
    @ApiResponse({ status: 404, description: 'Transaction not found' })
    @Patch(':id/approve')
    async approveTransaction(@Param('id', ParseIntPipe) id: number) {
        return this.transactionsService.approveTransaction(id);
    }

    @ApiOperation({ summary: 'Reject a pending transaction' })
    @ApiParam({ name: 'id', type: 'number', description: 'Transaction ID' })
    @ApiResponse({ status: 200, description: 'Transaction rejected successfully' })
    @ApiResponse({ status: 400, description: 'Transaction is not in PENDING state' })
    @ApiResponse({ status: 404, description: 'Transaction not found' })
    @Patch(':id/reject')
    async rejectTransaction(@Param('id', ParseIntPipe) id: number) {
        return this.transactionsService.rejectTransaction(id);
    }
}

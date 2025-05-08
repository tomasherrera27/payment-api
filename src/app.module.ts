import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TransactionsModule } from './transactions/transactions.module';
import { databaseConfig } from './config/database.config';

@Module({
    imports: [
        TypeOrmModule.forRoot(databaseConfig),
        TransactionsModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}

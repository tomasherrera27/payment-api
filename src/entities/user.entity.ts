import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Transaction } from './transaction.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    email: string;

    @Column('decimal', { 
        precision: 10, 
        scale: 2, 
        default: 0,
        transformer: {
            to: (value: number) => value,
            from: (value: string) => parseFloat(value)
        }
    })
    balance: number;

    @OneToMany(() => Transaction, transaction => transaction.origin)
    outgoingTransactions: Transaction[];

    @OneToMany(() => Transaction, transaction => transaction.destination)
    incomingTransactions: Transaction[];
}
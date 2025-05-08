import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from './user.entity';

export enum TransactionStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED'
}

@Entity('transactions')
export class Transaction {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('decimal', { 
        precision: 10, 
        scale: 2,
        transformer: {
            to: (value: number) => value,
            from: (value: string) => parseFloat(value)
        }
    })
    amount: number;

    @Column({
        type: 'enum',
        enum: TransactionStatus,
        default: TransactionStatus.PENDING
    })
    status: TransactionStatus;

    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'origin_id' })
    origin: User;

    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'destination_id' })
    destination: User;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
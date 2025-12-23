import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum SessionStatus {
    ACTIVE = 'ACTIVE',
    CLOSED = 'CLOSED', // Ready for payment
    ABANDONED = 'ABANDONED',
    COMPLETED = 'COMPLETED' // Paid
}

export interface CartItem {
    productCode: string;
    productName: string;
    quantity: number;
    unitPrice: number; // Snapshot
    totalPrice: number; // Snapshot
    addedAt: string;
}

@Entity('sessions')
export class Session {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    @Index()
    customerId!: string; // Linked to Auth

    @Column()
    storeId!: string;

    @Column({
        type: 'enum',
        enum: SessionStatus,
        default: SessionStatus.ACTIVE
    })
    status!: SessionStatus;

    @Column({ type: 'jsonb', default: [] })
    cart!: CartItem[];

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    total!: number;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}

import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Product } from './product.entity';

@Entity('prices')
@Index(['product', 'priceList'], { unique: true }) // One price per list per product
export class Price {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => Product, { nullable: false, onDelete: 'CASCADE' })
    product!: Product;

    @Column()
    priceList!: string; // e.g. 'Standard Selling', 'VIP'

    @Column('decimal', { precision: 10, scale: 2 })
    price!: number;

    @Column({ default: 'BRL' })
    currency!: string;

    @Column({ type: 'timestamp', nullable: true })
    validFrom!: Date; // From ERP

    @Column({ type: 'timestamp', nullable: true })
    lastUpdatedAtSource!: Date; // For idempotency linking to internal logic if needed, or just rely on validFrom

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}

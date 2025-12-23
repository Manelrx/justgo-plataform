import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Product } from './product.entity';

@Entity('stocks')
@Index(['product', 'warehouseId'], { unique: true }) // Validation: One stock entry per product/warehouse
export class Stock {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => Product, { nullable: false, onDelete: 'CASCADE' })
    product!: Product;

    @Column()
    warehouseId!: string;

    @Column('decimal', { precision: 10, scale: 3 })
    quantity!: number;

    @Column({ type: 'timestamp', nullable: true })
    lastUpdatedAtSource!: Date; // Important: ERP's updatedAt

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date; // Local upsert time
}

import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('products')
export class Product {
    @PrimaryColumn()
    code!: string; // ERP Item Code (Source of Truth PK)

    @Column()
    name!: string;

    @Column({ nullable: true })
    description!: string;

    @Column()
    uom!: string; // United of Measure

    @Column({ nullable: true })
    barcode!: string;

    @Column({ default: true })
    isActive!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}

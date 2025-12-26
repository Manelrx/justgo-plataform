import { IsArray, IsNotEmpty, IsNumber, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDirectSaleItemDto {
    @IsString()
    @IsNotEmpty()
    productCode!: string;

    @IsNumber()
    @Min(1)
    quantity!: number;
}

export class CreateDirectSaleDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateDirectSaleItemDto)
    items!: CreateDirectSaleItemDto[];
}

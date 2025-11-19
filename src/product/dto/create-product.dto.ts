import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsNumber, IsOptional, IsPositive, 
    IsString, MinLength } from "class-validator";

export class CreateProductDto {

    
    @ApiProperty({
        description: 'product title (unique)',
        nullable: false,
        minLength: 1
    })
    @IsString()
    @MinLength(1)
    title: string;

    @ApiProperty()
    @IsPositive()
    @IsNumber()
    @IsOptional()
    price?: number;
    
    @ApiProperty()
    @IsOptional()
    @IsString()
    description?: string;
    
    @ApiProperty()
    @IsString({each: true})
    @IsArray()
    sizes: string[];
    
    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    active?: boolean;
    
    @ApiProperty()
    @IsString({each: true})
    @IsArray()
    @IsOptional()
    images?: string[]

}
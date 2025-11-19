import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  BeforeInsert,
  OneToMany,
} from 'typeorm';
import { ProductImage } from './product-image';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Product {
  
  @ApiProperty({
        example: '26b071e4-75f9-4897-bec8-0591804360e9',
        description: 'Product id',
        uniqueItems: true
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

  @ApiProperty()
  @Column('text', {
    unique: true,
  })
  title: string;

  @ApiProperty()
  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string;

  @Column('float', {
    nullable: true,
  })
  price?: number;

  @Column('text', {
    array: true,
    nullable: true,
  })
  sizes?: string[];

  @Column('bool', {
    default: true,
  })
  active: boolean;

    @OneToMany(
        ()=> ProductImage,
        (productImage) => productImage.product,
        {cascade: true} //evitar true para q no haya huerfanos
    )
    images?: ProductImage[]

  // Hook de TypeORM: se ejecuta ANTES de insertar el registro
  // Sirve para normalizar / transformar datos
  @BeforeInsert()
  checkTitleInsert() {
    if (this.title) {
      this.title = this.title.toUpperCase();
    }
  }


}

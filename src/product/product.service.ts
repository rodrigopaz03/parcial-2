import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductImage } from './entities/product-image';
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class ProductService {
  // Logger para dejar trazas de errores en consola
  private readonly logger = new Logger(ProductService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
  ) {}

  // Crear un producto usando TypeORM
async create(createProductDto: CreateProductDto) {
  try {
    // Separamos imágenes del resto de campos
    const { images = [], ...productDetails } = createProductDto;

    // Creamos la instancia de Product
    const product = this.productRepository.create({
      ...productDetails,
      // Por cada string de imagen, creamos una entidad ProductImage
      images: images.map((img) =>
        this.productImageRepository.create({ url: img }),
      ),
    });

    // Guardamos el producto (gracias a la relación, también se guardan las imágenes)
    await this.productRepository.save(product);

    // No queremos devolver el id de cada imagen, solo los strings originales
    return {
      ...product,
      images,
    };
  } catch (error) {
    this.handleDBExceptions(error);
  }
}


 async findAll(pagination: PaginationDto) {
    const {limit=10, offset=0} = pagination;
   try {
    return await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true
      }
    })
   } catch (error) {
    this.handleDBExceptions(error)
   }
  }

  // Obtener un producto por id (uuid)
  async findOne(id: string) {
    try {
      const product = await this.productRepository.findOneBy({ id });

      if (!product) {
        // Si no existe, lanzamos 404
        throw new NotFoundException(
          `Producto con el id ${id} no fue encontrado`,
        );
      }

      return product;
    } catch (error) {
      // Si ya es NotFound, la volvemos a lanzar
      if (error instanceof NotFoundException) {
        throw error;
      }
      // Si es error de BD, se maneja acá
      this.handleDBExceptions(error);
    }
  }

  // Eliminar un producto
  async remove(id: string) {
    try {
      const product = await this.findOne(id);
      await this.productRepository.remove(product);
      // Podrías retornar el producto borrado o un mensaje
      return { message: `Producto con id ${id} eliminado` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleDBExceptions(error);
    }
  }

  // Manejo centralizado de errores de la base de datos
  private handleDBExceptions(error: any): never {
    // 23505 = violación de unique constraint en Postgres
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    this.logger.error(error); // log completo del error en consola
    throw new InternalServerErrorException(
      'Unexpected error, check logs',
    );
  }
}


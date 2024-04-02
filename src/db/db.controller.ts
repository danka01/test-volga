import {
  Body,
  Controller,
  Get,
  Param,
  Query,
  Post,
  Patch,
  Delete,
  NotFoundException,
  HttpException,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiResponse, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { Product } from './db.entity';
import { ProductService } from './db.service';
import { CreateProductDto } from 'src/dto/create-product.dto';
import { UpdateProductDto } from 'src/dto/update-product.dto';
import { NotFoundResponse } from 'src/dto/typeError';

@Controller('products')
@ApiTags('todo')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'get all products',
    type: [Product],
  })
  async findAll(): Promise<Product[]> {
    return await this.productService.findAll();
  }

  @Get('/:id')
  @ApiResponse({ status: 200, description: 'get product by id', type: Product })
  @ApiResponse({
    status: 404,
    description: 'not found',
    type: NotFoundResponse,
  })
  async findOne(@Param('id') id: number): Promise<Product> {
    const product = await this.productService.findOne(id);
    if (!product) {
      throw new HttpException(
        'Product with id = ' + id + ' not exists',
        HttpStatus.NOT_FOUND,
      );
    }
    return product;
  }

  @Post()
  @ApiResponse({ status: 200, description: 'create product', type: Product })
  @ApiResponse({
    status: 404,
    description: 'not create',
    type: NotFoundResponse,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        price: { type: 'number' },
        quantity: { type: 'number' },
        photo: { type: 'string', format: 'binary' },
      },
      required: ['name', 'price', 'quantity', 'photo'],
    },
  })
  @UseInterceptors(FileInterceptor('photo'))
  @ApiConsumes('multipart/form-data')
  async create(
    @Body() productDto: CreateProductDto,
    @UploadedFile() photo: Express.Multer.File,
  ): Promise<Product> {
    if (productDto.quantity <= 0) {
      throw new NotFoundException('quantity must be > 0');
    }

    return await this.productService.create(productDto, photo);
  }

  @Patch('/:id')
  @ApiResponse({
    status: 200,
    description: 'update product by id',
    type: Product,
  })
  @ApiResponse({
    status: 404,
    description: 'not update',
    type: NotFoundResponse,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        price: { type: 'number' },
        quantity: { type: 'number' },
        photo: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('photo'))
  @ApiConsumes('multipart/form-data')
  async update(
    @Param('id') id: number,
    @Body() productDto: UpdateProductDto,
    @UploadedFile() photo: Express.Multer.File,
  ): Promise<Product> {
    const product = await this.productService.findOne(id);
    if (!product) {
      throw new NotFoundException('Product with id = ' + id + ' not exists');
    }
    await this.productService.update(id, productDto, photo);
    return product;
  }

  @Delete('/:id')
  @ApiResponse({ status: 200, description: 'delete product by id' })
  @ApiResponse({
    status: 404,
    description: 'not found',
    type: NotFoundResponse,
  })
  async remove(
    @Param('id') id: number,
    @Query('quantityToRemove') quantityToRemove: number,
  ): Promise<{ success: boolean }> {
    const product = await this.productService.findOne(id);
    if (!product) {
      throw new NotFoundException('Product with id = ' + id + ' not exists');
    }
    await this.productService.remove(id, quantityToRemove);
    return {
      success: true,
    };
  }
}

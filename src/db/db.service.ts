import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Product } from './db.entity';
import { CreateProductDto } from 'src/dto/create-product.dto';
import { UpdateProductDto } from 'src/dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async findAll(page: number = 1, limit: number = 10): Promise<Product[]> {
    return await this.productRepository.find({
      take: limit,
      skip: (page - 1) * limit,
    });
  }

  async findOne(id: number): Promise<Product> {
    return await this.productRepository.findOneBy({ id });
  }

  async create(
    productDto: CreateProductDto,
    photo: Express.Multer.File,
  ): Promise<Product> {
    const { name, price, quantity } = productDto;

    const fileName = `${Date.now()}-${photo.originalname}`;
    const uploadPath = path.join(
      __dirname,
      '..',
      '..',
      'src',
      'uploads',
      fileName,
    );

    await fs.promises.writeFile(uploadPath, photo.buffer);

    const product = this.productRepository.create({
      name,
      price,
      quantity,
      photo: fileName,
    });
    return this.productRepository.save(product);
  }

  async update(
    id: number,
    productDto: UpdateProductDto,
    photo: Express.Multer.File,
  ): Promise<Product> {
    const product = await this.findOne(id);
    if (productDto.quantity === undefined && productDto.quantity <= 0) {
      const productPhoto = product.photo;
      const uploadPath = path.join(
        __dirname,
        '..',
        '..',
        'src',
        'uploads',
        productPhoto,
      );
      fs.unlink(uploadPath, (err) => {
        if (err) throw err;
      });
      await this.remove(id, product.quantity);
    } else {
      if (productDto.name) {
        product.name = productDto.name;
      }
      if (productDto.price) {
        product.price = productDto.price;
      }
      if (productDto.quantity) {
        product.quantity = productDto.quantity;
      }
      if (photo) {
        const deletePath = path.join(
          __dirname,
          '..',
          '..',
          'src',
          'uploads',
          product.photo,
        );

        fs.unlink(deletePath, (err) => {
          if (err) throw err;
        });

        const fileName = `${Date.now()}-${photo.originalname}`;
        const uploadPath = path.join(
          __dirname,
          '..',
          '..',
          'src',
          'uploads',
          fileName,
        );
        fs.writeFileSync(uploadPath, photo.buffer);
        product.photo = fileName;
      }

      await this.productRepository.update(id, product);
      return this.findOne(id);
    }
  }

  async remove(id: number, quantityToRemove: number): Promise<void> {
    const product = await this.findOne(id);
    if (quantityToRemove >= product.quantity) {
      const deletePath = path.join(
        __dirname,
        '..',
        '..',
        'src',
        'uploads',
        product.photo,
      );

      fs.unlink(deletePath, (err) => {
        if (err) throw err;
      });
      await this.productRepository.delete(id);
    } else {
      product.quantity -= quantityToRemove;
      await this.productRepository.update(id, product);
    }
  }
}

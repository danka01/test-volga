import { Module } from '@nestjs/common';
import { config } from 'dotenv';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './db/db.entity';
import { ProductModule } from './db/db.module';
config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD || '123',
      database: process.env.DB_NAME,
      entities: [Product],
      synchronize: true,
    }),
    ProductModule,
  ],
})
export class AppModule {}

import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly price: number;

  @ApiProperty()
  readonly quantity: number;
}

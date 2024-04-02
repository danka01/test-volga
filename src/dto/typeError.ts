import { ApiProperty } from '@nestjs/swagger';

export class NotFoundResponse {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;
}

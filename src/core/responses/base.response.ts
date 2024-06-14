import { HttpStatus } from '@nestjs/common';

export class BaseResponse {
  statusCode: number;
  message: string;

  constructor(message: string, statusCode: number) {
    this.message = message;
    this.statusCode = statusCode;
  }
}

import { HttpStatus } from '@nestjs/common';
import { BaseResponse } from './base.response';

export class SuccessResponse<T> extends BaseResponse {
  data?: T;

  constructor(message: string = 'Success', statusCode: number = HttpStatus.OK, data?: T) {
    super(message, statusCode);
    this.data = data;
  }
}

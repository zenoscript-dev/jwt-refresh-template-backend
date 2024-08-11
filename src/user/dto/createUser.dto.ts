import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  IsObject,
  ValidateIf,
} from 'class-validator';
import { fileType } from '../types/file.type';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  userName: string;

  @IsString()
  @IsNotEmpty()
  loginId: string;

  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;

  @ValidateIf((o) => o.profilePic !== undefined)
  @IsObject()
  @IsOptional()
  profilePic?: fileType;
}

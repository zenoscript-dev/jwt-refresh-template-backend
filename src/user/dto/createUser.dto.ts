import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateUserDto{
  @IsString()
  @IsNotEmpty()
  username: string;


  @IsString()
  @IsNotEmpty()
  employeeId: string;


  @IsString()
  @IsNotEmpty()
  position: string;

  @IsString()
  @IsNotEmpty()
  loginId: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  password?: string;
}
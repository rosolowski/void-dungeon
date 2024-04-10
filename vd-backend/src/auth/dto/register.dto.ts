import {
  IsAlphanumeric,
  IsEmail,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterRequestDto {
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  @IsAlphanumeric()
  username: string;

  @IsString()
  @MinLength(8)
  @MaxLength(32)
  password: string;

  @IsEmail()
  email: string;
}

export class RegisterResponseDto {
  statusCode: number;
  message: string;
}

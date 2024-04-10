import {
  IsAlphanumeric,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import { User } from 'src/users/user.entity';

export class SignInRequestDto {
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  @IsAlphanumeric()
  username: string;

  @IsString()
  @MinLength(8)
  @MaxLength(32)
  password: string;
}

export class SignInResponseDto {
  jwt: string;
  user: Omit<User, 'password'>;
}

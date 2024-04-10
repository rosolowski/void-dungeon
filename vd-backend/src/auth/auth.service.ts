import * as bcrypt from 'bcrypt';

import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { RegisterRequestDto } from './dto/register.dto';
import { SignInResponseDto } from './dto/sign-in.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(username: string, pass: string): Promise<SignInResponseDto> {
    const dbUser = await this.usersService.findOneByUsername(username);

    if (!dbUser) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password, ...user } = dbUser;

    const isPasswordMatching = await bcrypt.compare(pass, password);
    if (!isPasswordMatching) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { id: user.id, username: user.username };
    const jwt = await this.jwtService.signAsync(payload);

    return {
      jwt,
      user,
    };
  }

  async register(registerDto: RegisterRequestDto): Promise<void> {
    const { username, email, password } = registerDto;

    const existingUsernameUser =
      await this.usersService.findOneByUsername(username);
    if (existingUsernameUser) {
      throw new HttpException(
        ['Username is already taken'],
        HttpStatus.BAD_REQUEST,
      );
    }

    const existingEmailUser = await this.usersService.findOneByEmail(email);
    if (existingEmailUser) {
      throw new HttpException(
        ['Email is already taken'],
        HttpStatus.BAD_REQUEST,
      );
    }

    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltOrRounds);

    await this.usersService.create({
      username,
      email,
      password: hashedPassword,
    });
  }
}

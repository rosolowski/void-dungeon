import { SignInRequestDto, SignInResponseDto } from './dto/sign-in.dto';
import { AuthService } from './auth.service';
import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { RegisterRequestDto, RegisterResponseDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(
    @Body() signInDto: SignInRequestDto,
  ): Promise<SignInResponseDto> {
    return await this.authService.signIn(
      signInDto.username,
      signInDto.password,
    );
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(
    @Body() registerDto: RegisterRequestDto,
  ): Promise<RegisterResponseDto> {
    try {
      await this.authService.register(registerDto);
      return {
        statusCode: 201,
        message: 'User registered successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          message: error.response,
          error: 'Bad request',
          statusCode: error.status,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}

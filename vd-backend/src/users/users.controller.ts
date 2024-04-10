import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { UsersService } from './users.service';
import {
  AddCharacterDto,
  RemoveCharacterDto,
} from './dto/manage-character.dto';
import { Character } from 'src/game/entities/character.entity';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(AuthGuard)
  @Get('characters')
  async getCharacters(@Request() req) {
    const user = await this.usersService.findOneByUsernameWithCharacters(
      req.user.username,
    );

    if (user) return user.characters;
    else throw new HttpException('User not found', HttpStatus.NOT_FOUND);
  }

  @UseGuards(AuthGuard)
  @Post('add-character')
  async addCharacter(
    @Request() req,
    @Body() addCharacterDto: AddCharacterDto,
  ): Promise<Character> {
    const userId = req.user.id;
    return this.usersService.createCharacterForUser(userId, addCharacterDto);
  }

  @UseGuards(AuthGuard)
  @Post('remove-character')
  async removeCharacter(
    @Request() req,
    @Body() removeCharacterDto: RemoveCharacterDto,
  ): Promise<{ message: string }> {
    const userId = req.user.id;
    await this.usersService.removeCharacterForUser(userId, removeCharacterDto);
    return { message: 'Character removed.' };
  }
}

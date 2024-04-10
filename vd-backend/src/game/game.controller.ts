import { Controller } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
  constructor(private gameService: GameService) {}

  // @HttpCode(HttpStatus.OK)
  // @UseGuards(AuthGuard)
  // @Post('player-character')
  // async getPlayerCharacter(
  //   @Request() req,
  //   @Body() getPlayerCharacter: GetPlayerCharacterDto,
  // ): Promise<Character> {
  //   console.log('*player fetching character in game*');
  //   const userId = req.user.id;
  //   const { characterId } = getPlayerCharacter;
  //   const character = await this.gameService.getPlayerCharacter(
  //     userId,
  //     characterId,
  //   );

  //   if (character) return character;
  //   else
  //     throw new HttpException(
  //       `Character with ID ${characterId} not found for this user`,
  //       HttpStatus.NOT_FOUND,
  //     );
  // }
}

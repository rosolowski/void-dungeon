import { Injectable } from '@nestjs/common';
import { BaseHandler, GameSocket } from './base.handler';
import { MoveCharacterDto } from '../dto/game.dto';
import { Character } from '../class/Character';
import { DungeonProgressService } from '../dungeon-progress.service';
import { PartyHandler } from './party.handler';

@Injectable()
export class MovementHandler extends BaseHandler {
  constructor(
    private readonly dungeonProgressService: DungeonProgressService,
    private readonly partyHandler: PartyHandler,
  ) {
    super();
  }

  handleMove(data: MoveCharacterDto, client: GameSocket): void {
    if (!this.validateClient(client)) return;

    try {
      const { x, y } = data;
      const character = client.data.character as Character;
      const move = this.game.moveCharacter(x, y, character);

      if (move.actionType === 'stairs') {
        this.partyHandler.initiateVote(client, 'nextLevel');
      }

      this.emitCharacterMove(client, move);
    } catch (error) {
      this.handleError(client, 'Move error', error);
    }
  }

  private emitCharacterMove(
    client: GameSocket,
    moveData: { success: boolean; room: string; newX: number; newY: number },
  ): void {
    const { success, room, newX, newY } = moveData;
    if (success) {
      client.to(room).emit('characterMoved', {
        characterId: client.data.character.id,
        x: newX,
        y: newY,
      });
    } else {
      client.emit('moveCorrection', { success, newX, newY });
    }
  }
}

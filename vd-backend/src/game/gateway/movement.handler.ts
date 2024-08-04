import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { BaseHandler } from './base.handler';
import { Game } from '../engine/game';
import { MoveCharacterDto } from '../dto/game.dto';
import { Character } from '../class/Character';
import { GameInstance } from '../class/GameInstance';

@Injectable()
export class MovementHandler extends BaseHandler {
  private readonly game: Game;
  private server: Server;

  constructor() {
    super();
    this.game = Game.getInstance();
  }

  public setServer(server: Server) {
    this.server = server;
  }

  handleMove(data: MoveCharacterDto, client: Socket): void {
    if (!this.validateClient(client)) return;

    try {
      const { x, y } = data;
      const character = client.data.character as Character;
      const moveData = this.game.moveCharacter(x, y, character);

      if (moveData.success && moveData.actionType === 'stairs') {
        this.handleStairsMovement(character, client);
      } else {
        this.emitCharacterMove(client, moveData);
      }
    } catch (error) {
      this.handleError(client, 'Move error', error);
    }
  }

  private handleStairsMovement(character: Character, client: Socket): void {
    const oldInstance = this.game.disconnectCharacterFromInstance(character);
    this.emitCharacterLeaveInstance(oldInstance, client);

    const newInstance = this.game.generateNewInstance();
    const { x, y } = newInstance.location.spawnCoords;
    character.setPos(x, y);
    character.pos.instanceId = newInstance.id;

    this.game.connectCharacterToInstance(character);
    this.emitCharacterJoinInstance(newInstance, client);
  }

  private emitCharacterMove(
    client: Socket,
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

  private emitCharacterLeaveInstance(
    instance: GameInstance,
    client: Socket,
  ): void {
    client.to(instance.room).emit('removeCharacter', client.data.character.id);
    client.leave(instance.room);
  }

  private emitCharacterJoinInstance(
    instance: GameInstance,
    client: Socket,
  ): void {
    client.join(instance.room);
    client.emit('getPlayerCharacter', client.data.character);
    client.emit('getInstance', instance.serialize());
    client.to(instance.room).emit('spawnCharacter', client.data.character);
  }
}

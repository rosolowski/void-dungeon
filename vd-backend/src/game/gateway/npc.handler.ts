import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { BaseHandler, GameSocket } from './base.handler';
import { Game } from '../engine/game';
import { Character } from '../class/Character';

export enum NpcAction {
  DoctorHeal = 1,
}

@Injectable()
export class NpcHandler extends BaseHandler {
  private readonly game: Game;
  private server: Server;

  constructor() {
    super();
    this.game = Game.getInstance();
  }

  public setServer(server: Server) {
    this.server = server;
  }

  handleNpcInteraction(client: GameSocket, actionId: NpcAction): void {
    const character = this.getCharacter(client);
    if (!character) return;

    switch (actionId) {
      case NpcAction.DoctorHeal: {
        character.stats.hp = character.stats.maxHp;
        client.emit('getStats', character.stats);
        break;
      }
    }
  }

  private getCharacter(client: GameSocket): Character | undefined {
    if (!client.data.character) {
      this.emitError(client, 'Character data not found');
      return undefined;
    }
    return client.data.character;
  }

  private emitError(client: GameSocket, message: string): void {
    client.emit('partyError', message);
  }
}

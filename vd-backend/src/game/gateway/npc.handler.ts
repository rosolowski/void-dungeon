import { Injectable } from '@nestjs/common';
import { BaseHandler, GameSocket } from './base.handler';
import { Character } from '../class/Character';

export enum NpcAction {
  DoctorHeal = 1,
}

@Injectable()
export class NpcHandler extends BaseHandler {
  constructor() {
    super();
  }

  handleNpcInteraction(client: GameSocket, actionId: NpcAction): void {
    const character = this.getCharacter(client);
    if (!character) return;

    switch (actionId) {
      case NpcAction.DoctorHeal: {
        character.stats.hp = character.stats.maxHp;
        this.emitCharacterUpdate(client, character);
        break;
      }
    }
  }

  private getCharacter(client: GameSocket): Character | undefined {
    if (!client.data.character) {
      this.handleError(
        client,
        'NPC Handler',
        new Error('Character data not found'),
      );
      return undefined;
    }
    return client.data.character;
  }
}

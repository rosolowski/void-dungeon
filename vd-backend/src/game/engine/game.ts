import { Character } from '../class/Character';
import { GameInstance } from '../class/GameInstance';
import { InstanceManager } from './instance-manager';

export class Game {
  private instanceManager = new InstanceManager();

  constructor() {}

  connectCharacter(character: Character): GameInstance {
    const instance = this.instanceManager.addCharacterToInstance(
      character,
      character.getInstance(),
    );

    return instance;
  }

  disconnectCharacter(character: Character): GameInstance {
    const instance = this.instanceManager.getInstanceFromCharacter(character);

    instance.characters.delete(character.id);

    return instance;
  }

  moveCharacter(
    x: number,
    y: number,
    character: Character,
  ): { success: boolean; room: string; newX: number; newY: number } {
    const instance = this.instanceManager.getInstanceFromCharacter(character);
    const canMove = instance.location.collisionMap[y][x] === 1;

    const oldX = character.pos.x;
    const oldY = character.pos.y;

    const isValidStep = character.isValidStep(x, y);

    if (canMove && isValidStep) {
      instance.characters.get(character.id).setPos(x, y);

      // valid move, send new coordinates
      return { success: true, room: instance.room, newX: x, newY: y };
    }

    // player not synced, send correct coordinates and fail move
    return { success: false, room: instance.room, newX: oldX, newY: oldY };
  }
}

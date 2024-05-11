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
  ): {
    success: boolean;
    room: string;
    newX: number;
    newY: number;
    actionType: string;
  } {
    const instance = this.instanceManager.getInstanceFromCharacter(character);
    const canMove = instance.location.collisionMap[y][x] === 1;

    const oldX = character.pos.x;
    const oldY = character.pos.y;

    const isValidStep = character.isValidStep(x, y);

    if (canMove && isValidStep) {
      instance.characters.get(character.id).setPos(x, y);

      if (instance.location.terrain[y][x] === 3) {
        // stairs
        return {
          success: true,
          room: instance.room,
          newX: x,
          newY: y,
          actionType: 'stairs',
        };
      }

      // valid move, send new coordinates
      return {
        success: true,
        room: instance.room,
        newX: x,
        newY: y,
        actionType: 'move',
      };
    }

    // player not synced, send correct coordinates and fail move
    return {
      success: false,
      room: instance.room,
      newX: oldX,
      newY: oldY,
      actionType: 'move',
    };
  }

  moveCharacterToNewInstance(
    oldInstanceId: number,
    character: Character,
  ): GameInstance {
    this.instanceManager.removePlayerFromInstance(character, oldInstanceId);
    const instance = this.instanceManager.addGameInstance();

    this.instanceManager.addCharacterToInstance(character, instance.id);

    return instance;
  }
}

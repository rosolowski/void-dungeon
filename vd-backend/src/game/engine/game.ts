import { Character } from '../class/Character';
import { GameInstance } from '../class/GameInstance';
import { AttackLog, simulateAttack } from './battle-manager';
import { InstanceManager } from './instance-manager';
import { Collision, Tile } from './utils';

export class Game {
  private instanceManager = new InstanceManager();

  constructor() {}

  connectCharacterToInstance(character: Character): GameInstance {
    const instance = this.instanceManager.addCharacterToInstance(
      character,
      character.getInstance(),
    );

    return instance;
  }

  disconnectCharacterFromInstance(character: Character): GameInstance {
    const instance = this.instanceManager.getInstanceFromCharacter(character);
    this.instanceManager.removeCharacterFromInstance(character, instance.id);

    return instance;
  }

  generateNewInstance(): GameInstance {
    // this.disconnectCharacterFromInstance(character);
    const instance = this.instanceManager.addGameInstance();

    // this.instanceManager.addCharacterToInstance(character, instance.id);

    return instance;
  }

  moveCharacterToCity(character: Character): GameInstance {
    this.disconnectCharacterFromInstance(character);

    this.instanceManager.moveCharacterToCity(character);

    const instance = this.instanceManager.getCityInstance();

    return instance;
  }

  attackEntity(
    character: Character,
    entityId: number,
  ): {
    success: boolean;
    room: string;
    attackLog?: AttackLog;
  } {
    const instance = this.instanceManager.getInstanceFromCharacter(character);
    const entity = instance.entities.get(entityId);

    if (!entity || !instance) {
      // invalid entity/instance
      return {
        success: false,
        room: '',
      };
    }

    // check if can attack (by position)
    const xDiff = Math.abs(character.pos.x - entity.pos.x);
    const yDiff = Math.abs(character.pos.y - entity.pos.y);
    const isValid =
      (xDiff === 1 && yDiff === 0) || (xDiff === 0 && yDiff === 1);

    if (!isValid) {
      // invalid positions
      return {
        success: false,
        room: '',
      };
    }

    const attackLog = simulateAttack(character, entity);

    return {
      success: false,
      room: instance.room,
      attackLog,
    };
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
    const canMove = instance.location.collisionMap[y][x] === Collision.WALKABLE;

    const oldX = character.pos.x;
    const oldY = character.pos.y;

    const isValidStep = character.isValidStep(x, y);

    if (canMove && isValidStep) {
      instance.characters.get(character.id).setPos(x, y);

      if (instance.location.terrain[y][x] === Tile.STAIRS) {
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
}

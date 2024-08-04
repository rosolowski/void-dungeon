import { Character } from '../class/Character';
import { Entity } from '../class/Entity';
import { GameInstance } from '../class/GameInstance';
import { AttackLog, simulateAttack } from './battle-manager';
import { InstanceManager } from './instance-manager';
import { Collision, Tile } from './utils';

export class Game {
  private static instance: Game;
  private instanceManager: InstanceManager;

  private constructor() {
    this.instanceManager = new InstanceManager();
  }

  public static getInstance(): Game {
    if (!Game.instance) {
      Game.instance = new Game();
    }
    return Game.instance;
  }

  connectCharacterToInstance(character: Character): GameInstance {
    return this.instanceManager.addCharacterToInstance(
      character,
      character.pos.instanceId,
    );
  }

  disconnectCharacterFromInstance(character: Character): GameInstance {
    const instance = this.instanceManager.getInstanceFromCharacter(character)!;
    this.instanceManager.removeCharacterFromInstance(character, instance.id);
    return instance;
  }

  generateNewInstance(): GameInstance {
    return this.instanceManager.addGameInstance();
  }

  addCharacterToCity(character: Character): GameInstance {
    this.instanceManager.addCharacterToCity(character);
    return this.instanceManager.getCityInstance();
  }

  removeEntity(instance: GameInstance, entityId: number): void {
    const entity = instance.entities.get(entityId);
    if (entity) {
      const { x, y } = entity.pos;
      instance.location.collisionMap[y][x] = Collision.WALKABLE;
      instance.entities.delete(entityId);
    }
  }

  attackEntity(
    character: Character,
    entityId: number,
  ): { success: boolean; instance?: GameInstance; attackLog?: AttackLog } {
    const instance = this.instanceManager.getInstanceFromCharacter(character);
    if (!instance) return { success: false };

    const entity = instance.entities.get(entityId);

    if (!entity) return { success: false };

    const isValidAttack = this.isValidAttackPosition(character, entity);
    if (!isValidAttack) return { success: false };

    const attackLog = simulateAttack(character, entity);

    return { success: true, instance, attackLog };
  }

  private isValidAttackPosition(character: Character, entity: Entity): boolean {
    const xDiff = Math.abs(character.pos.x - entity.pos.x);
    const yDiff = Math.abs(character.pos.y - entity.pos.y);
    return (xDiff === 1 && yDiff === 0) || (xDiff === 0 && yDiff === 1);
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
    if (!instance) {
      return this.createMoveResult(
        false,
        '',
        character.pos.x,
        character.pos.y,
        'move',
      );
    }

    const canMove = instance.location.collisionMap[y][x] === Collision.WALKABLE;
    const isValidStep = character.isValidStep(x, y);

    if (canMove && isValidStep) {
      const characterInInstance = instance.characters.get(character.id);
      if (!characterInInstance) {
        return this.createMoveResult(
          false,
          instance.room,
          character.pos.x,
          character.pos.y,
          'move',
        );
      }

      characterInInstance.setPos(x, y);

      if (instance.location.terrain[y][x] === Tile.STAIRS) {
        return this.createMoveResult(true, instance.room, x, y, 'stairs');
      }

      return this.createMoveResult(true, instance.room, x, y, 'move');
    }

    return this.createMoveResult(
      false,
      instance.room,
      character.pos.x,
      character.pos.y,
      'move',
    );
  }

  private createMoveResult(
    success: boolean,
    room: string,
    newX: number,
    newY: number,
    actionType: string,
  ): {
    success: boolean;
    room: string;
    newX: number;
    newY: number;
    actionType: string;
  } {
    return { success, room, newX, newY, actionType };
  }
}

import { CITY_LOCATION, CITY_SPAWN_COORDINATES } from '../constants';

import { Character } from '../class/Character';
import { Entity } from '../class/Entity';
import { GameInstance } from '../class/GameInstance';
import { Location } from '../class/Location';
import { MapGenerator } from '../class/MapGenerator';
import { applyEntitiesToCollisionMap, terrainToCollisionMap } from './utils';

export class InstanceManager {
  private instances = new Map<number, GameInstance>();
  private nextFreeInstance: number = 1;

  constructor() {
    this.instances.set(
      0,
      new GameInstance(
        0,
        'city',
        CITY_LOCATION,
        new Map<number, Character>(),
        new Map<number, Entity>(),
      ),
    );
  }

  addGameInstance(): GameInstance {
    const newInstanceId = this.nextFreeInstance;
    const location = new Location();

    const generator = new MapGenerator(80, 50);
    generator.generateTerrainAndEntities(1, newInstanceId);

    const entities = generator.getEntities();
    const entityMap = entities.reduce((map, entity) => {
      map.set(entity.id, entity);
      return map;
    }, new Map<number, Entity>());

    const terrain = generator.getTerrain();

    location.terrain = terrain;
    location.collisionMap = terrainToCollisionMap(terrain);
    location.collisionMap = applyEntitiesToCollisionMap(
      location.collisionMap,
      entities,
    );
    location.width = generator.width;
    location.height = generator.height;
    location.spawnCoords = generator.spawnPos;

    const newInstance = new GameInstance(
      newInstanceId,
      `instance-${newInstanceId}`,
      location,
      new Map<number, Character>(),
      entityMap,
    );

    this.instances.set(newInstanceId, newInstance);
    this.nextFreeInstance++;

    return newInstance;
  }

  disposeInstance(instanceId: number): void {
    this.instances.delete(instanceId);
  }

  getInstanceFromCharacter(character: Character): GameInstance {
    return this.instances.get(character.pos.instanceId);
  }

  getCityInstance(): GameInstance {
    return this.instances.get(0);
  }

  removeCharacterFromInstance(character: Character, instanceId: number) {
    const instance = this.instances.get(instanceId);

    instance.characters.delete(character.id);
  }

  addCharacterToInstance(
    character: Character,
    instanceId: number,
  ): GameInstance {
    let instance = this.instances.get(instanceId);

    // if instance doesnt exist - move player to city
    if (!instance) {
      instance = this.getCityInstance();
      const { x, y } = CITY_SPAWN_COORDINATES;
      character.setPos(x, y);
      character.pos.instanceId = 0;
    }

    if (instance.characters.get(character.id)) {
      console.log(`character ${character.id} already in the instance!`);
    } else {
      instance.characters.set(character.id, character);
    }

    return instance;
  }

  addCharacterToCity(character: Character) {
    const instance = this.getCityInstance();
    const { x, y } = instance.location.spawnCoords;
    character.setPos(x, y);
    character.pos.instanceId = 0;
    instance.characters.set(character.id, character);
  }
}

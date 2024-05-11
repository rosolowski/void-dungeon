import { CITY_LOCATION, CITY_SPAWN_COORDINATES } from '../constants';

import { Character } from '../class/Character';
import { Entity } from '../class/Entity';
import { GameInstance } from '../class/GameInstance';
import { Location } from '../class/Location';
import { MapGenerator } from '../class/MapGenerator';
import { terrainToCollisionMap } from './utils';

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

    const mapGen = new MapGenerator(80, 50);
    mapGen.generateTerrain();
    mapGen.spawnEntities(1, newInstanceId);

    const entities = mapGen.getEntities();
    const entityMap = entities.reduce((map, entity) => {
      map.set(entity.id, entity);
      return map;
    }, new Map<number, Entity>());

    const terrain = mapGen.getTerrain();

    location.terrain = terrain;
    location.collisionMap = terrainToCollisionMap(terrain);
    location.width = mapGen.width;
    location.height = mapGen.height;
    location.spawnCoords = mapGen.spawnPos;

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

  removePlayerFromInstance(character: Character, instanceId: number) {
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

  moveCharacterToInstance(character: Character, instanceId: number) {
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
  }
}

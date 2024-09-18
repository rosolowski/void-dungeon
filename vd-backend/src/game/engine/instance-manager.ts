import { CITY_LOCATION, CITY_SPAWN_COORDINATES } from '../constants';
import { Character } from '../class/Character';
import { Entity } from '../class/Entity';
import { GameInstance } from '../class/GameInstance';
import { Location } from '../class/Location';
import { MapGenerator } from '../class/MapGenerator';
import { applyEntitiesToCollisionMap, terrainToCollisionMap } from './utils';
import { Stats } from '../class/Stats';
import { CITY_INSTANCE_ID } from '../constants';

export class InstanceManager {
  private instances = new Map<number, GameInstance>();
  private nextFreeInstance: number = 1;

  constructor() {
    this.initializeCityInstance();
  }

  private initializeCityInstance(): void {
    const cityInstance = new GameInstance(
      CITY_INSTANCE_ID,
      0,
      'city',
      CITY_LOCATION,
      new Map<number, Character>(),
      new Map<number, Entity>(),
    );

    const merchant = new Entity(
      0,
      'npc',
      { x: 1, y: 4, instanceId: CITY_INSTANCE_ID },
      'The Merchant',
      50,
      new Stats(),
    );
    const doctor = new Entity(
      1,
      'npc',
      { x: 2, y: 4, instanceId: CITY_INSTANCE_ID },
      'The Doctor',
      75,
      new Stats(),
    );
    const portal = new Entity(
      2,
      'npc',
      { x: 16, y: 13, instanceId: CITY_INSTANCE_ID },
      'The Portal',
      500,
      new Stats(),
    );
    cityInstance.entities.set(0, merchant);
    cityInstance.entities.set(1, doctor);
    cityInstance.entities.set(2, portal);
    cityInstance.location.collisionMap = applyEntitiesToCollisionMap(
      cityInstance.location.collisionMap,
      [merchant, doctor, portal],
    );

    this.instances.set(CITY_INSTANCE_ID, cityInstance);
  }

  addGameInstance(depth: number): GameInstance {
    const newInstanceId = this.nextFreeInstance++;
    const { location, entities } = this.generateNewLocation(depth);
    const entityMap = new Map(entities.map((entity) => [entity.id, entity]));

    const newInstance = new GameInstance(
      newInstanceId,
      depth,
      `instance:${newInstanceId}`,
      location,
      new Map<number, Character>(),
      entityMap,
    );

    this.instances.set(newInstanceId, newInstance);
    return newInstance;
  }

  private generateNewLocation(depth: number): {
    location: Location;
    entities: Entity[];
  } {
    const generator = new MapGenerator(80, 50);
    generator.generateTerrainAndEntities(depth, this.nextFreeInstance);

    const location = new Location();
    location.terrain = generator.getTerrain();
    location.collisionMap = terrainToCollisionMap(location.terrain);
    const entities = generator.getEntities();
    location.collisionMap = applyEntitiesToCollisionMap(
      location.collisionMap,
      entities,
    );
    location.width = generator.width;
    location.height = generator.height;
    location.spawnCoords = generator.spawnPos;

    return { location, entities };
  }

  disposeInstance(instanceId: number): void {
    this.instances.delete(instanceId);
  }

  getInstanceFromCharacter(character: Character): GameInstance | undefined {
    return this.instances.get(character.pos.instanceId);
  }

  getCityInstance(): GameInstance {
    return this.instances.get(CITY_INSTANCE_ID)!;
  }

  removeCharacterFromInstance(character: Character, instanceId: number): void {
    const instance = this.instances.get(instanceId);
    if (instance) {
      instance.characters.delete(character.id);
    }
  }

  addCharacterToInstance(
    character: Character,
    instanceId: number,
  ): GameInstance {
    let instance = this.instances.get(instanceId);

    if (!instance) {
      instance = this.getCityInstance();
      const { x, y } = CITY_SPAWN_COORDINATES;
      character.setPos(x, y);
      character.pos.instanceId = CITY_INSTANCE_ID;
    }

    if (!instance.characters.has(character.id)) {
      instance.characters.set(character.id, character);
    }

    return instance;
  }

  addCharacterToCity(character: Character): void {
    const cityInstance = this.getCityInstance();
    const { x, y } = cityInstance.location.spawnCoords;
    character.setPos(x, y);
    character.pos.instanceId = CITY_INSTANCE_ID;
    cityInstance.characters.set(character.id, character);
  }
}

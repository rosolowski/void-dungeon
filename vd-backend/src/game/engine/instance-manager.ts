import { CITY_LOCATION, CITY_SPAWN_COORDINATES } from '../constants';

import { Character } from '../class/Character';
import { Entity } from '../class/Entity';
import { GameInstance } from '../class/GameInstance';
import { Location } from '../class/Location';

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
    const location = new Location();
    location.generate();

    const newInstance = new GameInstance(
      this.nextFreeInstance,
      `instance-${this.nextFreeInstance}`,
      location,
      new Map<number, Character>(),
      new Map<number, Entity>(),
    );

    this.instances.set(this.nextFreeInstance, newInstance);
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

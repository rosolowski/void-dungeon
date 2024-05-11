import { Character } from './Character';
import { Entity } from './Entity';
import { Location } from './Location';

export class GameInstance {
  constructor(
    public id: number,
    public room: string,
    public location: Location,
    public characters: Map<number, Character>,
    public entities: Map<number, Entity>,
  ) {}

  serialize() {
    return {
      room: this.room,
      location: this.location,
      characters: Array.from(this.characters.values()),
      entities: Array.from(this.entities.values()),
    };
  }
}

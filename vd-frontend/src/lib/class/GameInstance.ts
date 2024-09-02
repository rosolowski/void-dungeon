import { Character } from './Character';
import { Entity } from './Entity';
import { Location } from './Location';

export class GameInstance {
	constructor(
		public room: string,
		public depth: number,
		public location: Location,
		public characters: Character[],
		public entities: Entity[]
	) {}
}

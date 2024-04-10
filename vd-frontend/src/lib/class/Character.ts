import { CharacterAvatar } from './CharacterAvatar';
import { Entity } from './Entity';
import { Stats } from './Stats';

export class Character extends Entity {
	constructor(
		id: number,
		pos: { x: number; y: number; instanceId: number },
		name: string,
		level: number,
		stats: Stats,
		public charClass: string,
		public exp: number,
		public maxExp: number,
		public avatar: CharacterAvatar
	) {
		super(id, 'character', pos, name, level, stats);
	}
}

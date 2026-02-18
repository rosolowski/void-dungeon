import { CharacterAvatar } from './CharacterAvatar';
import { Entity } from './Entity';
import { Stats } from './Stats';

export const CharacterClasses = [
	'Blood Knight',
	'Berserk',
	'Toxin Rogue',
	'Shadow Monk',
	'Battle Mage'
] as const;

export type CharacterClass = (typeof CharacterClasses)[number];

export class Character extends Entity {
	constructor(
		id: number,
		pos: { x: number; y: number; instanceId: number },
		name: string,
		level: number,
		stats: Stats,
		public charClass: CharacterClass,
		public exp: number,
		public maxExp: number,
		public avatar: CharacterAvatar,
		public skillIds: string[] = []
	) {
		super(id, 'character', pos, name, level, stats);
	}
}

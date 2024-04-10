import { Stats } from './Stats';

type entityType = 'character' | 'monster' | 'npc' | 'chest';

export class Entity {
	constructor(
		public id: number,
		public type: entityType,
		public pos: { x: number; y: number; instanceId: number },
		public name: string,
		public level: number,
		public stats: Stats
	) {}
}

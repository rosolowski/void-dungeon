import { Equipment } from './Equipment';
import type { Item } from './Item';

export class Inventory {
	constructor(
		public slots: Map<number, Item>,
		public capacity: number = 60,
		public gold: number = 0,
		public shards: number = 0,
		public equipment: Equipment = new Equipment()
	) {}
}

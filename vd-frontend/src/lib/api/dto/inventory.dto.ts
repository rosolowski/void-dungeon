import type { Equipment } from '$lib/class/Equipment';
import type { Item } from '$lib/class/Item';

export class SerializedInventoryDto {
	constructor(
		public slots: Item[],
		public capacity: number,
		public gold: number,
		public shards: number,
		public equipment: Equipment
	) {}
}

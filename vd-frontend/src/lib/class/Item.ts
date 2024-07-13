import { Stats } from './Stats';

export type ItemType = 'weapon' | 'secondary' | 'armor' | 'boots' | 'talisman' | 'helmet';

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export class Item {
	constructor(
		public id: number = -1,
		public name: string = 'unkown',
		public description: string = 'An unkown item',
		public type: ItemType = 'weapon',
		public rarity: ItemRarity = 'common',
		public stats: Stats
	) {}

	static fromJSON(itemJson: {
		id: number;
		name: string;
		description: string;
		type: ItemType;
		rarity: ItemRarity;
		stats: Stats;
	}): Item {
		return new Item(
			itemJson.id,
			itemJson.name,
			itemJson.description,
			itemJson.type,
			itemJson.rarity,
			itemJson.stats
		);
	}
}

import { Item } from './Item';

export class Equipment {
	constructor(
		public helmet: Item | null = null,
		public weapon: Item | null = null,
		public secondary: Item | null = null,
		public armor: Item | null = null,
		public boots: Item | null = null,
		public talisman: Item | null = null
	) {}

	static fromJSON(equipmentJson: Equipment): Equipment {
		return new Equipment(
			equipmentJson.helmet ? Item.fromJSON(equipmentJson.helmet) : null,
			equipmentJson.weapon ? Item.fromJSON(equipmentJson.weapon) : null,
			equipmentJson.secondary ? Item.fromJSON(equipmentJson.secondary) : null,
			equipmentJson.armor ? Item.fromJSON(equipmentJson.armor) : null,
			equipmentJson.boots ? Item.fromJSON(equipmentJson.boots) : null,
			equipmentJson.talisman ? Item.fromJSON(equipmentJson.talisman) : null
		);
	}
}

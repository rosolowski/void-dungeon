import { weaponImages } from './weapons';
import { secondaryImages } from './secondary';
import { armorImages } from './armor';
import { bootsImages } from './boots';
import { talismanImages } from './talisman';
import { helmetImages } from './helmet';

import type { ItemRarity, ItemType } from '$lib/class/Item';

export const itemImages: Record<ItemType, string[]> = {
	weapon: weaponImages,
	secondary: secondaryImages,
	armor: armorImages,
	boots: bootsImages,
	talisman: talismanImages,
	helmet: helmetImages
};

export function getItemImage(type: ItemType, rarity: ItemRarity, id: number): string {
	const images = itemImages[type];
	const totalImages = images.length;

	const rarityRanges = {
		// common: [0, Math.floor(totalImages / 5)],
		// uncommon: [Math.floor(totalImages / 5), Math.floor((2 * totalImages) / 5)],
		// rare: [Math.floor((2 * totalImages) / 5), Math.floor((3 * totalImages) / 5)],
		// epic: [Math.floor((3 * totalImages) / 5), Math.floor((4 * totalImages) / 5)],
		// legendary: [Math.floor((4 * totalImages) / 5), totalImages],
		common: [0, Math.floor(totalImages / 5)],
		uncommon: [0, Math.floor((2 * totalImages) / 5)],
		rare: [0, Math.floor((3 * totalImages) / 5)],
		epic: [0, Math.floor((4 * totalImages) / 5)],
		legendary: [Math.floor((3 * totalImages) / 5), totalImages]
	};

	const [start, end] = rarityRanges[rarity];
	const rangeSize = end - start;
	const index = start + (id % rangeSize);

	return images[index];
}

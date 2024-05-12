import { Equipment } from '$lib/class/Equipment';
import { Inventory } from '$lib/class/Inventory';
import { Item } from '$lib/class/Item';
import type { SerializedInventoryDto } from '$lib/api/dto/inventory.dto';
import { Stats } from '$lib/class/Stats';
import { addItemToInventory } from '$lib/api/services/inventory.service';
import { writable } from 'svelte/store';

export const inventory = writable<Inventory | null>(null);

export function addTestItem() {
	const testItem: Partial<Item> = {
		name: 'unkown',
		description: 'An unkown item',
		type: 'weapon',
		stats: new Stats()
	};

	addItemToInventory(testItem);
	// console.log('added test item!');
}

export function initializeInventory(data: SerializedInventoryDto) {
	const slotsMap = new Map<number, Item>();
	data.slots.forEach((itemJson, index) => {
		if (itemJson) slotsMap.set(index, Item.fromJSON(itemJson));
	});

	const equipmentInstance = Equipment.fromJSON(data.equipment);

	const deserializedInventory = new Inventory(
		slotsMap,
		data.capacity,
		data.gold,
		data.shards,
		equipmentInstance
	);

	inventory.set(deserializedInventory);
}

export function processAddItem(item: Item, slotIndex: number) {
	inventory.update((prev) => {
		if (!prev) return prev;

		const slots = prev.slots;
		slots.set(slotIndex, item);

		return {
			...prev,
			slots
		};
	});
}

import type { Item, ItemType } from '$lib/class/Item';

import { characterId } from '$lib/store/auth';
import { get } from 'svelte/store';
import { inventory } from '$lib/store/inventory';
import { socket } from '$lib/store/ws';

function determineEquipmentSlot(index: number): ItemType {
	switch (index) {
		case 0:
			return 'helmet';
		case 1:
			return 'weapon';
		case 2:
			return 'armor';
		case 3:
			return 'secondary';
		case 4:
			return 'boots';
		case 5:
			return 'talisman';
		default:
			throw new Error('Invalid equipment slot index');
	}
}

export function handleItemAction(
	sourceSlotType: 'inventory' | 'equipment' | 'merchant',
	sourceSlotIndex: number,
	targetSlotType: 'inventory' | 'equipment' | 'merchant',
	targetSlotIndex: number
) {
	const client = get(socket);
	if (!client) return;
	const characterIdValue = get(characterId);

	if (sourceSlotType === 'inventory' && targetSlotType === 'merchant' && targetSlotIndex === 0) {
		client.emit('sellItem', {
			characterId: characterIdValue,
			slotIndex: sourceSlotIndex
		});

		// Optimistic prediction
		inventory.update((prev) => {
			if (!prev) return prev;

			const newSlots = new Map(prev.slots);
			newSlots.delete(sourceSlotIndex);
			return {
				...prev,
				slots: newSlots
			};
		});
	}

	// Equip Action: Moving from inventory to equipment
	if (sourceSlotType === 'inventory' && targetSlotType === 'equipment') {
		client.emit('equipItem', {
			characterId: characterIdValue,
			fromSlotId: sourceSlotIndex,
			equipmentSlot: determineEquipmentSlot(targetSlotIndex)
		});

		// optimistic prediction
		inventory.update((prev) => {
			if (!prev) return prev;

			const newSlots = new Map(prev.slots);
			newSlots.delete(sourceSlotIndex);
			return {
				...prev,
				slots: newSlots
			};
		});
	}

	// Unequip Action: Moving from equipment to inventory
	else if (sourceSlotType === 'equipment' && targetSlotType === 'inventory') {
		client.emit('unequipItemToSlot', {
			characterId: characterIdValue,
			equipmentSlot: determineEquipmentSlot(sourceSlotIndex),
			targetSlotId: targetSlotIndex
		});

		// Optimistic prediction
		inventory.update((prev) => {
			if (!prev) return prev;

			prev.equipment[determineEquipmentSlot(sourceSlotIndex)] = null;
			return {
				...prev
			};
		});
	}

	// Move Action: Moving within inventory
	else if (sourceSlotType === 'inventory' && targetSlotType === 'inventory') {
		client.emit('moveItem', {
			characterId: characterIdValue,
			fromSlotId: sourceSlotIndex,
			targetSlotId: targetSlotIndex
		});

		// Optimistic prediction
		inventory.update((prev) => {
			if (!prev) return prev;

			const newSlots = new Map(prev.slots);
			newSlots.delete(sourceSlotIndex);
			return {
				...prev,
				slots: newSlots
			};
		});
	}
}

export function dismantleItem(slotIndex: number) {
	const client = get(socket);
	if (!client) return;

	client.emit('dismantleItem', { slotIndex });
}

export function dismantleAllItems(rarity: string) {
	const client = get(socket);
	if (!client) return;

	client.emit('dismantleAllItems', { rarity });
}

export function addItemToInventory(itemData: Partial<Item>) {
	const client = get(socket);
	if (!client) return;

	// Emit the addItem event with the item data
	client.emit('addItem', itemData);
}

export function buyRandomItem() {
	const client = get(socket);
	if (!client) return;

	client.emit('buyRandomItem');
}

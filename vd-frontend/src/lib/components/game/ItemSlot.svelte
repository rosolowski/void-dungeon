<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { clearDrag, itemDrag, startDrag } from '$lib/store/item-drag';
	import { Item, type ItemType } from '$lib/class/Item';
	import ItemComponent from './ItemComponent.svelte';
	import { get } from 'svelte/store';
	import { handleItemAction } from '$lib/api/services/inventory.service';
	import { contextMenu } from '$lib/store/context-menu';

	export let item: Item | null = null;
	export let slotType: 'inventory' | 'equipment' | 'merchant';
	export let slotIndex: number;
	export let acceptableTypes: ItemType[] | undefined = undefined;

	const dispatch = createEventDispatcher();

	let isDragged: boolean = false;

	$: if (!$itemDrag.isDragging && isDragged) {
		isDragged = false;
	}

	function onMouseDown(event: MouseEvent): void {
		if (event.button !== 0) return;
		event.preventDefault();
		if (item) {
			startDrag(item, slotType, slotIndex);
			isDragged = true;
		}
	}

	function onMouseUp(): void {
		const currentDrag = get(itemDrag);
		if (
			currentDrag.isDragging &&
			currentDrag.item &&
			currentDrag.sourceType &&
			(currentDrag.sourceType !== slotType || currentDrag.sourceIndex !== slotIndex)
		) {
			if (currentDrag.sourceType === 'inventory' && slotType === 'merchant' && slotIndex === 0) {
				handleItemAction(currentDrag.sourceType, currentDrag.sourceIndex, slotType, slotIndex);
			} else if (!acceptableTypes || acceptableTypes.includes(currentDrag.item.type)) {
				handleItemAction(currentDrag.sourceType, currentDrag.sourceIndex, slotType, slotIndex);
			}
		}
		clearDrag();
	}

	function onContextMenu(event: MouseEvent) {
		event.preventDefault();
		if (!item) return;

		contextMenu.open(event.clientX, event.clientY, getContextMenuOptions());
	}

	function getContextMenuOptions() {
		if (!item) return [];

		const options = [];

		if (
			item.type === 'weapon' ||
			item.type === 'armor' ||
			item.type === 'boots' ||
			item.type === 'helmet' ||
			item.type === 'talisman' ||
			item.type === 'secondary'
		) {
			options.push({
				label: 'Equip',
				action: () =>
					handleItemAction('inventory', slotIndex, 'equipment', getEquipmentSlotIndex(item.type))
			});
		}

		options.push({
			label: 'Dismantle',
			action: () => {
				dispatch('dismantle');
			}
		});

		return options;
	}

	function getEquipmentSlotIndex(itemType: ItemType): number {
		switch (itemType) {
			case 'helmet':
				return 0;
			case 'weapon':
				return 1;
			case 'armor':
				return 2;
			case 'secondary':
				return 3;
			case 'boots':
				return 4;
			case 'talisman':
				return 5;
			default:
				throw new Error('Invalid item type for equipment');
		}
	}

	$: rarityClass = item ? item.rarity : 'empty';
</script>

<div
	class="slot {rarityClass}"
	on:mousedown={onMouseDown}
	on:mouseup={onMouseUp}
	on:contextmenu={onContextMenu}
>
	{#if item && !isDragged}
		<ItemComponent {item} />
	{/if}
</div>

<style lang="scss">
	.slot {
		width: 48px;
		height: 48px;
		box-shadow: inset 0 0 8px var(--tetriary);
		border: 1px solid var(--tetriary);
		background-color: var(--background);
		user-select: none;
		-webkit-user-drag: none;

		&:hover {
			border: 1px solid var(--secondary);
		}

		&.empty {
			box-shadow: inset 0 0 2px var(--tetriary);
		}

		&.empty {
			box-shadow: inset 0 0 8px var(--tetriary);
		}

		&.common {
			box-shadow: inset 0 0 8px var(--rarityCommon);
			border: 1px solid var(--rarityCommon);
		}

		&.uncommon {
			box-shadow: inset 0 0 8px var(--rarityUncommon);
			border: 1px solid var(--rarityUncommon);
		}

		&.rare {
			box-shadow: inset 0 0 8px var(--rarityRare);
			border: 1px solid var(--rarityRare);
		}

		&.epic {
			box-shadow: inset 0 0 8px var(--rarityEpic);
			border: 1px solid var(--rarityEpic);
		}

		&.legendary {
			box-shadow: inset 0 0 8px var(--rarityLegendary);
			border: 1px solid var(--rarityLegendary);
		}
	}
</style>

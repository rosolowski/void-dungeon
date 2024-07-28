<script lang="ts">
	import { clearDrag, itemDrag, startDrag } from '$lib/store/item-drag';
	import { Item, type ItemType } from '$lib/class/Item';
	import ItemComponent from './ItemComponent.svelte';
	import { get } from 'svelte/store';
	import { handleItemAction } from '$lib/api/services/inventory.service';

	export let item: Item | null = null;
	export let slotType: 'inventory' | 'equipment';
	export let slotIndex: number;
	export let acceptableTypes: ItemType[] | undefined = undefined;

	let isDragged: boolean = false;

	$: if (!$itemDrag.isDragging && isDragged) {
		isDragged = false;
	}

	function onMouseDown(event: MouseEvent): void {
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
			(currentDrag.sourceType !== slotType || currentDrag.sourceIndex !== slotIndex) &&
			(!acceptableTypes || acceptableTypes.includes(currentDrag.item.type))
		) {
			handleItemAction(currentDrag.sourceType, currentDrag.sourceIndex, slotType, slotIndex);
		}
		clearDrag();
	}

	$: rarityClass = item ? item.rarity : 'empty';
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="slot {rarityClass}" on:mousedown={onMouseDown} on:mouseup={onMouseUp}>
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

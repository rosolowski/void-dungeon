<script lang="ts">
	import { inventory } from '$lib/store/inventory';
	import gold from '../../assets/items/currency/gold.png';
	import shards from '../../assets/items/currency/shards.png';
	import ItemSlot from '../game/ItemSlot.svelte';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	const tweenedGold = tweened(0, {
		duration: 400,
		easing: cubicOut
	});
	const tweenedShards = tweened(0, {
		duration: 400,
		easing: cubicOut
	});

	$: if ($inventory) {
		tweenedGold.set($inventory.gold);
		tweenedShards.set($inventory.shards);
	}
</script>

<div class="inventory-window">
	{#if $inventory}
		<div class="currency">
			<div class="gold">
				<img src={gold} width="16px" height="16px" alt="gold" />
				GOLD: <span class="value">{Math.round($tweenedGold)}</span>
			</div>
			<div class="shards">
				<img src={shards} width="16px" height="16px" alt="shards" />
				SHARDS:
				<span class="value">{Math.round($tweenedShards)}</span>
			</div>
		</div>

		<div class="slots">
			{#each { length: $inventory.capacity } as _, i}
				<ItemSlot slotIndex={i} slotType="inventory" item={$inventory.slots.get(i)}></ItemSlot>
			{/each}
		</div>
	{/if}
</div>

<style lang="scss">
	.inventory-window {
		width: 365px;
		height: 428px;
		display: flex;
		flex-direction: column;

		.currency {
			padding: 20px;
			border-bottom: 1px solid var(--tetriary);
			color: var(--secondary);

			div {
				display: flex;
				align-items: center;
				gap: 5px;
			}

			.gold .value {
				color: gold;
			}

			img {
				image-rendering: pixelated;
			}

			.value {
				color: var(--primary);
				min-width: 6ch;
				display: inline-block;
				text-align: left;
			}
		}

		.slots {
			padding: 20px;
			flex: 1;
			margin: 0 auto;
			display: flex;
			gap: 20px;
			flex-wrap: wrap;
			overflow-y: scroll;
		}
	}
</style>

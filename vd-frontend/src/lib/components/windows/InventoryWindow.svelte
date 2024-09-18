<script lang="ts">
	import { inventory } from '$lib/store/inventory';
	import gold from '../../assets/items/currency/gold.png';
	import shards from '../../assets/items/currency/shards.png';
	import ItemSlot from '../game/ItemSlot.svelte';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { socket } from '$lib/store/ws';
	import { get } from 'svelte/store';

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

	const rarityOptions = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
	let selectedRarity = 'Common';

	function dismantleItem(slotIndex: number) {
		const client = get(socket);
		if (!client) return;

		client.emit('dismantleItem', { slotIndex });
	}

	function dismantleAll() {
		const client = get(socket);
		if (!client) return;

		client.emit('dismantleAllItems', { rarity: selectedRarity.toLowerCase() });
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

		<div class="dismantle-all">
			<select bind:value={selectedRarity}>
				{#each rarityOptions as rarity}
					<option value={rarity}>{rarity}</option>
				{/each}
			</select>
			<button class="danger" on:click={dismantleAll}>[Dismantle {selectedRarity}]</button>
		</div>

		<div class="slots">
			{#each { length: $inventory.capacity } as _, i}
				<ItemSlot
					slotIndex={i}
					slotType="inventory"
					item={$inventory.slots.get(i)}
					on:dismantle={() => dismantleItem(i)}
				/>
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

		.dismantle-all {
			padding: 10px 20px;
			display: flex;
			justify-content: space-between;
			align-items: center;
			border-bottom: 1px solid var(--tetriary);

			select {
				padding: 5px;
				background-color: var(--background);
				color: var(--text);
				border: 1px solid var(--secondary);
				font-family: var(--font-mono);
				outline: none;
				box-shadow: none;
				font-size: 14px;
			}

			button {
				padding: 6px;
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

<script lang="ts">
	import { inventory } from '$lib/store/inventory';
	import ItemSlot from '../game/ItemSlot.svelte';
</script>

<div class="inventory-window">
	{#if $inventory}
		<div class="currency">
			<div class="gold">GOLD: <span class="value">{$inventory.gold}</span></div>
			<div class="shards">SHARDS: <span class="value">{$inventory.shards}</span></div>
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

			.value {
				color: var(--primary);
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

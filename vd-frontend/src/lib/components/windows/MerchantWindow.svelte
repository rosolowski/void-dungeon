<script lang="ts">
	import { buyRandomItem } from '$lib/api/services/inventory.service';
	import { inventory } from '$lib/store/inventory';
	import { player } from '$lib/store/player';
	import ItemSlot from '../game/ItemSlot.svelte';

	$: stats = $player ? $player.stats : null;
	$: equipment = $inventory ? $inventory.equipment : null;
</script>

<div class="merchant-window">
	<div class="main-panel">
		<div class="main-panel-content">
			<div class="title">SELL ITEMS</div>
			You can trade in some items to earn gold.
			<div class="slots">
				<div class="sell">
					<ItemSlot slotType="merchant" slotIndex={0} />
				</div>
			</div>
			<div class="title">BUY ITEMS</div>
			<button on:click={buyRandomItem}
				>[BUY RANDOM ITEM <span class="gold">(500 gold)</span>]</button
			>
		</div>
	</div>
</div>

<style lang="scss">
	.merchant-window {
		width: 400px;
	}

	.main-panel {
		position: relative;

		.main-panel-content {
			padding: 0 20px;

			.slots {
				padding: 30px 0;
				display: flex;
				justify-content: center;
				gap: 15px;
			}

			.title {
				display: flex;
				justify-content: space-around;
				align-items: center;
				user-select: none;
				padding: 15px 0;
				color: var(--secondary);

				&::before {
					content: '';
					flex: 1;
					height: 1px;
					margin-right: 5px;
					background-image: linear-gradient(to left, var(--tetriary), transparent);
				}

				&::after {
					content: '';
					flex: 1;
					height: 1px;
					margin-left: 5px;
					background-image: linear-gradient(to right, var(--tetriary), transparent);
				}
			}
		}
	}

	.gold {
		color: var(--expLight);
	}
</style>

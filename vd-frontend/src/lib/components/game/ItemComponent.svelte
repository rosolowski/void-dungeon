<script lang="ts">
	import { getItemImage } from '$lib/assets/items';
	import type { Item } from '$lib/class/Item';
	import ItemTooltip from '../tooltips/ItemTooltip.svelte';

	export let item: Item;

	$: itemImage = getItemImage(item.type, item.rarity, item.id);
</script>

<ItemTooltip {item}>
	<div class="item">
		<img src={itemImage} alt={item.name} />
	</div>
</ItemTooltip>

<style lang="scss">
	.item {
		height: 100%;
		width: 100%;
		cursor: pointer;

		img {
			height: 100%;
			width: 100%;
			-webkit-user-drag: none;
			user-select: none;
			image-rendering: pixelated;
		}
	}
</style>

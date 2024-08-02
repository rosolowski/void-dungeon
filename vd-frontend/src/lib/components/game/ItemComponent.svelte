<script lang="ts">
	import { itemImages } from '$lib/assets/items';
	import type { Item } from '$lib/class/Item';
	import ItemTooltip from '../tooltips/ItemTooltip.svelte';

	export let item: Item;

	$: itemImageIndex = item.id % itemImages.length;
</script>

<ItemTooltip {item}>
	<div class="item">
		<img src={itemImages[itemImageIndex]} alt={item.name} />
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

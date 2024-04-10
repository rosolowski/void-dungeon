<script lang="ts">
	import { itemImages } from '$lib/assets/items';
	import type { Item } from '$lib/class/Item';

	export let item: Item;

	$: itemImageIndex = item.id % itemImages.length;
</script>

<div class="item">
	<img src={itemImages[itemImageIndex]} alt="" />
</div>

<style lang="scss">
	.item {
		height: 100%;
		width: 100%;

		img {
			height: 100%;
			width: 100%;
			-webkit-user-drag: none;
			user-select: none;
			image-rendering: pixelated;
		}
	}
</style>

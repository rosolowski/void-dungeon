<script lang="ts">
	import { itemDrag } from '$lib/store/itemDrag';
	import ItemComponent from './ItemComponent.svelte';

	let x: number = 0;
	let y: number = 0;

	function handleUpdateMouse(event: MouseEvent) {
		if (!$itemDrag.isDragging) return;

		x = event.clientX - 23;
		y = event.clientY - 23;
	}
</script>

<svelte:window on:mousemove={handleUpdateMouse} on:mousedown={handleUpdateMouse} />
<div style:left={`${x}px`} style:top={`${y}px`} class="item-dragged">
	{#if $itemDrag.isDragging && $itemDrag.item}
		<ItemComponent item={$itemDrag.item} />
	{/if}
</div>

<style>
	.item-dragged {
		position: fixed;
		pointer-events: none;
		z-index: var(--zi-item-drag);
		opacity: 0.5;
	}
</style>

<script lang="ts">
	import InputHandler from '$lib/components/viewport/InputHandler.svelte';
	import GameHud from './GameHud.svelte';
	import World from '$lib/components/viewport/World.svelte';
	import { player } from '$lib/store/player';
	import { location } from '$lib/store/location';
	import { renderer } from '$lib/store/renderer';

	let viewportWidth: number;
	let viewportHeight: number;

	function onWheel(event: WheelEvent) {
		if (event.deltaY < 0) {
			renderer.zoomIn();
		} else if (event.deltaY > 0) {
			renderer.zoomOut();
		}
	}

	let battleView = false;
</script>

<div
	class="viewport"
	bind:clientWidth={viewportWidth}
	bind:clientHeight={viewportHeight}
	on:wheel={onWheel}
>
	<InputHandler />

	{#if $player}
		<GameHud />
	{/if}

	{#if $player && $location}
		<World {viewportWidth} {viewportHeight} />
		<!-- <Battle /> -->
	{/if}
</div>

<style>
	.viewport {
		position: relative;
		flex: 1;
	}
</style>

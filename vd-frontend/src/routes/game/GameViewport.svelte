<script lang="ts">
	import InputHandler from '$lib/components/viewport/InputHandler.svelte';
	import GameHud from './GameHud.svelte';
	import World from '$lib/components/viewport/World.svelte';
	import { player } from '$lib/store/player';
	import { location } from '$lib/store/location';
	import { renderer } from '$lib/store/renderer';
	import EntityTracker from '$lib/components/viewport/EntityTracker.svelte';
	import Dialogue from '$lib/components/viewport/Dialogue.svelte';
	import Party from '$lib/components/game/Party.svelte';
	import Chat from '$lib/components/game/Chat.svelte';

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
	<EntityTracker />
	<Party />
	<Chat />

	{#if $player}
		<GameHud />
		<Dialogue />
	{/if}

	{#if $player && $location}
		<World {viewportWidth} {viewportHeight} />
	{/if}
</div>

<style>
	.viewport {
		position: relative;
		flex: 1;
	}
</style>

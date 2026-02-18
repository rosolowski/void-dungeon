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
	import DungeonLevel from '$lib/components/viewport/DungeonLevel.svelte';
	import LevelUp from '$lib/components/game/LevelUp.svelte';
	import LowHpEffect from '$lib/components/game/LowHpEffect.svelte';

	let viewportWidth: number;
	let viewportHeight: number;

	let zoomTimeout: ReturnType<typeof setTimeout> | null = null;
	const throttleDuration = 50;

	function onWheel(event: WheelEvent) {
		if (zoomTimeout) return;

		zoomTimeout = setTimeout(() => {
			if (event.deltaY < 0) {
				renderer.zoomIn();
			} else if (event.deltaY > 0) {
				renderer.zoomOut();
			}

			zoomTimeout = null;
		}, throttleDuration);
	}
</script>

<div
	class="viewport"
	bind:clientWidth={viewportWidth}
	bind:clientHeight={viewportHeight}
	on:wheel={onWheel}
>
	<InputHandler />
	<div class="entity-and-party">
		<EntityTracker />
		<Party />
	</div>
	
	<Chat />
	<DungeonLevel />
	<LevelUp />
	<LowHpEffect />

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

	.entity-and-party {
		position: absolute;
		top: 20px;
		right: 20px;
		display: flex;
		gap: 30px;
		align-items: flex-start;
	}
</style>

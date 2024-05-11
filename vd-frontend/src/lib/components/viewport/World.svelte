<script lang="ts">
	import { location } from '$lib/store/location';
	import { player } from '$lib/store/player';
	import { renderer } from '$lib/store/renderer';
	import { characters } from '$lib/store/characters';
	import { entities } from '$lib/store/entities';
	import Tile from '$lib/components/viewport/Tile.svelte';
	import Player from '$lib/components/viewport/Player.svelte';
	import Character from './Character.svelte';
	import Entity from './Entity.svelte';

	export let viewportWidth: number;
	export let viewportHeight: number;

	$: characterValues = [...$characters];

	$: px = $player!.pos.x;
	$: py = $player!.pos.y;
	$: tileSize = $renderer.tileSize;

	$: terrain = $location!.terrain;

	$: worldX = -px * tileSize + viewportWidth / 2 - tileSize / 2;
	$: worldY = -py * tileSize + viewportHeight / 2 - tileSize / 2;

	$: canRenderTile = $location!.terrain.map((row, y) =>
		row.map((tile, x) => {
			if (tile === 0) return false;

			const radius = 20;
			const distanceSquared = (x - $player!.pos.x) ** 2 + (y - $player!.pos.y) ** 2;
			return distanceSquared <= radius ** 2;
		})
	);
</script>

<div class="world" style="left: {worldX}px; top: {worldY}px;">
	<div class="terrain">
		{#each terrain as row, y (y)}
			{#each row as tile, x (x)}
				{#if tile !== 0 && canRenderTile[y][x]}
					<Tile {x} {y} {tile} />
				{/if}
			{/each}
		{/each}
	</div>
	{#each characterValues as [id, character] (id)}
		{#if canRenderTile[character.pos.y][character.pos.x]}
			<Character {character} />
		{/if}
	{/each}
	{#each $entities as [id, entity] (id)}
		{#if canRenderTile[entity.pos.y][entity.pos.x]}
			<Entity {entity} />
		{/if}
	{/each}
	<Player />
</div>

<style>
	.world {
		position: absolute;
		transition:
			top var(--secondaryEasingFunction) var(--secondarySpeed),
			left var(--secondaryEasingFunction) var(--secondarySpeed);
		will-change: top, left;
		user-select: none;
	}
</style>

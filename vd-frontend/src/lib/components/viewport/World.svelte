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
	import { fightNumbers } from '$lib/store/viewport-effects';
	import FightNumber from './FightNumber.svelte';
	import ChatMessageManager from './ChatMessageManager.svelte';

	export let viewportWidth: number;
	export let viewportHeight: number;

	$: px = $player!.pos.x;
	$: py = $player!.pos.y;
	$: tileSize = $renderer.tileSize;

	$: terrain = $location!.terrain;

	$: worldX = -px * tileSize + viewportWidth / 2 - tileSize / 2;
	$: worldY = -py * tileSize + viewportHeight / 2 - tileSize / 2;

	const RENDER_RADIUS = 12;

	$: visibleTerrain = getVisibleTerrain(terrain, px, py, RENDER_RADIUS);
	$: visibleCharacters = getVisibleEntities($characters, px, py, RENDER_RADIUS);
	$: visibleEntities = getVisibleEntities($entities, px, py, RENDER_RADIUS);

	function getVisibleTerrain(
		fullTerrain: number[][],
		centerX: number,
		centerY: number,
		radius: number
	) {
		const startX = Math.max(0, Math.floor(centerX - radius));
		const startY = Math.max(0, Math.floor(centerY - radius));
		const endX = Math.min(fullTerrain[0].length - 1, Math.floor(centerX + radius));
		const endY = Math.min(fullTerrain.length - 1, Math.floor(centerY + radius));

		const visibleTerrain = [];
		for (let y = startY; y <= endY; y++) {
			for (let x = startX; x <= endX; x++) {
				const tile = fullTerrain[y][x];
				if (tile !== 0) {
					visibleTerrain.push({ x, y, tile });
				}
			}
		}
		return visibleTerrain;
	}

	function getVisibleEntities<T extends { pos: { x: number; y: number } }>(
		entities: Map<number, T>,
		centerX: number,
		centerY: number,
		radius: number
	): [number, T][] {
		return [...entities].filter(([_, entity]) =>
			isWithinSquare(entity.pos.x, entity.pos.y, centerX, centerY, radius)
		);
	}

	function isWithinSquare(
		x: number,
		y: number,
		centerX: number,
		centerY: number,
		radius: number
	): boolean {
		return Math.abs(x - centerX) <= radius && Math.abs(y - centerY) <= radius;
	}

	function getTileKey(x: number, y: number): string {
		return `${x},${y}`;
	}
</script>

<div class="world" style="left: {worldX}px; top: {worldY}px;">
	<div class="terrain">
		{#each visibleTerrain as { x, y, tile } (getTileKey(x, y))}
			<Tile {x} {y} {tile} />
		{/each}
	</div>
	{#each visibleCharacters as [id, character] (id)}
		<Character {character} />
	{/each}
	{#each visibleEntities as [id, entity] (id)}
		<Entity {entity} />
	{/each}
	{#each [...$fightNumbers] as [index, fightNumber] (index)}
		<FightNumber {fightNumber} />
	{/each}
	<Player />
	<ChatMessageManager />
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

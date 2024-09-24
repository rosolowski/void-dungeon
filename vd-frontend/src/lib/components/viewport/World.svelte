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
	import { viewportEffects } from '$lib/store/viewport-effects';
	import FightNumber from './FightNumber.svelte';
	import ChatMessageManager from './ChatMessageManager.svelte';
	import SkillEffect from './SkillEffect.svelte';

	export let viewportWidth: number;
	export let viewportHeight: number;

	$: px = $player!.pos.x;
	$: py = $player!.pos.y;
	$: tileSize = $renderer.tileSize;

	$: terrain = $location!.terrain;

	$: worldX = -px * tileSize + viewportWidth / 2 - tileSize / 2;
	$: worldY = -py * tileSize + viewportHeight / 2 - tileSize / 2;

	$: canRenderTile = (x: number, y: number) => {
		if ($location?.terrain[y]?.[x] === 0) return false;

		const distance = 16;

		return x >= px - distance && x <= px + distance && y >= py - distance && y <= py + distance;
	};
</script>

<div class="world" style="left: {worldX}px; top: {worldY}px;">
	<div class="terrain">
		{#each terrain as row, y (y)}
			{#each row as tile, x (x)}
				{#if tile !== 0 && canRenderTile(x, y)}
					<Tile {x} {y} {tile} />
				{/if}
			{/each}
		{/each}
	</div>
	{#each [...$characters] as [id, character] (id)}
		{#if canRenderTile(character.pos.x, character.pos.y)}
			<Character {character} />
		{/if}
	{/each}
	{#each $entities as [id, entity] (id)}
		{#if canRenderTile(entity.pos.x, entity.pos.y)}
			<Entity {entity} />
		{/if}
	{/each}
	{#each [...$viewportEffects] as [index, effect] (index)}
		{#if effect.type === 'skill'}
			<SkillEffect {effect} />
		{:else}
			<FightNumber fightNumber={effect} />
		{/if}
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

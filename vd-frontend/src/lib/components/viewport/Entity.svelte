<script lang="ts">
	import type { Entity } from '$lib/class/Entity';
	import { entityTracker } from '$lib/store/entity-tracker';
	import { renderer } from '$lib/store/renderer';
	import { entities } from '$lib/store/entities';
	import Sprite from './Sprite.svelte';
	import EntityTooltip from '../tooltips/EntityTooltip.svelte';
	import { progressDialogue } from '$lib/store/dialogue';
	import { player } from '$lib/store/player';

	export let entity: Entity;

	$: currentEntity = $entities.get(entity.id) || entity;
	$: posX = currentEntity.pos.x * $renderer.tileSize;
	$: posY = currentEntity.pos.y * $renderer.tileSize;

	function isPlayerNextToEntity(
		playerX: number,
		playerY: number,
		entityX: number,
		entityY: number
	): boolean {
		const dx = Math.abs(playerX - entityX);
		const dy = Math.abs(playerY - entityY);
		return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
	}

	function handleClick() {
		const playerX = $player?.pos.x!;
		const playerY = $player?.pos.y!;
		const entityX = currentEntity.pos.x;
		const entityY = currentEntity.pos.y;

		if (isPlayerNextToEntity(playerX, playerY, entityX, entityY)) {
			if (entity.type === 'monster') {
				entityTracker.set(currentEntity);
			} else if (entity.type === 'npc') {
				if (entity.name === 'The Merchant') {
					progressDialogue(0);
				}
			}
			console.log('Interacting with:', currentEntity);
		} else {
			console.log('Player is not next to the entity. Cannot interact.');
		}
	}
</script>

<EntityTooltip entity={currentEntity}>
	<div
		class="entity {$entityTracker?.id === currentEntity.id ? 'tracked' : ''}"
		style:left={`${posX}px`}
		style:top={`${posY}px`}
		style:width={`${$renderer.tileSize}px`}
		style:height={`${$renderer.tileSize}px`}
		on:click={handleClick}
	>
		<Sprite spriteId={currentEntity.name} />
	</div>
</EntityTooltip>

<style lang="scss">
	.entity {
		position: absolute;
		background-color: rgba(128, 0, 0, 0);
		transition:
			top var(--primaryEasingFunction) var(--primarySpeed),
			left var(--primaryEasingFunction) var(--primarySpeed),
			width var(--primaryEasingFunction) var(--primarySpeed),
			height var(--primaryEasingFunction) var(--primarySpeed);
		cursor: pointer;

		&:hover:not(.tracked) {
			// border: 1px solid var(--tetriary);
			background-color: rgba(128, 0, 0, 0.05);
		}

		&.tracked {
			background-color: rgba(128, 0, 0, 0.15);
			border: 1px solid var(--tetriary);
		}
	}
</style>

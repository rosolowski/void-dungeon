<script lang="ts">
	import type { Entity } from '$lib/class/Entity';
	import { entityTracker } from '$lib/store/entity-tracker';
	import { renderer } from '$lib/store/renderer';
	import { entities } from '$lib/store/entities';
	import Sprite from './Sprite.svelte';
	import EntityTooltip from '../tooltips/EntityTooltip.svelte';

	export let entity: Entity;

	$: currentEntity = $entities.get(entity.id) || entity;
	$: posX = currentEntity.pos.x * $renderer.tileSize;
	$: posY = currentEntity.pos.y * $renderer.tileSize;

	function handleClick() {
		entityTracker.set(currentEntity);
		console.log(currentEntity);
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
		background-color: rgba(128, 0, 0, 0.05);
		transition:
			top var(--primaryEasingFunction) var(--primarySpeed),
			left var(--primaryEasingFunction) var(--primarySpeed),
			width var(--primaryEasingFunction) var(--primarySpeed),
			height var(--primaryEasingFunction) var(--primarySpeed);
		cursor: pointer;

		&:hover:not(.tracked) {
			border: 1px solid var(--tetriary);
		}

		&.tracked {
			background-color: rgba(128, 0, 0, 0.15);
			border: 1px solid var(--tetriary);
		}
	}
</style>

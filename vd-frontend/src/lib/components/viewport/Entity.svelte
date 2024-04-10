<script lang="ts">
	import type { Entity } from '$lib/class/Entity';
	import { renderer } from '$lib/store/renderer';
	import EntitySprite from './EntitySprite.svelte';

	export let entity: Entity;

	$: posX = entity.pos.x * $renderer.tileSize;
	$: posY = entity.pos.y * $renderer.tileSize;
</script>

<div
	class="entity"
	style:left={`${posX}px`}
	style:top={`${posY}px`}
	style:width={`${$renderer.tileSize}px`}
	style:height={`${$renderer.tileSize}px`}
>
	<EntitySprite />
</div>

<style lang="scss">
	.entity {
		position: absolute;
		background-color: rgba(128, 0, 0, 0.25);
		transition:
			top var(--primaryEasingFunction) var(--primarySpeed),
			left var(--primaryEasingFunction) var(--primarySpeed),
			width var(--primaryEasingFunction) var(--primarySpeed),
			height var(--primaryEasingFunction) var(--primarySpeed);
	}
</style>

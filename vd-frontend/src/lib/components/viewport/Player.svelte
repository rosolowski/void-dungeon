<script lang="ts">
	import { renderer } from '$lib/store/renderer';
	import { player } from '$lib/store/player';
	import Sprite from './Sprite.svelte';

	$: posX = ($player?.pos.x || 1) * $renderer.tileSize;
	$: posY = ($player?.pos.y || 1) * $renderer.tileSize;
</script>

<div
	class="player"
	style:left={`${posX}px`}
	style:top={`${posY}px`}
	style:width={`${$renderer.tileSize}px`}
	style:height={`${$renderer.tileSize}px`}
>
	<Sprite spriteId="warrior" />
</div>

<style lang="scss">
	.player {
		position: absolute;
		background-color: rgba(0, 128, 0, 0.25);
		transition:
			top var(--primaryEasingFunction) var(--primarySpeed),
			left var(--primaryEasingFunction) var(--primarySpeed),
			width var(--primaryEasingFunction) var(--primarySpeed),
			height var(--primaryEasingFunction) var(--primarySpeed);
	}
</style>

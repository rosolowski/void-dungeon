<script lang="ts">
	import { renderer } from '$lib/store/renderer';
	import { player } from '$lib/store/player';
	import Sprite from './Sprite.svelte';

	$: tileSize = $renderer.tileSize;
	$: position = $player?.pos || { x: 1, y: 1 };
	$: style = `left: ${position.x * tileSize}px; top: ${position.y * tileSize}px; width: ${tileSize}px; height: ${tileSize}px;`;
</script>

<div class="player" {style}>
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
		will-change: top, left, width, height;
	}
</style>

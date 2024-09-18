<script lang="ts">
	import { renderer } from '$lib/store/renderer';

	export let x: number;
	export let y: number;
	export let tile: number;

	$: tileX = x * $renderer.tileSize;
	$: tileY = y * $renderer.tileSize;
</script>

<div
	class="tile type-{tile}"
	style:left={`${tileX}px`}
	style:top={`${tileY}px`}
	style:width={`${$renderer.tileSize}px`}
	style:height={`${$renderer.tileSize}px`}
/>

<style lang="scss">
	.tile {
		position: absolute;
		image-rendering: pixelated;
		transition:
			top var(--primaryEasingFunction) var(--primarySpeed),
			left var(--primaryEasingFunction) var(--primarySpeed),
			width var(--primaryEasingFunction) var(--primarySpeed),
			height var(--primaryEasingFunction) var(--primarySpeed);
		will-change: width, height;

		&.type-1 {
			background-image: url('$lib/assets/tiles/t1.png');
			background-size: 100%;
		}

		&.type-2 {
			background-image: url('$lib/assets/tiles/t2.png');
			background-size: 100%;
		}

		&.type-3 {
			background-image: url('$lib/assets/tiles/t3.png');
			background-size: 100%;
		}
	}
</style>

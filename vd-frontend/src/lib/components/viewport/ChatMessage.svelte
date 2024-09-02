<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import type { Character } from '$lib/class/Character';
	import { renderer } from '$lib/store/renderer';

	export let character: Character;
	export let message: string;
	export let onRemove: () => void;

	let opacity = tweened(0, { duration: 300, easing: cubicOut });
	let offsetY = tweened(-20, { duration: 300, easing: cubicOut });

	$: posX = character.pos.x * $renderer.tileSize + $renderer.tileSize / 2;
	$: posY = character.pos.y * $renderer.tileSize;

	let timer: ReturnType<typeof setTimeout>;

	onMount(() => {
		opacity.set(1);
		offsetY.set(-10);

		timer = setTimeout(() => {
			opacity.set(0);
			offsetY.set(-20).then(() => {
				onRemove();
			});
		}, 5000);
	});

	onDestroy(() => {
		clearTimeout(timer);
	});
</script>

<div
	class="chat-message"
	style:left="{posX}px"
	style:top="{posY + $offsetY}px"
	style:opacity={$opacity}
>
	{message}
</div>

<style lang="scss">
	.chat-message {
		position: absolute;
		background-color: var(--background-transparency);
		color: var(--primary);
		padding: 4px 8px;
		border-radius: 4px;
		font-size: 14px;
		max-width: 400px;
		word-wrap: break-word;
		text-align: center;
		transform: translateX(-50%) translateY(-50%);
		z-index: var(--zi-gameplay);
		pointer-events: none;
		transition:
			top var(--primaryEasingFunction) var(--primarySpeed),
			left var(--primaryEasingFunction) var(--primarySpeed);
	}
</style>

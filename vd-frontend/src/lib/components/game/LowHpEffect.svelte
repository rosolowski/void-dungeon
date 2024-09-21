<script lang="ts">
	import { player } from '$lib/store/player';
	import { onMount } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	const opacityStore = tweened(0, {
		duration: 400,
		easing: cubicOut
	});

	let animationFrame: number;

	function updateEffect() {
		if ($player) {
			const hpPercentage = $player.stats.hp / $player.stats.maxHp;
			const targetOpacity = Math.max(0, 1 - hpPercentage * 1.25);
			opacityStore.set(targetOpacity);
		}

		animationFrame = requestAnimationFrame(updateEffect);
	}

	onMount(() => {
		updateEffect();
		return () => cancelAnimationFrame(animationFrame);
	});
</script>

<div class="low-hp-effect" style:opacity={$opacityStore} class:pulse={$opacityStore > 0.1} />

<style>
	.low-hp-effect {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: radial-gradient(circle, rgba(255, 0, 0, 0) 40%, rgba(255, 0, 0, 0.3) 100%);
		pointer-events: none;
		z-index: var(--zi-low-hp-effect);
	}

	.pulse {
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.05);
		}
	}
</style>

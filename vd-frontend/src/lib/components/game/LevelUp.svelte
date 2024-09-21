<script lang="ts">
	import { onMount } from 'svelte';
	import { levelUp } from '$lib/store/player';
	let visible = false;
	let animationTimer: ReturnType<typeof setTimeout> | null = null;

	onMount(() => {
		const unsubscribe = levelUp.subscribe((value) => {
			if (value) {
				visible = true;

				if (animationTimer) clearTimeout(animationTimer);

				animationTimer = setTimeout(() => {
					visible = false;
					levelUp.set(false);
				}, 3000);
			}
		});

		return () => {
			unsubscribe();
			if (animationTimer) clearTimeout(animationTimer);
		};
	});
</script>

{#if visible}
	<div class="level-up-container">
		<h1 class="level-up-text">LEVEL UP!</h1>
	</div>
{/if}

<style>
	.level-up-container {
		position: fixed;
		top: 20%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 1000;
	}

	.level-up-text {
		font-size: 48px;
		color: #ffd700;
		text-shadow:
			0 0 2px #fffef8,
			0 0 4px #ffd700,
			0 0 8px #ffd700;
		opacity: 1;
		animation: fadeOut 3s forwards;
	}

	@keyframes fadeOut {
		0% {
			opacity: 1;
			transform: scale(1.2);
		}
		100% {
			opacity: 0;
			transform: scale(1);
		}
	}
</style>

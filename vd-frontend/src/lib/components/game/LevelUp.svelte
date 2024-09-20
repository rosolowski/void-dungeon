<script lang="ts">
	import { onMount } from 'svelte';
	import { levelUp } from '$lib/store/player';
	import type { TransitionConfig } from 'svelte/transition';

	let visible = false;
	let animationTimer: ReturnType<typeof setTimeout> | null = null;

	function fadeOut(node: HTMLElement, { duration = 300 }: { duration?: number }): TransitionConfig {
		return {
			duration,
			css: (t: number) => `opacity: ${t}`
		};
	}

	function startAnimation() {
		visible = true;
		if (animationTimer) {
			clearTimeout(animationTimer);
		}
		animationTimer = setTimeout(() => {
			visible = false;
			levelUp.set(false);
			animationTimer = null;
		}, 6000);
	}

	onMount(() => {
		return levelUp.subscribe((value) => {
			if (value) {
				if (visible) {
					const element = document.querySelector('.level-up-text') as HTMLElement;
					if (element) {
						element.style.animation = 'none';
						element.offsetHeight;
						element.style.animation = 'unset';
					}
				}
				startAnimation();
			}
		});
	});

	onMount(() => {
		return () => {
			if (animationTimer) {
				clearTimeout(animationTimer);
			}
		};
	});
</script>

{#if visible}
	<div class="level-up-container" out:fadeOut={{ duration: 300 }}>
		<h1 class="level-up-text">LEVEL UP!</h1>
	</div>
{/if}

<style>
	.level-up-container {
		position: fixed;
		top: 25%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 1000;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.level-up-text {
		font-size: 48px;
		letter-spacing: 10px;
		color: #ffd700;
		text-shadow: 0 0 10px #ffd700;
		animation: glow 6s cubic-bezier(0.19, 1, 0.22, 1) forwards;
		position: relative;
		padding: 20px 0;
	}

	.level-up-text::before,
	.level-up-text::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		height: 1px;
		background-image: linear-gradient(to right, transparent, var(--tetriary), transparent);
	}

	.level-up-text::before {
		top: 0;
	}

	.level-up-text::after {
		bottom: 0;
	}

	@keyframes glow {
		0% {
			scale: 1.2;
			opacity: 1;
			text-shadow:
				0 0 2px #fff,
				0 0 5px #fff,
				0 0 40px #ffd700,
				0 0 50px #ffd700,
				0 0 80px #ffd700,
				0 0 120px #ffd90044,
				0 0 150px #ffd90030;
		}
		20% {
			scale: 1;
		}
		100% {
			scale: 1.1;
			opacity: 0;
			text-shadow:
				0 0 0px #fff,
				0 0 0px #fff,
				0 0 2px #ffd700,
				0 0 3px #ffd700,
				0 0 6px #ffd700,
				0 0 7px #ffd9004e,
				0 0 10px #ffd9003c;
		}
	}
</style>

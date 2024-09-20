<script lang="ts">
	import { onMount, tick, onDestroy } from 'svelte';
	import { contextMenu } from '$lib/store/context-menu';
	import { spring } from 'svelte/motion';

	export let content = '';
	export let borderClass = '';

	let isHovered = false;
	let tooltipElement: HTMLElement;
	let containerElement: HTMLElement;
	let initialRender = true;

	const position = spring(
		{ x: 0, y: 0 },
		{
			stiffness: 0.2,
			damping: 0.5
		}
	);

	$: if ($contextMenu.isOpen) {
		isHovered = false;
	}

	function calculatePosition(mouseX: number, mouseY: number) {
		if (!tooltipElement || !containerElement) return { x: mouseX, y: mouseY };

		const tooltipRect = tooltipElement.getBoundingClientRect();
		const containerRect = containerElement.getBoundingClientRect();

		let newX = mouseX + 10;
		let newY = mouseY + 10;

		if (newX + tooltipRect.width > containerRect.right) {
			newX = mouseX - tooltipRect.width - 10;
		}

		if (newY + tooltipRect.height > containerRect.bottom) {
			newY = mouseY - tooltipRect.height - 10;
		}

		newX = Math.max(containerRect.left, newX);
		newY = Math.max(containerRect.top, newY);

		return { x: newX, y: newY };
	}

	async function handleMouseMove(event: MouseEvent) {
		if ($contextMenu.isOpen) {
			isHovered = false;
			return;
		}

		if (!isHovered) {
			isHovered = true;
			initialRender = true;
			await tick();
		}

		const { x: newX, y: newY } = calculatePosition(event.clientX, event.clientY);
		position.set({ x: newX, y: newY });

		if (initialRender) {
			initialRender = false;
			await tick();
			const { x: adjustedX, y: adjustedY } = calculatePosition(event.clientX, event.clientY);
			position.set({ x: adjustedX, y: adjustedY }, { hard: true });
		}
	}

	function handleMouseLeave() {
		isHovered = false;
	}

	onMount(() => {
		containerElement = document.body;
	});
</script>

<div on:mousemove={handleMouseMove} on:mouseleave={handleMouseLeave}>
	<slot />
</div>

{#if isHovered}
	<div
		bind:this={tooltipElement}
		class="tooltip {borderClass}"
		style="--x: {$position.x}px; --y: {$position.y}px;"
	>
		{@html content}
	</div>
{/if}

<style lang="scss">
	.tooltip {
		position: fixed;
		z-index: var(--zi-tooltips);
		max-width: 300px;
		padding: 10px;
		border-radius: 2px;
		font-size: 14px;
		color: #fff;
		background-color: rgba(0, 0, 0, 0.8);
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
		pointer-events: none;
		left: var(--x);
		top: var(--y);
		border: 1px solid var(--tetriary);

		&.common {
			border: 1px solid var(--rarityCommon);
		}
		&.uncommon {
			border: 1px solid var(--rarityUncommon);
		}
		&.rare {
			border: 1px solid var(--rarityRare);
		}
		&.epic {
			border: 1px solid var(--rarityEpic);
		}
		&.legendary {
			border: 1px solid var(--rarityLegendary);
		}
		&.character {
			border: 1px solid var(--entityCharacter);
		}
		&.monster {
			border: 1px solid var(--entityMonster);
		}
		&.npc {
			border: 1px solid var(--entityNpc);
		}
		&.chest {
			border: 1px solid var(--entityChest);
		}
	}
</style>

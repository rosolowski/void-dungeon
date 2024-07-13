<script lang="ts">
	export let title = '';
	export let rarity = 'common';
	let isHovered = false;
	let x = 0;
	let y = 0;

	function handleMouseMove(event: MouseEvent) {
		isHovered = true;
		x = event.clientX + 10;
		y = event.clientY + 10;
	}

	function handleMouseLeave() {
		isHovered = false;
	}
</script>

<div on:mousemove={handleMouseMove} on:mouseleave={handleMouseLeave}>
	<slot />
</div>

{#if isHovered}
	<div class="tooltip {rarity}" style="--x: {x}px; --y: {y}px;">
		{@html title}
	</div>
{/if}

<style lang="scss">
	.tooltip {
		position: fixed;
		z-index: 1000;
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

		&.common {
			border: 1px solid #c0c0c0;
		}
		&.uncommon {
			border: 1px solid #1eff00;
		}
		&.rare {
			border: 1px solid #0070dd;
		}
		&.epic {
			border: 1px solid #a335ee;
		}
		&.legendary {
			border: 1px solid #ff8000;
		}
	}
</style>

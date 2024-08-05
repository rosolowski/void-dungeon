<script lang="ts">
	import { contextMenu } from '$lib/store/context-menu';
	export let content = '';
	export let borderClass = '';
	let isHovered = false;
	let x = 0;
	let y = 0;

	$: if ($contextMenu.isOpen) {
		isHovered = false;
	}

	function handleMouseMove(event: MouseEvent) {
		if ($contextMenu.isOpen) {
			isHovered = false;
			return;
		}
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
	<div class="tooltip {borderClass}" style="--x: {x}px; --y: {y}px;">
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

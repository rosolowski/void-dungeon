<script lang="ts">
	import { fade } from 'svelte/transition';
	import { contextMenu, type ContextMenuOption } from '$lib/store/context-menu';

	let menuElement: HTMLDivElement;

	$: ({ x, y, options } = $contextMenu);

	function handleOptionClick(callback: () => void) {
		callback();
		contextMenu.close();
	}

	function handleClickOutside(event: MouseEvent) {
		if ($contextMenu.isOpen && menuElement && !menuElement.contains(event.target as Node)) {
			contextMenu.close();
		}
	}
</script>

<svelte:window on:mousedown={handleClickOutside} />

{#if $contextMenu.isOpen}
	<div
		bind:this={menuElement}
		class="context-menu"
		style:left="{x}px"
		style:top="{y}px"
		transition:fade={{ duration: 100 }}
	>
		{#each options as { label, action }}
			<button on:click={() => handleOptionClick(action)}>
				{label}
			</button>
		{/each}
	</div>
{/if}

<style lang="scss">
	.context-menu {
		position: fixed;
		background-color: var(--background);
		border: 1px solid var(--secondary);
		z-index: var(--zi-context-menu);
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
		overflow: hidden;

		button {
			display: block;
			width: 100%;
			padding: 8px 16px;
			text-align: left;
			background: none;
			border: none;
			color: var(--text);
			cursor: pointer;

			&:hover {
				color: var(--background);
				background-color: var(--secondary);
			}

			&:not(:last-child) {
				border-bottom: 1px solid var(--secondary);
			}
		}
	}
</style>

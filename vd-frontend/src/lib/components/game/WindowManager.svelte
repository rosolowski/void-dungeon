<script lang="ts">
	import { windows } from '$lib/store/windows';
	import DraggableWindow from './DraggableWindow.svelte';
</script>

<div class="window-manager">
	{#each $windows as { id, title, component, props, zIndex } (id)}
		<DraggableWindow
			{zIndex}
			on:bringToFront={() => windows.bringToFront(id)}
			on:close={() => windows.closeWindow(id)}
		>
			<span slot="title">{title || ''}</span>
			<svelte:component
				this={component}
				slot="content"
				on:close={() => windows.closeWindow(id)}
				{...props}
			/>
		</DraggableWindow>
	{/each}
</div>

<style>
	.window-manager {
		position: absolute;
	}
</style>

<script lang="ts">
	import { Character } from '$lib/class/Character';
	import CharacterBlock from './CharacterBlock.svelte';
	import { createEventDispatcher } from 'svelte';

	export let characters: Character[];

	const dispatch = createEventDispatcher();

	function charactersUpdatedHandler() {
		dispatch('charactersUpdated');
	}
</script>

<div class="characters-list">
	{#if characters.length}
		{#each characters as character}
			<CharacterBlock {character} on:charactersUpdated={charactersUpdatedHandler} />
		{/each}
	{:else}
		<span>No characters.</span>
	{/if}
</div>

<style lang="scss">
	.characters-list {
		display: flex;
		gap: 30px;
		flex-wrap: wrap;
	}
</style>

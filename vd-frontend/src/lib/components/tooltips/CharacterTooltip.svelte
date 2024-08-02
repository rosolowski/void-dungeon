<script lang="ts">
	import type { Character } from '$lib/class/Character';
	import Tooltip from './Tooltip.svelte';

	export let character: Character;

	$: tooltipContent = `
		<div class="character-name">${character.name}</div>
		<div class="character-class">${character.charClass}</div>
		<div class="character-level">Level: ${character.level}</div>
		<div class="entity-hp">HP: ${character.stats.hp} / ${character.stats.maxHp}</div>
	`;
</script>

<Tooltip content={tooltipContent} borderClass="character">
	<slot />
</Tooltip>

<style lang="scss">
	:global(.character-name) {
		font-size: 18px;
		font-weight: bold;
		margin-bottom: 5px;
	}

	:global(.character-class) {
		font-size: 14px;
		font-style: italic;
		color: #888;
		margin-bottom: 5px;
	}

	:global(.character-level) {
		font-size: 14px;
		color: #a3a3a3;
		margin-bottom: 5px;
	}

	:global(.character-hp) {
		font-size: 14px;
		color: #ff4136;
	}
</style>

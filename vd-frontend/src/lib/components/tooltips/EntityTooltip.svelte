<script lang="ts">
	import type { Entity } from '$lib/class/Entity';
	import Tooltip from './Tooltip.svelte';

	export let entity: Entity;

	function getEntityType(entity: Entity): string {
		return entity.type.charAt(0).toUpperCase() + entity.type.slice(1);
	}

	$: tooltipContent =
		entity.type === 'npc'
			? `
		<div class="entity-name">${entity.name}</div>
		<div class="entity-type">${getEntityType(entity)}</div>
		<div class="entity-level">Level: ${entity.level}</div>
	`
			: `
		<div class="entity-name">${entity.name}</div>
		<div class="entity-type">${getEntityType(entity)}</div>
		<div class="entity-level">Level: ${entity.level}</div>
		<div class="entity-hp">HP: ${entity.stats.hp} / ${entity.stats.maxHp}</div>
	`;
</script>

<Tooltip content={tooltipContent} borderClass={entity.type}>
	<slot />
</Tooltip>

<style lang="scss">
	:global(.entity-name) {
		font-size: 18px;
		font-weight: bold;
		margin-bottom: 5px;
	}

	:global(.entity-type) {
		font-size: 14px;
		font-style: italic;
		color: #888;
		margin-bottom: 5px;
	}

	:global(.entity-level) {
		font-size: 14px;
		color: #a3a3a3;
		margin-bottom: 5px;
	}

	:global(.entity-hp) {
		font-size: 14px;
		color: #ff4136;
	}
</style>

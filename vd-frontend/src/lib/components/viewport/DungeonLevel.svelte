<script lang="ts">
	import { dialogueState } from '$lib/store/dialogue';
	import { dungeonLevel } from '$lib/store/location';
</script>

{#if $dialogueState.currentId === null}
	{#if $dungeonLevel}
		<div class="dungeon-level">Dungeon | level {$dungeonLevel}</div>
	{:else}
		<div class="dungeon-level">City</div>
	{/if}
{/if}

<style>
	.dungeon-level {
		position: absolute;
		bottom: 20px;
		left: 20px;
		font-size: 12px;
		font-weight: bold;
		color: var(--secondary);
		z-index: var(--zi-dungeon-level);
		user-select: none;
	}
</style>

<script lang="ts">
	import { dungeonLevel } from '$lib/store/location';
</script>

{#if $dungeonLevel}
	<div class="dungeon-level">Dungeon | level {$dungeonLevel}</div>
{:else}
	<div class="dungeon-level">City</div>
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
	}
</style>

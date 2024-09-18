<script lang="ts">
	import { dungeonProgress } from '$lib/store/dungeon-progress';
</script>

{#if $dungeonProgress}
	<div>
		<p>Max Level Reached: {$dungeonProgress.maxReachedLevel}</p>
		<p>Total Enemies Killed: {$dungeonProgress.totalEnemiesKilled}</p>
		<p>Total Dungeons Completed: {$dungeonProgress.totalDungeonsCompleted}</p>
		<p>Total Gold Collected: {$dungeonProgress.totalGoldCollected}</p>
		<p>Total Items Found: {$dungeonProgress.totalItemsFound}</p>
	</div>
{/if}

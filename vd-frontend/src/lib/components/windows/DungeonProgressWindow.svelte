<script lang="ts">
	import { dungeonProgress } from '$lib/store/dungeon-progress';

	type ProgressItem = {
		label: string;
		value: number;
		thresholds: [number, number, number, number, number];
	};

	$: progressItems = $dungeonProgress
		? ([
				{
					label: 'Max Level Reached',
					value: $dungeonProgress.maxReachedLevel,
					thresholds: [10, 50, 100, 200, 500]
				},
				{
					label: 'Enemies Killed',
					value: $dungeonProgress.totalEnemiesKilled,
					thresholds: [100, 1000, 10000, 100000, 1000000]
				},
				{
					label: 'Dungeons Cleared',
					value: $dungeonProgress.totalDungeonsCompleted,
					thresholds: [5, 20, 50, 100, 200]
				},
				{
					label: 'Total Gold Collected',
					value: $dungeonProgress.totalGoldCollected,
					thresholds: [10000, 100000, 1000000, 10000000, 100000000]
				},
				{
					label: 'Total Items Found',
					value: $dungeonProgress.totalItemsFound,
					thresholds: [100, 500, 2500, 10000, 50000]
				}
			] as ProgressItem[])
		: [];

	function calculateTier(
		value: number,
		thresholds: [number, number, number, number, number]
	): number {
		for (let i = 4; i >= 0; i--) {
			if (value >= thresholds[i]) return i + 1;
		}
		return 0;
	}

	function getStars(tier: number): string {
		return ['gray', 'gray', 'gray', 'gray', 'gray']
			.map((color, index) => (index < tier ? 'yellow' : color))
			.map((color) => `<span class="${color}">*</span>`)
			.join('');
	}

	function formatNumber(num: number): string {
		if (num >= 1000000) {
			return (num / 1000000).toFixed(1) + 'M';
		} else if (num >= 1000) {
			return (num / 1000).toFixed(1) + 'K';
		} else {
			return num.toString();
		}
	}
</script>

<div class="dungeon-progress-window">
	<div class="title">DUNGEON PROGRESS</div>
	{#if $dungeonProgress}
		<div class="progress-table">
			{#each progressItems as item}
				<div class="progress-row">
					<div class="progress-label">{item.label}</div>
					<div class="progress-value">{formatNumber(item.value)}</div>
					<div class="progress-stars">
						{@html getStars(calculateTier(item.value, item.thresholds))}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style lang="scss">
	.dungeon-progress-window {
		padding: 20px;
	}

	.title {
		display: flex;
		justify-content: space-around;
		align-items: center;
		user-select: none;
		padding-bottom: 15px;
		color: var(--secondary);

		&::before {
			content: '';
			flex: 1;
			height: 1px;
			margin-right: 5px;
			background-image: linear-gradient(to left, var(--tetriary), transparent);
		}

		&::after {
			content: '';
			flex: 1;
			height: 1px;
			margin-left: 5px;
			background-image: linear-gradient(to right, var(--tetriary), transparent);
		}
	}

	.progress-table {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	.progress-row {
		display: grid;
		grid-template-columns: 1fr auto auto;
		align-items: center;
		padding: 5px 0;
	}

	.progress-label {
		font-size: 14px;
		color: var(--primary);
	}

	.progress-value {
		font-size: 14px;
		color: var(--secondary);
		text-align: right;
		padding-right: 10px;
		margin-left: 60px;
	}

	.progress-stars {
		font-size: 16px;
		text-align: right;
		letter-spacing: 2px;
		width: 100px;

		:global(.gray) {
			color: var(--tetriary);
		}

		:global(.yellow) {
			color: var(--expLight);
		}
	}
</style>

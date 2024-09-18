import { writable } from 'svelte/store';
import { DungeonProgress } from '$lib/class/DungeonProgress';

function createDungeonProgressStore() {
	const { subscribe, set, update } = writable<DungeonProgress | null>(null);

	return {
		subscribe,
		set: (progress: DungeonProgress) => set(progress),
		update: (progress: Partial<DungeonProgress>) =>
			update((currentProgress) => {
				if (!currentProgress) return null;
				return new DungeonProgress(
					currentProgress.id,
					progress.maxReachedLevel ?? currentProgress.maxReachedLevel,
					progress.totalEnemiesKilled ?? currentProgress.totalEnemiesKilled,
					progress.totalDungeonsCompleted ?? currentProgress.totalDungeonsCompleted,
					progress.totalGoldCollected ?? currentProgress.totalGoldCollected,
					progress.totalItemsFound ?? currentProgress.totalItemsFound
				);
			}),
		reset: () => set(null)
	};
}

export const dungeonProgress = createDungeonProgressStore();

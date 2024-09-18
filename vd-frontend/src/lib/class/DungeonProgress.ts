export class DungeonProgress {
	constructor(
		public id: number,
		public maxReachedLevel: number,
		public totalEnemiesKilled: number,
		public totalDungeonsCompleted: number,
		public totalGoldCollected: number,
		public totalItemsFound: number
	) {}

	static fromJSON(json: any): DungeonProgress {
		return new DungeonProgress(
			json.id,
			json.maxReachedLevel,
			json.totalEnemiesKilled,
			json.totalDungeonsCompleted,
			json.totalGoldCollected,
			json.totalItemsFound
		);
	}
}

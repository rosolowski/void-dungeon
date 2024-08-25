export class DungeonRun {
  constructor(
    public currentLevel: number,
    public levelStart: number,
    public levelEnd: number,
    public timeStart: number,
    public timeEnd: number,
    public enemiesKilled: number,
  ) {}
}

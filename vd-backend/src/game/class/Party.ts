export type VoteType = 'enterDungeon' | 'nextLevel' | 'exitDungeon';

export class Party {
  constructor(
    public id: number,
    public members: number[],
    public voting: VoteType | null = null,
    public votes: number[] = [],
    public votingData: any = null,
  ) {}
}

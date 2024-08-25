export type Voting = null | 'nextLevel' | 'quit';

export class Party {
  constructor(
    public id: number,
    public members: number[],
    public voting: Voting = null,
    public votes: number[],
  ) {}
}

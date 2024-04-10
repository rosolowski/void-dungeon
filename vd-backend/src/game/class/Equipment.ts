import type { Item } from './Item';

export class Equipment {
  constructor(
    public helmet: Item | null = null,
    public weapon: Item | null = null,
    public secondary: Item | null = null,
    public armor: Item | null = null,
    public boots: Item | null = null,
    public talisman: Item | null = null,
  ) {}
}

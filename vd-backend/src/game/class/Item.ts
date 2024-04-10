import { Stats } from './Stats';

export enum ItemType {
  Weapon = 'weapon',
  Secondary = 'secondary',
  Armor = 'armor',
  Boots = 'boots',
  Amulet = 'amulet',
}

export class Item {
  constructor(
    public id: number = -1,
    public name: string = 'unkown',
    public description: string = 'An unkown item',
    public type: ItemType = ItemType.Weapon,
    public stats: Stats,
  ) {}
}

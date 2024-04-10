import { Equipment } from './Equipment';
import type { Item } from './Item';

export class Inventory {
  constructor(
    public slots: Map<number, Item>,
    public capacity: number = 60,
    public gold: number = 0,
    public shards: number = 0,
    public equipment: Equipment = new Equipment(),
  ) {}

  serialize() {
    const serializedSlots = Array.from({ length: this.capacity }, (_, index) =>
      this.slots.has(index) ? this.slots.get(index) : null,
    ).map((item) => (item ? item : null));

    return {
      slots: serializedSlots,
      capacity: this.capacity,
      gold: this.gold,
      shards: this.shards,
      equipment: this.equipment,
    };
  }
}

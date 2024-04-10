import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Inventory } from './inventory.entity';
import { Item } from './item.entity';

@Entity()
export class Slot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  index: number;

  @ManyToOne(() => Inventory, (inventory) => inventory.slots)
  inventory: Inventory;

  @OneToOne(() => Item, { nullable: true, cascade: true, eager: true })
  @JoinColumn()
  item: Item | null;
}

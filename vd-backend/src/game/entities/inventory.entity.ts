import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Character } from './character.entity';
import { Equipment } from './equipment.entity';
import { Slot } from './slot.entity';

@Entity()
export class Inventory {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => Slot, (slot) => slot.inventory, {
    cascade: true,
    eager: true,
  })
  slots: Slot[];

  @Column({ default: 60 })
  capacity: number;

  @Column({ default: 0 })
  gold: number;

  @Column({ default: 0 })
  shards: number;

  @OneToOne(() => Equipment, { cascade: true, eager: true })
  @JoinColumn()
  equipment: Equipment;

  @OneToOne(() => Character, (character) => character.inventory)
  character: Character;
}

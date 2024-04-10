import { Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Item } from './item.entity';

@Entity()
export class Equipment {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Item, { eager: true })
  @JoinColumn()
  helmet: Item;

  @OneToOne(() => Item, { eager: true })
  @JoinColumn()
  weapon: Item;

  @OneToOne(() => Item, { eager: true })
  @JoinColumn()
  secondary: Item;

  @OneToOne(() => Item, { eager: true })
  @JoinColumn()
  armor: Item;

  @OneToOne(() => Item, { eager: true })
  @JoinColumn()
  boots: Item;

  @OneToOne(() => Item, { eager: true })
  @JoinColumn()
  talisman: Item;
}

import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { ItemType } from '../class/Item';
import { Stats } from './stats.entity';

@Entity()
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({
    type: 'enum',
    enum: ItemType,
  })
  type: ItemType;

  @OneToOne(() => Stats, { cascade: true, eager: true })
  @JoinColumn()
  stats: Stats;
}

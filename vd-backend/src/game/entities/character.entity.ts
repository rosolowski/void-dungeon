import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { CharacterAvatar } from './character-avatar.entity';
import { Inventory } from './inventory.entity';
import { Stats } from './stats.entity';
import { User } from 'src/users/user.entity';
import { DungeonProgress } from './dungeon-progress.entity';

@Entity()
export class Character {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  level: number;

  @Column('json')
  pos: { x: number; y: number; instanceId: number };

  @OneToOne(() => Stats, { cascade: true })
  @JoinColumn()
  stats: Stats;

  @OneToOne(() => Stats, { cascade: true })
  @JoinColumn()
  baseStats: Stats;

  @Column()
  charClass: string;

  @Column()
  exp: number;

  @Column()
  maxExp: number;

  @OneToOne(() => CharacterAvatar, (avatar) => avatar.character, {
    cascade: true,
  })
  @JoinColumn()
  avatar: CharacterAvatar;

  @ManyToOne(() => User, (user) => user.characters, { onDelete: 'CASCADE' })
  user: User;

  @OneToOne(() => Inventory, (inventory) => inventory.character, {
    cascade: true,
  })
  @JoinColumn()
  inventory: Inventory;

  @OneToOne(
    () => DungeonProgress,
    (dungeonProgress) => dungeonProgress.character,
    {
      cascade: true,
    },
  )
  @JoinColumn()
  dungeonProgress: DungeonProgress;
}

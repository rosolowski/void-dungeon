import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Character } from './character.entity';

@Entity()
export class DungeonProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 1 })
  maxReachedLevel: number;

  @Column({ default: 0 })
  totalEnemiesKilled: number;

  @Column({ default: 0 })
  totalDungeonsCompleted: number;

  @Column({ default: 0 })
  totalGoldCollected: number;

  @Column({ default: 0 })
  totalItemsFound: number;

  @OneToOne(() => Character, (character) => character.dungeonProgress)
  character: Character;
}

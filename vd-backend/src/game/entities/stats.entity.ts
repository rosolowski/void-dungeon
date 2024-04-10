import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Stats {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 10 })
  hp: number;

  @Column({ default: 10 })
  maxHp: number;

  @Column({ default: 30 })
  mana: number;

  @Column({ default: 30 })
  maxMana: number;

  @Column({ default: 2 })
  armor: number;

  @Column({ default: 0 })
  evasion: number;

  @Column({ default: 5 })
  damage: number;

  @Column({ default: 1 })
  attackSpeed: number;

  @Column({ default: 1 })
  critMultiplier: number;

  @Column({ default: 2 })
  critChance: number;

  @Column({ default: 0 })
  poisonDamage: number;

  @Column({ default: 0 })
  fireDamage: number;

  @Column({ default: 0 })
  coldDamage: number;

  @Column({ default: 0 })
  lightDamage: number;

  @Column({ default: 0 })
  voidDamage: number;

  @Column({ default: 0 })
  poisonChance: number;

  @Column({ default: 0 })
  fireChance: number;

  @Column({ default: 0 })
  coldChance: number;

  @Column({ default: 0 })
  lightChance: number;

  @Column({ default: 0 })
  voidChance: number;

  @Column({ default: 0 })
  poisonStatus: number;

  @Column({ default: 0 })
  fireStatus: number;

  @Column({ default: 0 })
  coldStatus: number;

  @Column({ default: 0 })
  lightStatus: number;

  @Column({ default: 0 })
  voidStatus: number;

  @Column({ default: 0 })
  extraCurrencyChance: number;

  @Column({ default: 0 })
  extraDropChance: number;

  @Column({ default: 0 })
  dropRarityBoost: number;
}

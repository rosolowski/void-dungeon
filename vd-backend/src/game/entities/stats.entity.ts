import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export class DecimalColumnTransformer {
  to(data: number): number {
    return data;
  }
  from(data: string): number {
    return parseFloat(data);
  }
}

@Entity()
export class Stats {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  hp: number;

  @Column({ default: 0 })
  maxHp: number;

  @Column({ default: 0 })
  mana: number;

  @Column({ default: 0 })
  maxMana: number;

  @Column({ default: 0 })
  armor: number;

  @Column('decimal', {
    precision: 5,
    scale: 2,
    default: 0,
    transformer: new DecimalColumnTransformer(),
  })
  evasion: number;

  @Column({ default: 0 })
  damage: number;

  @Column('decimal', {
    precision: 5,
    scale: 2,
    default: 0,
    transformer: new DecimalColumnTransformer(),
  })
  attackSpeed: number;

  @Column('decimal', {
    precision: 5,
    scale: 2,
    default: 0,
    transformer: new DecimalColumnTransformer(),
  })
  critMultiplier: number;

  @Column('decimal', {
    precision: 5,
    scale: 2,
    default: 0,
    transformer: new DecimalColumnTransformer(),
  })
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

  @Column('decimal', {
    precision: 5,
    scale: 2,
    default: 0,
    transformer: new DecimalColumnTransformer(),
  })
  poisonChance: number;

  @Column('decimal', {
    precision: 5,
    scale: 2,
    default: 0,
    transformer: new DecimalColumnTransformer(),
  })
  fireChance: number;

  @Column('decimal', {
    precision: 5,
    scale: 2,
    default: 0,
    transformer: new DecimalColumnTransformer(),
  })
  coldChance: number;

  @Column('decimal', {
    precision: 5,
    scale: 2,
    default: 0,
    transformer: new DecimalColumnTransformer(),
  })
  lightChance: number;

  @Column('decimal', {
    precision: 5,
    scale: 2,
    default: 0,
    transformer: new DecimalColumnTransformer(),
  })
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

  @Column('decimal', {
    precision: 5,
    scale: 2,
    default: 0,
    transformer: new DecimalColumnTransformer(),
  })
  extraCurrencyChance: number;

  @Column('decimal', {
    precision: 5,
    scale: 2,
    default: 0,
    transformer: new DecimalColumnTransformer(),
  })
  extraDropChance: number;

  @Column('decimal', {
    precision: 5,
    scale: 2,
    default: 0,
    transformer: new DecimalColumnTransformer(),
  })
  dropRarityBoost: number;
}

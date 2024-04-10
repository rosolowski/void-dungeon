export class Stats {
  constructor(
    public hp: number = 10,
    public maxHp: number = 10,
    public mana: number = 30,
    public maxMana: number = 30,

    // defense
    public armor: number = 2,
    public evasion: number = 0,

    // attack
    public damage: number = 5,
    public attackSpeed: number = 1,
    public critMultiplier: number = 1,
    public critChance: number = 2,

    // attak - status
    public poisonDamage: number = 0,
    public fireDamage: number = 0,
    public coldDamage: number = 0,
    public lightDamage: number = 0,
    public voidDamage: number = 0,

    // attak - status chance
    public poisonChance: number = 0,
    public fireChance: number = 0,
    public coldChance: number = 0,
    public lightChance: number = 0,
    public voidChance: number = 0,

    // status effect
    public poisonStatus: number = 0,
    public fireStatus: number = 0,
    public coldStatus: number = 0,
    public lightStatus: number = 0,
    public voidStatus: number = 0,

    // other
    public extraCurrencyChance: number = 0,
    public extraDropChance: number = 0,
    public dropRarityBoost: number = 0,
  ) {}
}

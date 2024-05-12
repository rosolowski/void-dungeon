import { Entity } from './Entity';
import { Stats } from './Stats';

export class EntityGenerator {
  static createEntity(
    entityId: number,
    type: string,
    level: number,
    position: { x: number; y: number; instanceId: number },
  ): Entity {
    const baseStats = this.getBaseStats(type);
    const scaledStats = this.scaleStats(baseStats, level);

    return new Entity(
      entityId,
      'monster',
      position,
      type,
      level,
      new Stats(
        scaledStats.hp,
        scaledStats.maxHp,
        scaledStats.mana,
        scaledStats.maxMana,
        scaledStats.armor,
        scaledStats.evasion,
        scaledStats.damage,
        scaledStats.attackSpeed,
        scaledStats.critMultiplier,
        scaledStats.critChance,
        scaledStats.poisonDamage,
        scaledStats.fireDamage,
        scaledStats.coldDamage,
        scaledStats.lightDamage,
        scaledStats.voidDamage,
        scaledStats.poisonChance,
        scaledStats.fireChance,
        scaledStats.coldChance,
        scaledStats.lightChance,
        scaledStats.voidChance,
        scaledStats.poisonStatus,
        scaledStats.fireStatus,
        scaledStats.coldStatus,
        scaledStats.lightStatus,
        scaledStats.voidStatus,
        scaledStats.extraCurrencyChance,
        scaledStats.extraDropChance,
        scaledStats.dropRarityBoost,
      ),
    );
  }

  private static getBaseStats(type: string): Stats {
    switch (type) {
      case 'Snake':
        return new Stats(5, 5, 0, 0, 0, 0, 1, 1, 1.0, 2);
      case 'Goblin':
        return new Stats(10, 10, 0, 0, 2, 1, 3, 1, 1.5, 5);
      case 'Vampire':
        return new Stats(20, 20, 10, 10, 4, 2, 7, 0.9, 2.0, 10);
      default:
        return new Stats();
    }
  }

  private static scaleStats(stats: Stats, level: number): Stats {
    return new Stats(
      stats.hp * Math.pow(1.1, level - 1),
      stats.maxHp * Math.pow(1.1, level - 1),
      stats.mana,
      stats.maxMana,
      stats.armor * Math.pow(1.05, level - 1),
      stats.evasion,
      stats.damage * Math.pow(1.1, level - 1),
      stats.attackSpeed,
      stats.critMultiplier,
      stats.critChance,
      stats.poisonDamage,
      stats.fireDamage,
      stats.coldDamage,
      stats.lightDamage,
      stats.voidDamage,
      stats.poisonChance,
      stats.fireChance,
      stats.coldChance,
      stats.lightChance,
      stats.voidChance,
      stats.poisonStatus,
      stats.fireStatus,
      stats.coldStatus,
      stats.lightStatus,
      stats.voidStatus,
      stats.extraCurrencyChance,
      stats.extraDropChance,
      stats.dropRarityBoost,
    );
  }
}

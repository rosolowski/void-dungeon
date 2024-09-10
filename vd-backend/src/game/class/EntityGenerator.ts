import { Entity } from './Entity';
import { Stats } from './Stats';
import { EntityTemplate, enemyTemplates } from './enemyTemplates';

export class EntityGenerator {
  static createEntity(
    entityId: number,
    level: number,
    position: { x: number; y: number; instanceId: number },
    type: 'monster' | 'chest' = 'monster',
  ): Entity {
    if (type === 'chest') {
      return this.createChest(entityId, level, position);
    } else {
      return this.createMonster(entityId, level, position);
    }
  }

  private static createMonster(
    entityId: number,
    level: number,
    position: { x: number; y: number; instanceId: number },
  ): Entity {
    const template = this.chooseEntityTemplate(level);
    const stats = this.generateStats(template.baseStats, level);

    return new Entity(
      entityId,
      'monster',
      position,
      template.type,
      level,
      stats,
    );
  }

  private static createChest(
    entityId: number,
    level: number,
    position: { x: number; y: number; instanceId: number },
  ): Entity {
    const chestStats = new Stats(10, 10);

    return new Entity(
      entityId,
      'chest',
      position,
      'Treasure Chest',
      level,
      chestStats,
    );
  }

  private static chooseEntityTemplate(level: number): EntityTemplate {
    const availableTemplates = enemyTemplates.filter(
      (template) =>
        template.minLevel <= level &&
        (template.maxLevel >= level || template.maxLevel === Infinity),
    );
    return availableTemplates[
      Math.floor(Math.random() * availableTemplates.length)
    ];
  }

  private static generateStats(
    baseStats: Partial<Stats>,
    level: number,
  ): Stats {
    const stats = new Stats();
    const levelFactor = 1 + (level - 1) * 0.1;

    for (const [key, value] of Object.entries(baseStats)) {
      if (typeof value === 'number') {
        if (
          ['hp', 'maxHp', 'mana', 'maxMana', 'armor', 'damage'].includes(key)
        ) {
          stats[key] = Math.round(value * levelFactor);
        } else if (key === 'attackSpeed') {
          stats[key] = Number((value * (1 + (level - 1) * 0.01)).toFixed(2));
        } else {
          stats[key] = value;
        }
      }
    }

    return stats;
  }
}

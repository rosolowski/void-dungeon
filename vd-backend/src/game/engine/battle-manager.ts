import { Entity } from '../class/Entity';

export interface AttackLog {
  damageTaken: number;
  damageDealt: number;
  attackerDied: boolean;
  targetDied: boolean;
}

export function simulateAttack(
  attackerEntity: Entity,
  targetEntity: Entity,
): AttackLog {
  const targetBlocked = Math.floor(Math.random() * targetEntity.stats.armor);
  const targetDamage = attackerEntity.stats.damage - targetBlocked;

  const attackerBlocked = Math.floor(
    Math.random() * attackerEntity.stats.armor,
  );
  const attackerDamage = targetEntity.stats.damage - attackerBlocked;

  const attackerDied = attackerEntity.stats.hp - attackerDamage <= 0;
  const targetDied = targetEntity.stats.hp - targetDamage <= 0;

  return {
    damageTaken: attackerDamage,
    damageDealt: targetDamage,
    attackerDied,
    targetDied,
  };
}

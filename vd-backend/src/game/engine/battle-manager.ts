import { Entity } from '../class/Entity';
import { Stats } from '../class/Stats';

export interface AttackLog {
  characterId: number;
  entityId: number;
  characterAttacks: SingleAttackLog[];
  entityAttacks: SingleAttackLog[];
  characterDied: boolean;
  entityDied: boolean;
}

export interface SingleAttackLog {
  damageDone: number;
  effectsApplied: StatusEffects;
  criticalHit: boolean;
  dodged: boolean;
}

interface StatusEffects {
  poison: number;
  fire: number;
  cold: number;
  light: number;
  void: number;
}

interface TempCombatStats extends Stats {}

export function simulateAttack(character: Entity, entity: Entity): AttackLog {
  try {
    const characterTempStats = calculateTempCombatStats(character);
    const entityTempStats = calculateTempCombatStats(entity);

    const characterAttackCount = calculateAttackCount(
      characterTempStats.attackSpeed,
    );
    const entityAttackCount = calculateAttackCount(entityTempStats.attackSpeed);

    const characterAttacks: SingleAttackLog[] = [];
    const entityAttacks: SingleAttackLog[] = [];

    let characterDied = false;
    let entityDied = false;

    // Process ongoing effects before combat
    processOngoingEffects(character);
    processOngoingEffects(entity);

    // Check if either died from ongoing effects
    characterDied = character.stats.hp <= 0;
    entityDied = entity.stats.hp <= 0;

    // Simulate character's attacks
    for (
      let i = 0;
      i < characterAttackCount && !characterDied && !entityDied;
      i++
    ) {
      const result = simulateSingleAttack(characterTempStats, entityTempStats);
      characterAttacks.push(result);
      entity.stats.hp -= result.damageDone;
      applyStatusEffects(entity, result.effectsApplied);
      entityDied = entity.stats.hp <= 0;
    }

    // Simulate entity's counterattacks
    for (
      let i = 0;
      i < entityAttackCount && !characterDied && !entityDied;
      i++
    ) {
      const result = simulateSingleAttack(entityTempStats, characterTempStats);
      entityAttacks.push(result);
      character.stats.hp -= result.damageDone;
      applyStatusEffects(character, result.effectsApplied);
      characterDied = character.stats.hp <= 0;
    }

    return {
      characterId: character.id,
      entityId: entity.id,
      characterAttacks,
      entityAttacks,
      characterDied,
      entityDied,
    };
  } catch (error) {
    console.error('Error in simulateAttack:', error);
    throw new Error('Combat simulation failed');
  }
}

function calculateTempCombatStats(entity: Entity): TempCombatStats {
  const baseStats = entity.stats;
  const statusEffects = getCurrentStatusEffects(entity);

  const tempStats: TempCombatStats = { ...baseStats };

  if (statusEffects.fire > 0) {
    tempStats.armor = Math.max(tempStats.armor - statusEffects.fire, 0);
  }

  if (statusEffects.cold > 0) {
    tempStats.attackSpeed = Math.max(
      tempStats.attackSpeed * (1 - statusEffects.cold * 0.1),
      0.5, // Minimum 50% of original attack speed
    );
  }

  if (statusEffects.light > 0) {
    tempStats.evasion = Math.min(
      tempStats.evasion + statusEffects.light * 2,
      75, // Maximum 75% evasion
    );
  }

  if (statusEffects.void > 0) {
    const reductionFactor = 1 - statusEffects.void * 0.05; // 5% reduction per stack
    tempStats.armor = Math.round(tempStats.armor * reductionFactor);
    tempStats.damage = Math.round(tempStats.damage * reductionFactor);
    tempStats.attackSpeed = tempStats.attackSpeed * reductionFactor;
    tempStats.critChance = Math.round(tempStats.critChance * reductionFactor);
  }

  return tempStats;
}
function calculateAttackCount(attackSpeed: number): number {
  const baseAttacks = Math.floor(attackSpeed);
  const extraAttackChance = attackSpeed % 1;
  const extraAttack = Math.random() < extraAttackChance ? 1 : 0;
  return baseAttacks + extraAttack;
}

function simulateSingleAttack(
  attackerStats: TempCombatStats,
  defenderStats: TempCombatStats,
): SingleAttackLog {
  if (Math.random() < defenderStats.evasion / 100) {
    return {
      damageDone: 0,
      effectsApplied: { poison: 0, fire: 0, cold: 0, light: 0, void: 0 },
      criticalHit: false,
      dodged: true,
    };
  }

  let damage = attackerStats.damage;
  let isCritical = false;

  if (Math.random() < attackerStats.critChance / 100) {
    damage = Math.floor(damage * attackerStats.critMultiplier);
    isCritical = true;
  }

  const entityBlock = Math.floor(Math.random() * defenderStats.armor);
  const damageAfterArmor = Math.max(damage - entityBlock, 0);

  const effectsApplied = applyNewStatusEffects(attackerStats);

  return {
    damageDone: damageAfterArmor,
    effectsApplied,
    criticalHit: isCritical,
    dodged: false,
  };
}

function getCurrentStatusEffects(entity: Entity): StatusEffects {
  return {
    poison: entity.stats.poisonStatus,
    fire: entity.stats.fireStatus,
    cold: entity.stats.coldStatus,
    light: entity.stats.lightStatus,
    void: entity.stats.voidStatus,
  };
}

function applyNewStatusEffects(attackerStats: TempCombatStats): StatusEffects {
  const effects: StatusEffects = {
    poison: 0,
    fire: 0,
    cold: 0,
    light: 0,
    void: 0,
  };

  if (Math.random() < attackerStats.poisonChance / 100) {
    effects.poison = Math.max(1, Math.round(attackerStats.poisonDamage));
  }

  if (Math.random() < attackerStats.fireChance / 100) {
    effects.fire = Math.max(1, Math.round(attackerStats.fireDamage));
  }

  if (Math.random() < attackerStats.coldChance / 100) {
    effects.cold = Math.max(1, Math.round(attackerStats.coldDamage));
  }

  if (Math.random() < attackerStats.lightChance / 100) {
    effects.light = Math.max(1, Math.round(attackerStats.lightDamage));
  }

  if (Math.random() < attackerStats.voidChance / 100) {
    effects.void = Math.max(1, Math.round(attackerStats.voidDamage));
  }

  return effects;
}

export function processOngoingEffects(entity: Entity): void {
  // Reduce status effects over time
  entity.stats.poisonStatus = Math.max(entity.stats.poisonStatus - 1, 0);
  entity.stats.fireStatus = Math.max(entity.stats.fireStatus - 1, 0);
  entity.stats.coldStatus = Math.max(entity.stats.coldStatus - 1, 0);
  entity.stats.lightStatus = Math.max(entity.stats.lightStatus - 1, 0);
  entity.stats.voidStatus = Math.max(entity.stats.voidStatus - 1, 0);

  // Apply ongoing damage from poison
  if (entity.stats.poisonStatus > 0) {
    entity.stats.hp -= entity.stats.poisonStatus;
  }
}

export function applyStatusEffects(
  entity: Entity,
  effects: StatusEffects,
): void {
  entity.stats.poisonStatus = Math.max(
    entity.stats.poisonStatus,
    effects.poison,
  );
  entity.stats.fireStatus = Math.max(entity.stats.fireStatus, effects.fire);
  entity.stats.coldStatus = Math.max(entity.stats.coldStatus, effects.cold);
  entity.stats.lightStatus = Math.max(entity.stats.lightStatus, effects.light);
  entity.stats.voidStatus = Math.max(entity.stats.voidStatus, effects.void);
}

export function calculateTotalElementalDamage(stats: TempCombatStats): number {
  return (
    stats.poisonDamage +
    stats.fireDamage +
    stats.coldDamage +
    stats.lightDamage +
    stats.voidDamage
  );
}

export function calculateAverageElementalChance(
  stats: TempCombatStats,
): number {
  const totalChance =
    stats.poisonChance +
    stats.fireChance +
    stats.coldChance +
    stats.lightChance +
    stats.voidChance;
  return Math.round(totalChance / 5);
}

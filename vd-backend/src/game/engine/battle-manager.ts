import { Character } from '../class/Character';
import { Entity } from '../class/Entity';
import { Stats } from '../class/Stats';
import { SkillManager } from './skill-manager';

export interface AttackLog {
  characterFinal: Character;
  entityFinal: Entity;
  characterAttacks: SingleAttackLog[];
  entityAttacks: SingleAttackLog[];
  characterDied: boolean;
  entityDied: boolean;
}

export interface SingleAttackLog {
  heal: number;
  damageDone: number;
  effectsApplied: StatusEffects;
  criticalHit: boolean;
  dodged: boolean;
}

export interface StatusEffects {
  poison: number;
  fire: number;
  cold: number;
  light: number;
  void: number;
}

export interface TempCombatStats extends Stats {
  accuracy: number;
}

export function simulateAttack(
  character: Character,
  entity: Entity,
  skillManager: SkillManager,
): AttackLog {
  try {
    const characterTempStats = calculateTempCombatStats(character);
    const entityTempStats = calculateTempCombatStats(entity);

    skillManager.applyPassiveSkills(
      characterTempStats,
      entityTempStats,
      character,
    );

    const characterAttackCount = calculateAttackCount(
      characterTempStats.attackSpeed,
    );
    const entityAttackCount = calculateAttackCount(entityTempStats.attackSpeed);

    const characterAttacks: SingleAttackLog[] = [];
    const entityAttacks: SingleAttackLog[] = [];

    let characterDied = false;
    let entityDied = false;

    // Process ongoing effects before combat
    processOngoingEffects(characterTempStats);
    processOngoingEffects(entityTempStats);

    // Check if either died from ongoing effects
    characterDied = characterTempStats.hp <= 0;
    entityDied = entityTempStats.hp <= 0;

    // Simulate character's attacks
    for (
      let i = 0;
      i < characterAttackCount && !characterDied && !entityDied;
      i++
    ) {
      const result = simulateSingleAttack(characterTempStats, entityTempStats);
      characterAttacks.push(result);
      entityTempStats.hp -= result.damageDone;
      applyStatusEffects(entityTempStats, result.effectsApplied);
      entityDied = entityTempStats.hp <= 0;
    }

    // Simulate entity's counterattacks
    for (
      let i = 0;
      i < entityAttackCount && !characterDied && !entityDied;
      i++
    ) {
      const result = simulateSingleAttack(entityTempStats, characterTempStats);
      entityAttacks.push(result);
      characterTempStats.hp -= result.damageDone;
      applyStatusEffects(characterTempStats, result.effectsApplied);
      characterDied = characterTempStats.hp <= 0;
    }

    character.stats.hp = Math.min(characterTempStats.hp, character.stats.maxHp);
    entity.stats.hp = Math.min(entityTempStats.hp, entity.stats.maxHp);

    character.stats.coldStatus = characterTempStats.coldStatus;
    character.stats.voidStatus = characterTempStats.voidStatus;
    character.stats.lightStatus = characterTempStats.lightStatus;
    character.stats.fireStatus = characterTempStats.fireStatus;
    character.stats.poisonStatus = characterTempStats.poisonStatus;

    entity.stats.coldStatus = entityTempStats.coldStatus;
    entity.stats.voidStatus = entityTempStats.voidStatus;
    entity.stats.lightStatus = entityTempStats.lightStatus;
    entity.stats.fireStatus = entityTempStats.fireStatus;
    entity.stats.poisonStatus = entityTempStats.poisonStatus;

    characterDied = character.stats.hp <= 0;
    entityDied = entity.stats.hp <= 0;

    if (!characterDied) {
      character.stats.mana = Math.min(
        character.stats.mana + 5,
        character.stats.maxMana,
      );
    }

    return {
      characterFinal: character,
      entityFinal: entity,
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

export function calculateTempCombatStats(entity: Entity): TempCombatStats {
  const baseStats = entity.stats;
  const statusEffects = getCurrentStatusEffects(entity);

  const tempStats: TempCombatStats = {
    ...baseStats,
    accuracy: 100,
  };

  if (statusEffects.fire > 0) {
    tempStats.armor = Math.max(tempStats.armor - statusEffects.fire, 0);
  }

  if (statusEffects.cold > 0) {
    tempStats.attackSpeed = Math.max(
      tempStats.attackSpeed - statusEffects.cold * 0.1,
      0.5, // minimum 0.5 attack speed
    );
  }

  if (statusEffects.light > 0) {
    tempStats.accuracy = Math.max(
      tempStats.accuracy - statusEffects.light * 5,
      10, // minimum 10% accuracy
    );
  }

  if (statusEffects.void > 0) {
    const reductionFactor = Math.max(1 - statusEffects.void * 0.01, 0); // 1% reduction per stack
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
  // accuracy (includes light status)
  if (Math.random() * 100 > attackerStats.accuracy) {
    return {
      heal: 0,
      damageDone: 0,
      effectsApplied: { poison: 0, fire: 0, cold: 0, light: 0, void: 0 },
      criticalHit: false,
      dodged: true,
    };
  }

  // Check for evasion
  if (Math.random() < defenderStats.evasion / 100) {
    return {
      heal: 0,
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
    heal: 0,
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

export function processOngoingEffects(stats: Stats): void {
  // Apply ongoing damage from poison
  if (stats.poisonStatus > 0) {
    stats.hp -= stats.poisonStatus;
  }

  // Reduce status effects over time
  stats.poisonStatus = Math.max(stats.poisonStatus - 1, 0);
  stats.fireStatus = Math.max(stats.fireStatus - 1, 0);
  stats.coldStatus = Math.max(stats.coldStatus - 1, 0);
  stats.lightStatus = Math.max(stats.lightStatus - 1, 0);
  stats.voidStatus = Math.max(stats.voidStatus - 1, 0);
}

export function applyStatusEffects(stats: Stats, effects: StatusEffects): void {
  stats.poisonStatus += effects.poison;
  stats.fireStatus += effects.fire;
  stats.coldStatus += effects.cold;
  stats.lightStatus += effects.light;
  stats.voidStatus += effects.void;
}

import { Character } from '../class/Character';
import { Entity } from '../class/Entity';
import { TempCombatStats } from './battle-manager';
import { Skill, SkillRarity } from '../class/Skill';

export const skillsArray: Skill[] = [
  {
    id: 'fireball',
    name: 'Fireball',
    description:
      'Cast a sphere of flame, dealing 20% base damage plus fire damage. Applies 2 fire stacks.',
    manaCost: 10,
    cooldown: 3,
    minLevel: 1,
    rarity: SkillRarity.COMMON,
    targetType: 'enemy',
    effect: (source: Character, target?: Character | Entity) => {
      if (!target || !(target instanceof Entity)) {
        throw new Error('Invalid target for Fireball');
      }
      const damage = Math.floor(
        source.stats.damage * 0.2 + source.stats.fireDamage,
      );
      target.stats.hp -= damage;
      target.stats.fireStatus += 2;
      return {
        heal: 0,
        damageDone: damage,
        effectsApplied: { fire: 4, poison: 0, cold: 0, light: 0, void: 0 },
        criticalHit: false,
        dodged: false,
      };
    },
  },
  {
    id: 'lightning_strike',
    name: 'Lightning Strike',
    description: 'Call down lightning, applying 15 light stacks to the target.',
    manaCost: 15,
    cooldown: 3,
    minLevel: 2,
    rarity: SkillRarity.COMMON,
    targetType: 'enemy',
    effect: (source: Character, target?: Character | Entity) => {
      if (!target || !(target instanceof Entity)) {
        throw new Error('Invalid target for Lightning Strike');
      }
      target.stats.lightStatus = 15;
      return {
        heal: 0,
        damageDone: 0,
        effectsApplied: { fire: 0, poison: 0, cold: 0, light: 15, void: 0 },
        criticalHit: false,
        dodged: false,
      };
    },
  },
  {
    id: 'soul_drain',
    name: 'Soul Drain',
    description:
      'Siphon life force, dealing 150% void damage and healing for 50% of damage dealt. Applies 2 void stacks.',
    manaCost: 20,
    cooldown: 4,
    minLevel: 5,
    rarity: SkillRarity.UNCOMMON,
    targetType: 'enemy',
    effect: (source: Character, target?: Character | Entity) => {
      if (!target || !(target instanceof Entity)) {
        throw new Error('Invalid target for Soul Drain');
      }
      const damage = Math.floor(source.stats.voidDamage * 1.5);
      target.stats.hp -= damage;
      target.stats.voidStatus += 2;
      const healAmount = Math.floor(damage * 0.5);
      source.stats.hp = Math.min(
        source.stats.hp + healAmount,
        source.stats.maxHp,
      );
      return {
        heal: healAmount,
        damageDone: damage,
        effectsApplied: { fire: 0, poison: 0, cold: 0, light: 0, void: 2 },
        criticalHit: false,
        dodged: false,
      };
    },
  },
  {
    id: 'frostfire_bolt',
    name: 'Frostfire Bolt',
    description:
      'Launch a bolt of freezing flame, dealing 120% fire and 120% cold damage. Applies 2 fire and 2 cold stacks.',
    manaCost: 20,
    cooldown: 4,
    minLevel: 12,
    rarity: SkillRarity.UNCOMMON,
    targetType: 'enemy',
    effect: (source: Character, target?: Character | Entity) => {
      if (!target || !(target instanceof Entity)) {
        throw new Error('Invalid target for Frostfire Bolt');
      }
      const fireDamage = Math.floor(source.stats.fireDamage * 1.2);
      const coldDamage = Math.floor(source.stats.coldDamage * 1.2);
      const totalDamage = fireDamage + coldDamage;
      target.stats.hp -= totalDamage;
      target.stats.fireStatus += 2;
      target.stats.coldStatus += 2;
      return {
        heal: 0,
        damageDone: totalDamage,
        effectsApplied: { fire: 2, poison: 0, cold: 2, light: 0, void: 0 },
        criticalHit: false,
        dodged: false,
      };
    },
  },
  {
    id: 'heal',
    name: 'Small Heal',
    description: 'Restore 20 HP.',
    manaCost: 10,
    cooldown: 5,
    minLevel: 1,
    rarity: SkillRarity.COMMON,
    targetType: 'self',
    effect: (source: Character) => {
      const healAmount = 20;
      source.stats.hp = Math.min(
        source.stats.hp + healAmount,
        source.stats.maxHp,
      );
      return {
        heal: healAmount,
        damageDone: 0,
        effectsApplied: { fire: 0, poison: 0, cold: 0, light: 0, void: 0 },
        criticalHit: false,
        dodged: false,
      };
    },
  },
  {
    id: 'status_reduction',
    name: 'Status Reduction',
    description: 'Remove 1 stack of each status effect afflicting you.',
    manaCost: 15,
    cooldown: 5,
    minLevel: 1,
    rarity: SkillRarity.COMMON,
    targetType: 'self',
    effect: (source: Character) => {
      source.stats.fireStatus = Math.max(source.stats.fireStatus - 1, 0);
      source.stats.coldStatus = Math.max(source.stats.coldStatus - 1, 0);
      source.stats.voidStatus = Math.max(source.stats.voidStatus - 1, 0);
      source.stats.lightStatus = Math.max(source.stats.lightStatus - 1, 0);
      source.stats.poisonStatus = Math.max(source.stats.poisonStatus - 1, 0);

      return {
        heal: 0,
        damageDone: 0,
        effectsApplied: { fire: 0, poison: 0, cold: 0, light: 0, void: 0 },
        criticalHit: false,
        dodged: false,
      };
    },
  },
  {
    id: 'poison_curation',
    name: 'Poison Curation',
    description: 'Cleanse all poison stacks from yourself.',
    manaCost: 25,
    cooldown: 5,
    minLevel: 1,
    rarity: SkillRarity.UNCOMMON,
    targetType: 'self',
    effect: (source: Character) => {
      source.stats.poisonStatus = 0;

      return {
        heal: 0,
        damageDone: 0,
        effectsApplied: { fire: 0, poison: 0, cold: 0, light: 0, void: 0 },
        criticalHit: false,
        dodged: false,
      };
    },
  },
  {
    id: 'heal_2',
    name: 'Major Vitality Surge',
    description: 'Restore 10% of your maximum HP.',
    manaCost: 50,
    cooldown: 5,
    minLevel: 10,
    rarity: SkillRarity.RARE,
    targetType: 'self',
    effect: (source: Character) => {
      const healAmount = Math.floor(source.stats.maxHp * 0.2);
      source.stats.hp = Math.min(
        source.stats.hp + healAmount,
        source.stats.maxHp,
      );

      return {
        heal: healAmount,
        damageDone: 0,
        effectsApplied: { fire: 0, poison: 0, cold: 0, light: 0, void: 0 },
        criticalHit: false,
        dodged: false,
      };
    },
  },
  {
    id: 'heal_3',
    name: 'Total Heal',
    description: 'Restore 35% of your maximum HP.',
    manaCost: 50,
    cooldown: 5,
    minLevel: 20,
    rarity: SkillRarity.EPIC,
    targetType: 'self',
    effect: (source: Character) => {
      const healAmount = Math.floor(source.stats.maxHp * 0.35);
      source.stats.hp = Math.min(
        source.stats.hp + healAmount,
        source.stats.maxHp,
      );

      return {
        heal: healAmount,
        damageDone: 0,
        effectsApplied: { fire: 0, poison: 0, cold: 0, light: 0, void: 0 },
        criticalHit: false,
        dodged: false,
      };
    },
  },
  {
    id: 'elemental_absorption',
    name: 'Elemental Absorption',
    description:
      'Convert all status effect stacks into healing. Heal for 5 HP per stack.',
    manaCost: 40,
    cooldown: 12,
    minLevel: 20,
    rarity: SkillRarity.LEGENDARY,
    targetType: 'self',
    effect: (source: Character) => {
      const totalStatus =
        source.stats.fireStatus +
        source.stats.coldStatus +
        source.stats.lightStatus +
        source.stats.voidStatus +
        source.stats.poisonStatus;
      const healAmount = totalStatus * 5;
      source.stats.hp = Math.min(
        source.stats.hp + healAmount,
        source.stats.maxHp,
      );
      source.stats.fireStatus = 0;
      source.stats.coldStatus = 0;
      source.stats.lightStatus = 0;
      source.stats.voidStatus = 0;
      source.stats.poisonStatus = 0;
      return {
        heal: healAmount,
        damageDone: 0,
        effectsApplied: { fire: 0, poison: 0, cold: 0, light: 0, void: 0 },
        criticalHit: false,
        dodged: false,
      };
    },
  },
  {
    id: 'blood_ritual',
    name: 'Blood Ritual',
    description:
      'Sacrifice 20% of max HP to restore 10% of max mana. Can kill you.',
    manaCost: 0,
    cooldown: 8,
    minLevel: 15,
    rarity: SkillRarity.RARE,
    targetType: 'self',
    effect: (source: Character) => {
      const hpCost = Math.floor(source.stats.maxHp * 0.2);
      const manaGain = Math.floor(source.stats.maxMana * 0.1);
      source.stats.hp -= hpCost;
      source.stats.mana = Math.min(
        source.stats.mana + manaGain,
        source.stats.maxMana,
      );
      return {
        heal: -hpCost,
        damageDone: 0,
        effectsApplied: { fire: 0, poison: 0, cold: 0, light: 0, void: 0 },
        criticalHit: false,
        dodged: false,
      };
    },
  },
  {
    id: 'iron_skin',
    name: 'Iron Skin',
    description: 'Passively increase armor by 5.',
    manaCost: 0,
    cooldown: 0,
    minLevel: 5,
    targetType: 'passive',
    rarity: SkillRarity.COMMON,
    modifyStats: (source: TempCombatStats) => {
      source.armor += 5;
    },
  },
  {
    id: 'quick_reflexes',
    name: 'Quick Reflexes',
    description: 'Passively increase attack speed by 10%.',
    manaCost: 0,
    cooldown: 0,
    minLevel: 7,
    targetType: 'passive',
    rarity: SkillRarity.COMMON,
    modifyStats: (source: TempCombatStats) => {
      source.attackSpeed *= 1.1;
    },
  },
  {
    id: 'vampiric_strike',
    name: 'Vampiric Strike',
    description: 'Attacks heal you for 10% of damage dealt.',
    manaCost: 0,
    cooldown: 0,
    minLevel: 7,
    targetType: 'passive',
    rarity: SkillRarity.UNCOMMON,
    modifyStats: (source: TempCombatStats) => {
      source.hp += Math.floor(source.damage * 0.1);
    },
  },
  {
    id: 'toxic_blade',
    name: 'Toxic Blade',
    description: 'Each attack applies 2 poison stacks.',
    manaCost: 0,
    cooldown: 0,
    minLevel: 9,
    targetType: 'passive',
    rarity: SkillRarity.RARE,
    modifyStats(source, target) {
      target!.poisonStatus += 2;
    },
  },
  {
    id: 'fire_blade',
    name: 'Fire Blade',
    description: 'Each attack applies 2 fire stacks.',
    manaCost: 0,
    cooldown: 0,
    minLevel: 9,
    targetType: 'passive',
    rarity: SkillRarity.RARE,
    modifyStats(source, target) {
      target!.fireStatus += 2;
    },
  },
  {
    id: 'dark_resonance',
    name: 'Dark Resonance',
    description: 'Increase void damage by 20% of poison damage and vice versa.',
    manaCost: 0,
    cooldown: 0,
    minLevel: 25,
    targetType: 'passive',
    rarity: SkillRarity.EPIC,
    modifyStats: (source: TempCombatStats) => {
      source.voidDamage += Math.floor(source.poisonDamage * 0.2);
      source.poisonDamage += Math.floor(source.voidDamage * 0.2);
    },
  },
  {
    id: 'frost_armor',
    name: 'Frost Armor',
    description: 'Increase armor by 50% of your cold damage.',
    manaCost: 0,
    cooldown: 0,
    minLevel: 20,
    targetType: 'passive',
    rarity: SkillRarity.RARE,
    modifyStats: (source: TempCombatStats) => {
      source.armor += Math.floor(source.coldDamage * 0.5);
    },
  },
  {
    id: 'elemental_overload',
    name: 'Elemental Overload',
    description:
      'Increase all elemental damages by 20% of your highest elemental damage.',
    manaCost: 0,
    cooldown: 0,
    minLevel: 40,
    targetType: 'passive',
    rarity: SkillRarity.LEGENDARY,
    modifyStats: (source: TempCombatStats) => {
      const highestElemental = Math.max(
        source.fireDamage,
        source.coldDamage,
        source.lightDamage,
        source.voidDamage,
        source.poisonDamage,
      );
      const bonus = Math.floor(highestElemental * 0.2);
      source.fireDamage += bonus;
      source.coldDamage += bonus;
      source.lightDamage += bonus;
      source.voidDamage += bonus;
      source.poisonDamage += bonus;
    },
  },
];

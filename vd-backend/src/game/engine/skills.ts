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
    description: 'Attacks heal you for 2% of damage dealt.',
    manaCost: 0,
    cooldown: 0,
    minLevel: 7,
    targetType: 'passive',
    rarity: SkillRarity.RARE,
    modifyStats: (source: TempCombatStats) => {
      source.hp += Math.floor(source.damage * 0.02);
    },
  },
  {
    id: 'vampiric_overload',
    name: 'Vampiric Overload',
    description: 'Attacks heal you for 10% of damage dealt.',
    manaCost: 0,
    cooldown: 0,
    minLevel: 15,
    targetType: 'passive',
    rarity: SkillRarity.EPIC,
    modifyStats: (source: TempCombatStats) => {
      source.hp += Math.floor(source.damage * 0.1);
    },
  },
  {
    id: 'vampiric_mastery',
    name: 'Vampiric Mastery',
    description: 'Attacks heal you for 20% of damage dealt.',
    manaCost: 0,
    cooldown: 0,
    minLevel: 30,
    targetType: 'passive',
    rarity: SkillRarity.LEGENDARY,
    modifyStats: (source: TempCombatStats) => {
      source.hp += Math.floor(source.damage * 0.2);
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
    minLevel: 10,
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
      'Increase all elemental damages by 20% of your highest elemental damage. Increase all elemental chances by 5%.',
    manaCost: 0,
    cooldown: 0,
    minLevel: 20,
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

      source.fireChance += 5;
      source.coldChance += 5;
      source.lightChance += 5;
      source.voidChance += 5;
      source.poisonChance += 5;
    },
  },
  {
    id: 'elemental_storm',
    name: 'Elemental Storm',
    description:
      'Deal damage equal to your highest elemental damage. Apply 3 stacks of each elemental effect.',
    manaCost: 65,
    cooldown: 10,
    minLevel: 15,
    rarity: SkillRarity.RARE,
    targetType: 'enemy',
    effect: (source: Character, target?: Character | Entity) => {
      if (!target || !(target instanceof Entity)) {
        throw new Error('Invalid target for Elemental Storm');
      }
      const highestElementalDamage = Math.max(
        source.stats.fireDamage,
        source.stats.coldDamage,
        source.stats.lightDamage,
        source.stats.voidDamage,
        source.stats.poisonDamage,
      );
      const damage = highestElementalDamage;
      target.stats.hp -= damage;
      target.stats.fireStatus += 3;
      target.stats.coldStatus += 3;
      target.stats.lightStatus += 3;
      target.stats.voidStatus += 3;
      target.stats.poisonStatus += 3;
      return {
        heal: 0,
        damageDone: damage,
        effectsApplied: { fire: 3, poison: 3, cold: 3, light: 3, void: 3 },
        criticalHit: false,
        dodged: false,
      };
    },
  },
  {
    id: 'elemental_maelstrom',
    name: 'Elemental Maelstrom',
    description:
      'Deal damage equal to 3x your highest elemental damage. Apply 5 stacks of each elemental effect.',
    manaCost: 125,
    cooldown: 10,
    minLevel: 25,
    rarity: SkillRarity.LEGENDARY,
    targetType: 'enemy',
    effect: (source: Character, target?: Character | Entity) => {
      if (!target || !(target instanceof Entity)) {
        throw new Error('Invalid target for Elemental Maelstrom');
      }
      const highestElementalDamage = Math.max(
        source.stats.fireDamage,
        source.stats.coldDamage,
        source.stats.lightDamage,
        source.stats.voidDamage,
        source.stats.poisonDamage,
      );
      const damage = highestElementalDamage * 5;
      target.stats.hp -= damage;
      target.stats.fireStatus += 5;
      target.stats.coldStatus += 5;
      target.stats.lightStatus += 5;
      target.stats.voidStatus += 5;
      target.stats.poisonStatus += 5;
      return {
        heal: 0,
        damageDone: damage,
        effectsApplied: { fire: 5, poison: 5, cold: 5, light: 5, void: 5 },
        criticalHit: false,
        dodged: false,
      };
    },
  },
  {
    id: 'mana_overload',
    name: 'Mana Overload',
    description:
      'Consume all current mana to deal 5x that amount as damage, distributed equally among all elemental types.',
    manaCost: 0,
    cooldown: 8,
    minLevel: 20,
    rarity: SkillRarity.LEGENDARY,
    targetType: 'enemy',
    effect: (source: Character, target?: Character | Entity) => {
      if (!target || !(target instanceof Entity)) {
        throw new Error('Invalid target for Mana Overload');
      }
      const totalDamage = source.stats.mana * 5;
      const damagePerType = Math.floor(totalDamage / 5);
      target.stats.hp -= totalDamage;
      target.stats.fireStatus += damagePerType;
      target.stats.coldStatus += damagePerType;
      target.stats.lightStatus += damagePerType;
      target.stats.voidStatus += damagePerType;
      target.stats.poisonStatus += damagePerType;
      source.stats.mana = 0;
      return {
        heal: 0,
        damageDone: totalDamage,
        effectsApplied: {
          fire: damagePerType,
          poison: damagePerType,
          cold: damagePerType,
          light: damagePerType,
          void: damagePerType,
        },
        criticalHit: false,
        dodged: false,
      };
    },
  },
  {
    id: 'void_embrace',
    name: 'Void Embrace',
    description:
      'Passively increase your void damage by 1% for every 10 points of missing HP.',
    manaCost: 0,
    cooldown: 0,
    minLevel: 25,
    targetType: 'passive',
    rarity: SkillRarity.EPIC,
    modifyStats: (source: TempCombatStats) => {
      const missingHp = source.maxHp - source.hp;
      const damageIncrease = Math.floor(missingHp / 10) / 100;
      source.voidDamage = Math.floor(source.voidDamage * (1 + damageIncrease));
    },
  },
  {
    id: 'desperation_strike',
    name: 'Desperation Strike',
    description:
      'Deal damage equal to 200% of your missing HP. Costs 10% of your current HP to use - minimum 40 HP. Can kill you.',
    manaCost: 20,
    cooldown: 6,
    minLevel: 25,
    rarity: SkillRarity.EPIC,
    targetType: 'enemy',
    effect: (source: Character, target?: Character | Entity) => {
      if (!target || !(target instanceof Entity)) {
        throw new Error('Invalid target for Desperation Strike');
      }
      const missingHp = source.stats.maxHp - source.stats.hp;
      const damage = missingHp * 2;
      const hpCost = Math.max(Math.floor(source.stats.hp * 0.1), 40);
      source.stats.hp -= hpCost;
      target.stats.hp -= damage;
      return {
        heal: -hpCost,
        damageDone: damage,
        effectsApplied: { fire: 0, poison: 0, cold: 0, light: 0, void: 0 },
        criticalHit: true,
        dodged: false,
      };
    },
  },
  {
    id: 'elemental_cascade',
    name: 'Elemental Cascade',
    description:
      'Convert all elemental stacks on the target into the highest stack type, then deal 30 damage per stack.',
    manaCost: 50,
    cooldown: 8,
    minLevel: 25,
    rarity: SkillRarity.EPIC,
    targetType: 'enemy',
    effect: (source: Character, target?: Character | Entity) => {
      if (!target || !(target instanceof Entity)) {
        throw new Error('Invalid target for Elemental Cascade');
      }
      const stacks = {
        fire: target.stats.fireStatus,
        cold: target.stats.coldStatus,
        light: target.stats.lightStatus,
        void: target.stats.voidStatus,
        poison: target.stats.poisonStatus,
      };
      const highestStackType = Object.entries(stacks).reduce((a, b) =>
        a[1] > b[1] ? a : b,
      )[0];
      const totalStacks = Object.values(stacks).reduce((a, b) => a + b, 0);
      const damage = totalStacks * 30;
      target.stats.hp -= damage;
      target.stats.fireStatus = 0;
      target.stats.coldStatus = 0;
      target.stats.lightStatus = 0;
      target.stats.voidStatus = 0;
      target.stats.poisonStatus = 0;
      target.stats[`${highestStackType}Status` as keyof typeof target.stats] =
        totalStacks as number;
      return {
        heal: 0,
        damageDone: damage,
        effectsApplied: {
          fire: highestStackType === 'fire' ? totalStacks : 0,
          cold: highestStackType === 'cold' ? totalStacks : 0,
          light: highestStackType === 'light' ? totalStacks : 0,
          void: highestStackType === 'void' ? totalStacks : 0,
          poison: highestStackType === 'poison' ? totalStacks : 0,
        },
        criticalHit: false,
        dodged: false,
      };
    },
  },
  {
    id: 'berserk_strike',
    name: 'Berserk Strike',
    description:
      'Deal 400% of your base damage to the target, but also take 5% of the damage dealt as self-damage.',
    manaCost: 25,
    cooldown: 5,
    minLevel: 20,
    rarity: SkillRarity.EPIC,
    targetType: 'enemy',
    effect: (source: Character, target?: Character | Entity) => {
      if (!target || !(target instanceof Entity)) {
        throw new Error('Invalid target for Berserk Strike');
      }
      const damage = Math.floor(source.stats.damage * 4);
      const selfDamage = Math.floor(damage * 0.05);
      target.stats.hp -= damage;
      source.stats.hp -= selfDamage;
      return {
        heal: -selfDamage,
        damageDone: damage,
        effectsApplied: { fire: 0, poison: 0, cold: 0, light: 0, void: 0 },
        criticalHit: true,
        dodged: false,
      };
    },
  },
  {
    id: 'frenzied_strikes',
    name: 'Frenzied Strikes',
    description:
      'Perform 3 quick attacks, each dealing 60% of your base damage. Each strike has a cumulative 33% chance to inflict 3 random elemental stack.',
    manaCost: 30,
    cooldown: 6,
    minLevel: 22,
    rarity: SkillRarity.RARE,
    targetType: 'enemy',
    effect: (source: Character, target?: Character | Entity) => {
      if (!target || !(target instanceof Entity)) {
        throw new Error('Invalid target for Frenzied Strikes');
      }
      let totalDamage = 0;
      const effectsApplied = { fire: 0, poison: 0, cold: 0, light: 0, void: 0 };
      for (let i = 0; i < 3; i++) {
        const damage = Math.floor(source.stats.damage * 0.6);
        totalDamage += damage;
        if (Math.random() < (i + 1) * 0.33) {
          const effect = ['fire', 'poison', 'cold', 'light', 'void'][
            Math.floor(Math.random() * 5)
          ] as keyof typeof effectsApplied;
          effectsApplied[effect] += 3;
          target.stats[`${effect}Status` as keyof typeof target.stats] +=
            3 as number;
        }
      }
      target.stats.hp -= totalDamage;
      return {
        heal: 0,
        damageDone: totalDamage,
        effectsApplied,
        criticalHit: false,
        dodged: false,
      };
    },
  },
  {
    id: 'rage_incarnate',
    name: 'Rage Incarnate',
    description:
      'Passively increase your damage by 1% for every 2% of missing HP, but decrease your armor by the same percentage.',
    manaCost: 0,
    cooldown: 0,
    minLevel: 35,
    targetType: 'passive',
    rarity: SkillRarity.LEGENDARY,
    modifyStats: (source: TempCombatStats) => {
      const missingHpPercentage = (source.maxHp - source.hp) / source.maxHp;
      const damageIncrease = missingHpPercentage * 0.5;
      source.damage = Math.floor(source.damage * (1 + damageIncrease));
      source.armor = Math.max(
        0,
        Math.floor(source.armor * (1 - damageIncrease)),
      );
    },
  },
  {
    id: 'frenzied_tempo',
    name: 'Frenzied Tempo',
    description:
      'Passively increase your attack speed by up to 100% based on your missing HP. At 1 HP, your attack speed is doubled.',
    manaCost: 0,
    cooldown: 0,
    minLevel: 30,
    targetType: 'passive',
    rarity: SkillRarity.LEGENDARY,
    modifyStats: (source: TempCombatStats) => {
      const missingHpPercentage = (source.maxHp - source.hp) / source.maxHp;
      const attackSpeedIncrease = 1 + missingHpPercentage;
      source.attackSpeed *= attackSpeedIncrease;
    },
  },
  {
    id: 'shadow_step',
    name: 'Shadow Step',
    description:
      'Instantly restore 30% of max HP and gain 20 mana. Apply 5 void stacks to yourself.',
    manaCost: 0,
    cooldown: 10,
    minLevel: 25,
    rarity: SkillRarity.EPIC,
    targetType: 'self',
    effect: (source: Character) => {
      const healing = Math.floor(source.stats.maxHp * 0.3);
      source.stats.hp = Math.min(source.stats.hp + healing, source.stats.maxHp);
      source.stats.mana = Math.min(
        source.stats.mana + 20,
        source.stats.maxMana,
      );
      source.stats.voidStatus += 5;
      return {
        heal: healing,
        damageDone: 0,
        effectsApplied: { fire: 0, poison: 0, cold: 0, light: 0, void: 5 },
        criticalHit: false,
        dodged: false,
      };
    },
  },
];

import { SingleAttackLog, TempCombatStats } from '../engine/battle-manager';
import { Character } from './Character';
import { Entity } from './Entity';

export enum SkillRarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  manaCost: number;
  cooldown: number;
  minLevel: number;
  rarity: SkillRarity;
  targetType: 'self' | 'enemy' | 'ally' | 'none' | 'passive';
  effect?: (
    source: Character,
    target?: Character | Entity,
  ) => SingleAttackLog | void;
  modifyStats?: (source: TempCombatStats, target?: TempCombatStats) => void;
}

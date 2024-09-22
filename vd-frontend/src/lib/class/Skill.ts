import type { SingleAttackLog } from '$lib/util/types';
import type { Character } from './Character';
import type { Entity } from './Entity';
import type { Stats } from './Stats';

export interface TempCombatStats extends Stats {}

export enum SkillRarity {
	COMMON = 'COMMON',
	UNCOMMON = 'UNCOMMON',
	RARE = 'RARE',
	EPIC = 'EPIC',
	LEGENDARY = 'LEGENDARY'
}

export interface Skill {
	[x: string]: any;
	id: string;
	name: string;
	description: string;
	manaCost: number;
	cooldown: number;
	minLevel: number;
	rarity: SkillRarity;
	targetType: 'self' | 'enemy' | 'ally' | 'none' | 'passive';
	effect?: (source: Character, target?: Character | Entity) => SingleAttackLog | void;
	modifyStats?: (source: TempCombatStats, target?: TempCombatStats) => void;
}

import type { AttackLog, SingleAttackLog, StatusEffects } from '$lib/util/types';
import type { Character } from '$lib/class/Character';
import { get, writable } from 'svelte/store';
import { player } from './player';
import { characters } from './characters';
import { entities } from './entities';
import type { Entity } from '$lib/class/Entity';

type FightNumberType =
	| 'DAMAGE'
	| 'HEAL'
	| 'POISON'
	| 'FIRE'
	| 'COLD'
	| 'LIGHT'
	| 'VOID'
	| 'DODGE'
	| 'CRITICAL';

export interface FightNumber {
	x: number;
	y: number;
	value: number;
	type: FightNumberType;
}

let fightNumbersCounter = 0;

export const fightNumbers = writable<Map<number, FightNumber>>(new Map());

export function attackLogToFightNumbers(attackLog: AttackLog) {
	const characterTarget: Character | undefined =
		get(player)?.id === attackLog.characterId
			? (get(player) as Character)
			: get(characters).get(attackLog.characterId);

	const entityTarget: Entity | undefined = get(entities).get(attackLog.entityId);

	// Process character's attacks
	attackLog.characterAttacks.forEach((attack) => {
		if (entityTarget) {
			processSingleAttack(attack, entityTarget);
		}
	});

	// Process entity's attacks
	attackLog.entityAttacks.forEach((attack) => {
		if (characterTarget) {
			processSingleAttack(attack, characterTarget);
		}
	});
}

function processSingleAttack(attack: SingleAttackLog, target: Character | Entity) {
	if (attack.dodged) {
		addFightNumber({
			type: 'DODGE',
			value: 0,
			x: target.pos.x,
			y: target.pos.y
		});
	} else {
		// Display damage
		addFightNumber({
			type: attack.criticalHit ? 'CRITICAL' : 'DAMAGE',
			value: -attack.damageDone,
			x: target.pos.x,
			y: target.pos.y
		});

		// Display status effects
		Object.entries(attack.effectsApplied).forEach(([effectType, value]) => {
			if (value > 0) {
				addFightNumber({
					type: effectType.toUpperCase() as FightNumberType,
					value: -value,
					x: target.pos.x,
					y: target.pos.y
				});
			}
		});
	}
}

function addFightNumber(fightNumber: FightNumber) {
	const fnId = fightNumbersCounter++;

	fightNumbers.update((prev) => {
		if (!prev) return prev;
		const newMap = new Map(prev);
		newMap.set(fnId, fightNumber);
		return newMap;
	});

	setTimeout(() => {
		fightNumbers.update((prev) => {
			if (!prev) return prev;
			const newMap = new Map(prev);
			newMap.delete(fnId);
			return newMap;
		});
	}, 1000);
}

export function showDamageEffect(
	damage: number,
	targetId: number,
	targetType: 'character' | 'entity',
	isCritical: boolean
) {
	const target = getTarget(targetId, targetType);
	if (target) {
		addFightNumber({
			type: isCritical ? 'CRITICAL' : 'DAMAGE',
			value: -damage,
			x: target.pos.x,
			y: target.pos.y
		});
	}
}

export function showDodgeEffect(targetId: number, targetType: 'character' | 'entity') {
	const target = getTarget(targetId, targetType);
	if (target) {
		addFightNumber({
			type: 'DODGE',
			value: 0,
			x: target.pos.x,
			y: target.pos.y
		});
	}
}

export function showStatusEffects(
	effects: StatusEffects,
	targetId: number,
	targetType: 'character' | 'entity'
) {
	const target = getTarget(targetId, targetType);
	if (target) {
		Object.entries(effects).forEach(([effectType, value]) => {
			if (value > 0) {
				addFightNumber({
					type: effectType.toUpperCase() as FightNumberType,
					value: -value,
					x: target.pos.x,
					y: target.pos.y
				});
			}
		});
	}
}

function getTarget(
	targetId: number,
	targetType: 'character' | 'entity'
): Character | Entity | null | undefined {
	if (targetType === 'character') {
		return get(player)!.id === targetId ? get(player) : get(characters).get(targetId);
	} else {
		return get(entities).get(targetId);
	}
}

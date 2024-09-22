import { Character } from '../class/Character';
import { Entity } from '../class/Entity';
import { GameInstance } from '../class/GameInstance';
import { Skill } from '../class/Skill';
import { AttackLog, TempCombatStats } from './battle-manager';
import { skillsArray } from './skills';

export class SkillManager {
  private skills: Map<string, Skill>;

  constructor() {
    this.skills = new Map(skillsArray.map((skill) => [skill.id, skill]));
  }

  addSkill(skill: Skill) {
    this.skills.set(skill.id, skill);
  }

  getSkill(skillId: string): Skill | undefined {
    return this.skills.get(skillId);
  }

  useSkill(
    source: Character,
    skillId: string,
    target: Character | Entity | null,
  ): AttackLog | null {
    const skill = this.getSkill(skillId);
    if (!skill || !source.skillIds.includes(skillId)) {
      return null;
    }

    if (source.stats.mana < skill.manaCost) {
      return null;
    }

    if (
      skill.targetType !== 'self' &&
      skill.targetType !== 'passive' &&
      skill.targetType !== 'none' &&
      !target
    ) {
      return null;
    }

    source.stats.mana -= skill.manaCost;
    const result = skill.effect(source, target);

    return {
      characterFinal: source,
      entityFinal: target instanceof Entity ? target : null,
      characterAttacks: result ? [result] : [],
      entityAttacks: [],
      characterDied: source.stats.hp <= 0,
      entityDied: target instanceof Entity ? target.stats.hp <= 0 : false,
    };
  }

  getAvailableSkills(level: number): Skill[] {
    return Array.from(this.skills.values()).filter(
      (skill) => skill.minLevel <= level,
    );
  }

  distributeSkillOnNewFloor(character: Character): Skill | null {
    if (character.skillIds.length >= 5) return null;

    const availableSkills = this.getAvailableSkills(character.level).filter(
      (skill) => !character.skillIds.includes(skill.id),
    );

    if (availableSkills.length === 0) return null;

    const randomSkill =
      availableSkills[Math.floor(Math.random() * availableSkills.length)];
    character.skillIds.push(randomSkill.id);
    return randomSkill;
  }

  applyPassiveSkills(
    source: TempCombatStats,
    target: TempCombatStats,
    character: Character,
  ): void {
    character.skillIds.forEach((skillId) => {
      const skill = this.getSkill(skillId);
      if (skill && skill.targetType === 'passive') {
        skill.modifyStats(source, target);
      }
    });
  }

  getTargetForSkill(
    skill: Skill,
    source: Character,
    targetId: number | undefined,
    instance: GameInstance,
  ): Character | Entity | null {
    switch (skill.targetType) {
      case 'self':
        return source;
      case 'enemy':
        return instance.entities.get(targetId!) || null;
      case 'ally':
        return instance.characters.get(targetId!) || null;
      case 'passive':
      case 'none':
        return null;
      default:
        throw new Error(`Unknown target type: ${skill.targetType}`);
    }
  }
}

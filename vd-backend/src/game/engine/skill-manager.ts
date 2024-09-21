import { Character } from '../class/Character';
import { Entity } from '../class/Entity';

export class SkillManager {
  applyPassiveSkills(entity: Character | Entity): void {
    if (entity instanceof Character) {
    }
  }

  applyActiveSkills(character: Character): {
    additionalDamage: number;
    usedSkills: string[];
  } {
    console.log('appplying skills for character', character);
    let additionalDamage = 0;
    const usedSkills: string[] = [];

    additionalDamage = 0;

    return { additionalDamage, usedSkills };
  }
}

import { CharacterAvatar } from './CharacterAvatar';
import { Entity } from './Entity';
import { Stats } from './Stats';

export const CharacterClasses = [
  'Blood Knight',
  'Berserk',
  'Toxin Rogue',
  'Shadow Monk',
  'Battle Mage',
] as const;

export type CharacterClass = (typeof CharacterClasses)[number];

export const isValidCharacterClass = (
  charClass: string,
): charClass is CharacterClass => {
  return CharacterClasses.includes(charClass as CharacterClass);
};

export class Character extends Entity {
  public skillIds: string[] = [];
  private readonly MAX_SKILLS = 5;

  constructor(
    id: number,
    pos: { x: number; y: number; instanceId: number },
    name: string,
    level: number,
    stats: Stats,
    public charClass: CharacterClass,
    public exp: number,
    public maxExp: number,
    public avatar: CharacterAvatar,
    skillIds: string[] = [],
  ) {
    super(id, 'character', pos, name, level, stats);
    this.skillIds = skillIds.slice(0, this.MAX_SKILLS);
  }

  setPos(x: number, y: number) {
    this.pos.x = x;
    this.pos.y = y;
  }

  getInstance(): number {
    return this.pos.instanceId;
  }

  isValidStep(x: number, y: number): boolean {
    const distanceX = Math.abs(x - this.pos.x);
    const distanceY = Math.abs(y - this.pos.y);
    return (
      (distanceX === 1 && distanceY === 0) ||
      (distanceX === 0 && distanceY === 1)
    );
  }

  addSkill(skillId: string): boolean {
    if (
      this.skillIds.length < this.MAX_SKILLS &&
      !this.skillIds.includes(skillId)
    ) {
      this.skillIds.push(skillId);
      return true;
    }
    return false;
  }

  removeSkill(skillId: string) {
    this.skillIds = this.skillIds.filter((id) => id !== skillId);
  }

  hasSkill(skillId: string): boolean {
    return this.skillIds.includes(skillId);
  }

  clearSkills() {
    this.skillIds = [];
  }

  get availableSkillSlots(): number {
    return this.MAX_SKILLS - this.skillIds.length;
  }
}

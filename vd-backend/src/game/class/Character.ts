import { CharacterAvatar } from './CharacterAvatar';
import { Entity } from './Entity';
import { Stats } from './Stats';

export class Character extends Entity {
  constructor(
    id: number,
    pos: { x: number; y: number; instanceId: number },
    name: string,
    level: number,
    stats: Stats,
    public charClass: string,
    public exp: number,
    public maxExp: number,
    public avatar: CharacterAvatar,
  ) {
    super(id, 'character', pos, name, level, stats);
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
}

import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Character } from './character.entity';

@Entity()
export class CharacterAvatar {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 1 })
  beard: number;

  @Column({ default: 1 })
  hair: number;

  @Column({ default: 1 })
  eyes: number;

  @Column({ default: 1 })
  nose: number;

  @Column({ default: 1 })
  mouth: number;

  @Column({ default: 1 })
  head: number;

  @OneToOne(() => Character, (character) => character.avatar)
  character: Character;
}

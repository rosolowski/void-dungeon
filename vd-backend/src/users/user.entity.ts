import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Character } from 'src/game/entities/character.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @OneToMany(() => Character, (character) => character.user, {
    cascade: true,
    eager: true,
    onDelete: 'CASCADE',
  })
  characters: Character[];
}

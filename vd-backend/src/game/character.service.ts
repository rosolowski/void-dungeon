import { Injectable } from '@nestjs/common';
import { Item as ItemEntity } from './entities/item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Character } from './entities/character.entity';
import { Character as CharacterClass } from './class/Character';
import { Repository } from 'typeorm';
import { Stats } from './entities/stats.entity';

@Injectable()
export class CharacterService {
  constructor(
    @InjectRepository(Character)
    private charactersRepository: Repository<Character>,
    @InjectRepository(Stats)
    private statsRepository: Repository<Stats>,
  ) {}

  async getCharacter(characterId: number): Promise<Character> {
    return await this.charactersRepository.findOne({
      where: { id: characterId },
      relations: ['stats'],
    });
  }

  async syncStatsToDatabase(character: CharacterClass) {
    const characterEntity = await this.charactersRepository.findOne({
      where: { id: character.id },
      relations: ['stats'],
    });
    const characterStats = characterEntity.stats;
    const newStats = character.stats;

    for (const stat in newStats) {
      if (stat == 'id') continue;

      if (stat in characterStats) {
        characterStats[stat] = newStats[stat];
      } else {
        console.warn(`Stat ${stat} not found in character stats`);
      }
    }

    this.charactersRepository.save(characterEntity);
  }

  async updateCharacterStats(
    character: CharacterClass,
    item: ItemEntity,
    equip: boolean,
  ) {
    const operation = equip ? 1 : -1;
    const characterEntity = await this.charactersRepository.findOne({
      where: { id: character.id },
      relations: ['stats'],
    });

    if (!characterEntity) {
      console.error('Character not found.');
      return;
    }

    const statsToUpdate = character.stats;

    Object.keys(item.stats).forEach((statKey) => {
      if (statKey === 'id' || statKey === 'hp' || statKey === 'mana') return;

      if (statKey in characterEntity.stats) {
        statsToUpdate[statKey] =
          characterEntity.stats[statKey] + item.stats[statKey] * operation;
      } else {
        console.warn(`Stat ${statKey} not found in character stats`);
      }
    });

    characterEntity.stats = { ...characterEntity.stats, ...statsToUpdate };

    if (characterEntity.stats.hp > characterEntity.stats.maxHp) {
      characterEntity.stats.hp = characterEntity.stats.maxHp;
    }

    await this.charactersRepository.save(characterEntity);
  }

  updateStatsOnEquip(character: CharacterClass, item: ItemEntity) {
    return this.updateCharacterStats(character, item, true);
  }

  updateStatsOnUnequip(character: CharacterClass, item: ItemEntity) {
    return this.updateCharacterStats(character, item, false);
  }
}

import { Injectable } from '@nestjs/common';
import { Item as ItemEntity } from './entities/item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Character } from './entities/character.entity';
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

  async syncStatsToDatabase(characterId: number, character: Character) {
    const characterEntity = await this.charactersRepository.findOne({
      where: { id: characterId },
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

  async updateStatsOnEquip(characterId: number, item: ItemEntity) {
    const character = await this.charactersRepository.findOne({
      where: { id: characterId },
      relations: ['stats'],
    });
    const characterStats = character.stats;
    const itemStats = item.stats;

    for (const stat in itemStats) {
      if (stat == 'id') continue;

      if (stat in characterStats) {
        characterStats[stat] += itemStats[stat];
      } else {
        console.warn(`Stat ${stat} not found in character stats`);
      }
    }

    this.charactersRepository.save(character);
  }

  async updateStatsOnUnequip(characterId: number, item: ItemEntity) {
    const character = await this.charactersRepository.findOne({
      where: { id: characterId },
      relations: ['stats'],
    });
    const characterStats = character.stats;
    const itemStats = item.stats;

    for (const stat in itemStats) {
      if (stat == 'id') continue;

      if (stat in characterStats) {
        characterStats[stat] -= itemStats[stat];
      } else {
        console.warn(`Stat ${stat} not found in character stats`);
      }
    }

    this.charactersRepository.save(character);
  }
}

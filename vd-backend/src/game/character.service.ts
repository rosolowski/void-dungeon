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

    // Use the stats from the CharacterClass instance
    const statsToUpdate = { ...character.stats };
    const currentHp = statsToUpdate.hp;
    const currentMana = statsToUpdate.mana;

    const integerStats = ['hp', 'maxHp', 'mana', 'maxMana'];

    Object.keys(item.stats).forEach((statKey) => {
      if (statKey === 'id') return;

      if (statKey in statsToUpdate) {
        const currentValue = parseFloat(statsToUpdate[statKey]);
        const itemValue = parseFloat(item.stats[statKey]);
        const newValue = currentValue + itemValue * operation;

        if (integerStats.includes(statKey)) {
          statsToUpdate[statKey] = Math.round(newValue);
        } else {
          statsToUpdate[statKey] = parseFloat(newValue.toFixed(2));
        }
      } else {
        console.warn(`Stat ${statKey} not found in character stats`);
      }
    });

    // Keep the current HP and mana, but ensure they don't exceed new maximums
    statsToUpdate.hp = Math.min(currentHp, statsToUpdate.maxHp);
    statsToUpdate.mana = Math.min(currentMana, statsToUpdate.maxMana);

    // Ensure no stat goes below 0
    Object.keys(statsToUpdate).forEach((key) => {
      if (typeof statsToUpdate[key] === 'number') {
        statsToUpdate[key] = Math.max(statsToUpdate[key], 0);
      }
    });

    // Update the CharacterClass instance
    character.stats = statsToUpdate;

    // Sync the updated stats to the database
    await this.syncStatsToDatabase(character);
  }

  updateStatsOnEquip(character: CharacterClass, item: ItemEntity) {
    return this.updateCharacterStats(character, item, true);
  }

  updateStatsOnUnequip(character: CharacterClass, item: ItemEntity) {
    return this.updateCharacterStats(character, item, false);
  }
}

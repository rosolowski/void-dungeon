import { Injectable } from '@nestjs/common';
import { Item as ItemEntity } from './entities/item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Character } from './entities/character.entity';
import { Character as CharacterClass } from './class/Character';
import { CharacterClass as CharacterClassType } from './class/Character';
import { Repository } from 'typeorm';
import { Stats } from './entities/stats.entity';
import { Inventory } from './entities/inventory.entity';

@Injectable()
export class CharacterService {
  constructor(
    @InjectRepository(Character)
    private charactersRepository: Repository<Character>,
    @InjectRepository(Stats)
    private statsRepository: Repository<Stats>,
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
  ) {}

  async getCharacter(characterId: number): Promise<Character> {
    return await this.charactersRepository.findOne({
      where: { id: characterId },
      relations: ['stats'],
    });
  }

  // loads character's inventory from database
  async getInventory(characterId: number): Promise<Inventory> {
    return await this.inventoryRepository.findOne({
      where: { character: { id: characterId } },
      relations: [
        'slots',
        'equipment',
        'equipment.weapon',
        'equipment.helmet',
        'equipment.talisman',
        'equipment.boots',
        'equipment.armor',
        'equipment.secondary',
        'slots.item',
      ],
    });
  }

  // loads user's character from database
  async getPlayerCharacter(
    userId: number,
    characterId: number,
  ): Promise<Character> {
    return await this.charactersRepository.findOne({
      where: { id: characterId, user: { id: userId } },
      relations: [
        'avatar',
        'stats',
        'inventory',
        'inventory.slots',
        'inventory.equipment',
        'inventory.equipment.weapon',
        'inventory.equipment.helmet',
        'inventory.equipment.talisman',
        'inventory.equipment.boots',
        'inventory.equipment.armor',
        'inventory.equipment.secondary',
        'inventory.slots.item',
      ],
      select: [
        'id',
        'name',
        'level',
        'exp',
        'maxExp',
        'charClass',
        'pos',
        'skillIds',
      ],
    });
  }

  async addExperience(
    character: CharacterClass,
    expAmount: number,
  ): Promise<{ leveledUp: boolean; newLevel?: number }> {
    character.exp += expAmount;
    let leveledUp = false;
    let newLevel;

    while (character.exp >= character.maxExp) {
      await this.levelUp(character);
      leveledUp = true;
      newLevel = character.level;
    }

    await this.syncCharacterToDatabase(character);

    return { leveledUp, newLevel };
  }

  private async levelUp(character: CharacterClass): Promise<void> {
    character.level++;
    character.exp -= character.maxExp;
    character.maxExp = this.calculateNextLevelExp(character.level);

    // Increase stats based on level up
    await this.increaseStatsOnLevelUp(character);
  }

  private calculateNextLevelExp(level: number): number {
    return Math.floor(5 * Math.pow(level, 1.5));
  }

  private async increaseStatsOnLevelUp(
    character: CharacterClass,
  ): Promise<void> {
    const baseIncrease = {
      maxHp: 2,
      maxMana: 1,
      damage: 1,
      armor: 0,
    };

    const classSpecificIncrease = this.getClassSpecificStatIncrease(
      character.charClass,
    );

    character.stats.maxHp +=
      baseIncrease.maxHp + classSpecificIncrease.maxHp || 0;
    character.stats.maxMana +=
      baseIncrease.maxMana + classSpecificIncrease.maxMana || 0;
    character.stats.damage +=
      baseIncrease.damage + classSpecificIncrease.damage || 0;
    character.stats.armor +=
      baseIncrease.armor + classSpecificIncrease.armor || 0;

    Object.entries(classSpecificIncrease).forEach(([stat, value]) => {
      if (
        stat in character.stats &&
        stat !== 'maxHp' &&
        stat !== 'maxMana' &&
        stat !== 'damage' &&
        stat !== 'armor'
      ) {
        character.stats[stat] += value;
      }
    });

    character.stats.hp = character.stats.maxHp;
    character.stats.mana = character.stats.maxMana;

    await this.syncStatsToDatabase(character);
  }

  private getClassSpecificStatIncrease(
    charClass: CharacterClassType,
  ): Partial<Stats> {
    switch (charClass) {
      case 'Blood Knight':
        return {
          maxHp: 3,
          armor: 1,
          damage: 1,
        };
      case 'Berserk':
        return {
          maxHp: 1,
          damage: 2,
          attackSpeed: 0.05,
          critChance: 0.2,
        };
      case 'Toxin Rogue':
        return {
          evasion: 0.5,
          poisonDamage: 2,
          poisonChance: 0.2,
          critChance: 0.3,
        };
      case 'Shadow Monk':
        return {
          maxMana: 2,
          evasion: 0.1,
          attackSpeed: 0.02,
          critChance: 0.1,
        };
      case 'Battle Mage':
        return {
          maxMana: 3,
          fireDamage: 3,
          coldDamage: 2,
          fireChance: 0.2,
          coldChance: 0.2,
        };
      default:
        return {};
    }
  }

  async syncCharacterToDatabase(character: CharacterClass): Promise<void> {
    const characterEntity = await this.charactersRepository.findOne({
      where: { id: character.id },
      relations: ['stats'],
    });

    if (!characterEntity) {
      console.error('Character not found in database.');
      return;
    }

    characterEntity.level = character.level;
    characterEntity.exp = character.exp;
    characterEntity.maxExp = character.maxExp;
    characterEntity.pos = character.pos;
    characterEntity.skillIds = character.skillIds;

    await this.charactersRepository.save(characterEntity);
    await this.syncStatsToDatabase(character);
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

  async removeSkill(character: CharacterClass, skillId: string): Promise<void> {
    character.removeSkill(skillId);
    await this.syncCharacterToDatabase(character);
  }

  async reorderSkills(
    character: CharacterClass,
    skillId: string,
    newIndex: number,
  ): Promise<void> {
    const currentIndex = character.skillIds.indexOf(skillId);
    if (currentIndex > -1) {
      character.skillIds.splice(currentIndex, 1);
      character.skillIds.splice(newIndex, 0, skillId);
      await this.syncCharacterToDatabase(character);
    }
  }
}

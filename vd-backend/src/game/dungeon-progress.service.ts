import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DungeonProgress } from './entities/dungeon-progress.entity';
import { Character } from './entities/character.entity';

@Injectable()
export class DungeonProgressService {
  constructor(
    @InjectRepository(DungeonProgress)
    private dungeonProgressRepository: Repository<DungeonProgress>,
  ) {}

  async createDungeonProgress(character: Character): Promise<DungeonProgress> {
    const dungeonProgress = this.dungeonProgressRepository.create({
      maxReachedLevel: 1,
      totalEnemiesKilled: 0,
      totalDungeonsCompleted: 0,
      totalGoldCollected: 0,
      totalItemsFound: 0,
      character: character,
    });

    return this.dungeonProgressRepository.save(dungeonProgress);
  }

  async updateMaxReachedLevel(
    characterId: number,
    level: number,
  ): Promise<DungeonProgress | null> {
    const dungeonProgress = await this.dungeonProgressRepository.findOne({
      where: { character: { id: characterId } },
    });
    if (dungeonProgress && level > dungeonProgress.maxReachedLevel) {
      dungeonProgress.maxReachedLevel = level;
      return this.dungeonProgressRepository.save(dungeonProgress);
    }
    return dungeonProgress;
  }

  async incrementEnemyKilled(
    characterId: number,
  ): Promise<DungeonProgress | null> {
    const dungeonProgress = await this.dungeonProgressRepository.findOne({
      where: { character: { id: characterId } },
    });

    if (dungeonProgress) {
      dungeonProgress.totalEnemiesKilled++;
      return this.dungeonProgressRepository.save(dungeonProgress);
    }
    return null;
  }

  async incrementDungeonCompleted(
    characterId: number,
  ): Promise<DungeonProgress | null> {
    const dungeonProgress = await this.dungeonProgressRepository.findOne({
      where: { character: { id: characterId } },
    });
    if (dungeonProgress) {
      dungeonProgress.totalDungeonsCompleted++;
      return this.dungeonProgressRepository.save(dungeonProgress);
    }
    return null;
  }

  async updateGoldCollected(
    characterId: number,
    amount: number,
  ): Promise<DungeonProgress | null> {
    const dungeonProgress = await this.dungeonProgressRepository.findOne({
      where: { character: { id: characterId } },
    });
    if (dungeonProgress) {
      dungeonProgress.totalGoldCollected += amount;
      return this.dungeonProgressRepository.save(dungeonProgress);
    }
    return null;
  }

  async incrementItemFound(
    characterId: number,
  ): Promise<DungeonProgress | null> {
    const dungeonProgress = await this.dungeonProgressRepository.findOne({
      where: { character: { id: characterId } },
    });
    if (dungeonProgress) {
      dungeonProgress.totalItemsFound++;
      return this.dungeonProgressRepository.save(dungeonProgress);
    }
    return null;
  }

  async getDungeonProgress(
    characterId: number,
  ): Promise<DungeonProgress | null> {
    return this.dungeonProgressRepository.findOne({
      where: { character: { id: characterId } },
    });
  }
}

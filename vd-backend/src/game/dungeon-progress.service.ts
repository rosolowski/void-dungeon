import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DungeonProgress } from './entities/dungeon-progress.entity';

@Injectable()
export class DungeonProgressService {
  constructor(
    @InjectRepository(DungeonProgress)
    private dungeonProgressRepository: Repository<DungeonProgress>,
  ) {}

  async updateMaxReachedLevel(
    characterId: number,
    level: number,
  ): Promise<DungeonProgress | null> {
    console.log('updateMaxReachedLevel', characterId, level);
    const dungeonProgress = await this.getDungeonProgress(characterId);

    if (dungeonProgress && level > dungeonProgress.maxReachedLevel) {
      dungeonProgress.maxReachedLevel = level;
      return this.dungeonProgressRepository.save(dungeonProgress);
    }
    return dungeonProgress;
  }

  async incrementEnemyKilled(
    characterId: number,
  ): Promise<DungeonProgress | null> {
    const dungeonProgress = await this.getDungeonProgress(characterId);

    if (dungeonProgress) {
      dungeonProgress.totalEnemiesKilled++;
      return this.dungeonProgressRepository.save(dungeonProgress);
    }
    return null;
  }

  async incrementDungeonCompleted(
    characterId: number,
  ): Promise<DungeonProgress | null> {
    const dungeonProgress = await this.getDungeonProgress(characterId);
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
    const dungeonProgress = await this.getDungeonProgress(characterId);
    if (dungeonProgress) {
      dungeonProgress.totalGoldCollected += amount;
      return this.dungeonProgressRepository.save(dungeonProgress);
    }
    return null;
  }

  async incrementItemFound(
    characterId: number,
  ): Promise<DungeonProgress | null> {
    const dungeonProgress = await this.getDungeonProgress(characterId);
    if (dungeonProgress) {
      dungeonProgress.totalItemsFound++;
      return this.dungeonProgressRepository.save(dungeonProgress);
    }
    return null;
  }

  async incrementItemFoundWithAmount(
    characterId: number,
    amount: number,
  ): Promise<DungeonProgress | null> {
    const dungeonProgress = await this.getDungeonProgress(characterId);
    if (dungeonProgress) {
      dungeonProgress.totalItemsFound += amount;
      return this.dungeonProgressRepository.save(dungeonProgress);
    }
    return null;
  }

  async getDungeonProgress(
    characterId: number,
  ): Promise<DungeonProgress | null> {
    return this.dungeonProgressRepository.findOne({
      where: { character: { id: characterId } },
      relations: ['character'],
    });
  }
}

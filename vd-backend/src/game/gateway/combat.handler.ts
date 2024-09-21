import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { BaseHandler, GameSocket } from './base.handler';
import { Game } from '../engine/game';
import { CharacterService } from '../character.service';
import { Character } from '../class/Character';
import { AttackLog } from '../engine/battle-manager';
import { GameInstance } from '../class/GameInstance';
import { InventoryService } from '../inventory.service';
import { inventoryEntityToInventoryClass } from '../engine/utils';
import { DungeonProgressService } from '../dungeon-progress.service';
import { PartyManager } from '../engine/party-manager';

@Injectable()
export class CombatHandler extends BaseHandler {
  private readonly game: Game;
  private partyManager: PartyManager;
  private server: Server;

  constructor(
    private readonly characterService: CharacterService,
    private readonly inventoryService: InventoryService,
    private readonly dungeonProgressService: DungeonProgressService,
  ) {
    super();
    this.game = Game.getInstance();
    this.partyManager = this.game.getPartyManager();
  }

  public setServer(server: Server) {
    this.server = server;
  }

  async handleAttackEntity(
    data: { entityId: number },
    client: GameSocket,
  ): Promise<void> {
    if (!this.validateClient(client)) return;

    try {
      const character: Character = client.data.character;
      const result = this.game.attackEntity(character, data.entityId);

      if (!result.success || !result.instance || !result.attackLog) {
        throw new Error('Invalid attack attempt');
      }

      const { instance, attackLog, entityType } = result;

      await this.processAttackResult(
        client,
        character,
        attackLog,
        instance,
        entityType,
      );
    } catch (error) {
      this.handleError(client, 'Attack error', error);
    }
  }

  private async processAttackResult(
    client: GameSocket,
    character: Character,
    attackLog: AttackLog,
    instance: GameInstance,
    entityType: string,
  ): Promise<void> {
    if (attackLog.entityDied) {
      this.game.removeEntity(instance, attackLog.entityFinal.id);

      if (entityType === 'chest') {
        await this.handleChestOpening(client, character);
      } else {
        await this.handleEntityDeath(client, character, instance.depth);
      }
    }

    if (attackLog.characterDied) {
      await this.handleCharacterDeath(client, character);
    }

    // Update AttackLog with the latest character data
    attackLog.characterFinal = character;

    this.emitAttackLog(client, instance, attackLog);
  }

  private async handleChestOpening(
    client: GameSocket,
    character: Character,
  ): Promise<void> {
    const droppedItems =
      await this.inventoryService.generateAndAddGuaranteedItems(
        character,
        character.level,
        3,
      );

    if (droppedItems.length > 0) {
      for (const item of droppedItems) {
        client.emit('itemDropped', item);
      }
      await this.updateDungeonProgress(client, character.id, 3);
      await this.emitUpdatedInventory(client);
    }
  }

  private async handleEntityDeath(
    client: GameSocket,
    character: Character,
    dungeonLevel: number,
  ): Promise<void> {
    const droppedItem = await this.inventoryService.generateAndAddItem(
      character,
      dungeonLevel,
    );

    if (droppedItem) {
      client.emit('itemDropped', droppedItem);
      await this.emitUpdatedInventory(client);
      await this.updateDungeonProgress(client, character.id, 1);
    }

    await this.distributeExperience(client, character, dungeonLevel);
    await this.updateDungeonProgress(client, character.id, 0, 1);
  }

  private async distributeExperience(
    client: GameSocket,
    character: Character,
    dungeonLevel: number,
  ): Promise<void> {
    const expGained = this.calculateExperienceGain(
      character.level,
      dungeonLevel,
    );
    console.log('Distributing experience for character:', character.id);
    console.log('Character socket data:', JSON.stringify(client.data, null, 2));

    console.log('PartyManager:', this.partyManager);
    const party = this.partyManager.getPartyFromCharacter(character.id);

    console.log('Retrieved party:', party);

    if (!party) {
      console.log('No party found, adding experience to single character');
      await this.addExperienceToCharacter(character, expGained);
      return;
    }

    console.log('Party found, distributing experience among members');
    const expPerMember = Math.floor(expGained / 2);

    for (const memberId of party.members) {
      const member = this.game.getCharacterById(memberId);
      if (!member) {
        console.log(`Member ${memberId} not found, skipping`);
        continue;
      }

      const expToAdd = memberId === character.id ? expGained : expPerMember;
      await this.addExperienceToCharacter(member, expToAdd);
    }
  }

  private async addExperienceToCharacter(
    character: Character,
    exp: number,
  ): Promise<void> {
    console.log('addExperienceToCharacter', character, exp);
    await this.characterService.addExperience(character, exp);
    const socket = this.game.getConnection(character.id);
    if (socket) {
      socket.emit('getPlayerCharacter', character);
    }
  }

  private calculateExperienceGain(
    characterLevel: number,
    dungeonLevel: number,
  ): number {
    const baseExp = dungeonLevel * 2;
    return Math.max(Math.round(baseExp), 1);
  }

  private async handleCharacterDeath(
    client: GameSocket,
    character: Character,
  ): Promise<void> {
    const oldInstance = this.game.disconnectCharacterFromInstance(character);
    this.emitCharacterLeaveInstance(oldInstance, client);

    this.resetCharacterAfterDeath(character);

    const cityInstance = this.game.addCharacterToCity(character);

    await this.characterService.syncCharacterToDatabase(character);
    this.game.connectCharacterToInstance(character);
    this.emitCharacterJoinInstance(cityInstance, client);
  }

  private resetCharacterAfterDeath(character: Character): void {
    character.stats.hp = 1;
    character.stats.mana = character.stats.maxMana;
    character.stats.coldStatus = 0;
    character.stats.voidStatus = 0;
    character.stats.lightStatus = 0;
    character.stats.fireStatus = 0;
    character.stats.poisonStatus = 0;
  }

  private async emitUpdatedInventory(client: GameSocket): Promise<void> {
    const characterId = client.data?.character?.id;
    const inventoryEntity =
      await this.characterService.getInventory(characterId);
    const inventory = inventoryEntityToInventoryClass(inventoryEntity);
    client.emit('getInventory', inventory.serialize());
  }

  private emitAttackLog(
    client: GameSocket,
    instance: GameInstance,
    attackLog: AttackLog,
  ): void {
    this.server.to(instance.room).emit('attackLog', attackLog);
  }

  private emitCharacterLeaveInstance(
    instance: GameInstance,
    client: GameSocket,
  ): void {
    client.to(instance.room).emit('removeCharacter', client.data.character.id);
    client.leave(instance.room);
  }

  private emitCharacterJoinInstance(
    instance: GameInstance,
    client: GameSocket,
  ): void {
    client.join(instance.room);
    client.emit('getPlayerCharacter', client.data.character);
    client.emit('getInstance', instance.serialize());
    client.to(instance.room).emit('spawnCharacter', client.data.character);
  }

  private async updateDungeonProgress(
    client: GameSocket,
    characterId: number,
    itemsFound: number = 0,
    enemiesKilled: number = 0,
  ): Promise<void> {
    let updatedProgress;
    if (itemsFound > 0) {
      updatedProgress =
        await this.dungeonProgressService.incrementItemFoundWithAmount(
          characterId,
          itemsFound,
        );
    }
    if (enemiesKilled > 0) {
      updatedProgress =
        await this.dungeonProgressService.incrementEnemyKilled(characterId);
    }
    if (updatedProgress) {
      client.emit('dungeonProgressUpdate', updatedProgress);
    }
  }
}

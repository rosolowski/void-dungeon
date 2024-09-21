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
  private server: Server;

  constructor(
    private readonly characterService: CharacterService,
    private readonly inventoryService: InventoryService,
    private readonly dungeonProgressService: DungeonProgressService,
    private readonly partyManager: PartyManager,
  ) {
    super();
    this.game = Game.getInstance();
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
      const { success, instance, attackLog, entityType } =
        this.game.attackEntity(character, data.entityId);

      if (success && instance && attackLog) {
        this.emitEntityAttack(client, instance, attackLog);
        await this.handleAttackResult(
          client,
          character,
          attackLog,
          instance,
          entityType,
        );
      } else {
        throw new Error('Invalid attack attempt');
      }
    } catch (error) {
      this.handleError(client, 'Attack error', error);
    }
  }

  private async handleAttackResult(
    client: GameSocket,
    character: Character,
    attackLog: AttackLog,
    instance: GameInstance,
    entityType: string,
  ): Promise<void> {
    if (attackLog.characterDied) {
      await this.handleCharacterDeath(client, character);
    }

    if (attackLog.entityDied) {
      this.game.removeEntity(instance, attackLog.entityId);
      if (entityType === 'chest') {
        await this.handleChestOpening(client, character);
      } else {
        await this.handleEntityDeath(client, character, instance.depth);
      }
    }

    client.emit('updateStats', character.stats);
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
      const updatedProgress =
        await this.dungeonProgressService.incrementItemFoundWithAmount(
          character.id,
          3,
        );
      if (updatedProgress) {
        client.emit('dungeonProgressUpdate', updatedProgress);
      }
      await this.emitUpdatedInventoryFromDb(client);
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
      await this.emitUpdatedInventoryFromDb(client);
      const updatedProgress =
        await this.dungeonProgressService.incrementItemFound(character.id);
      if (updatedProgress) {
        client.emit('dungeonProgressUpdate', updatedProgress);
      }
    }

    this.distributeExperience(character, dungeonLevel);

    const updatedProgress =
      await this.dungeonProgressService.incrementEnemyKilled(character.id);
    if (updatedProgress) {
      client.emit('dungeonProgressUpdate', updatedProgress);
    }

    client.emit('getPlayerCharacter', character);
  }

  private distributeExperience(
    character: Character,
    dungeonLevel: number,
  ): void {
    const expGained = this.calculateExperienceGain(
      character.level,
      dungeonLevel,
    );
    const party = this.partyManager.getPartyFromCharacter(character.id);

    if (!party) {
      this.characterService.addExperience(character, expGained);
      return;
    }

    const expPerMember = Math.floor(expGained / 2);

    party.members.forEach((memberId) => {
      const member = this.game.getCharacterById(memberId);
      if (!member) return;

      const expToAdd = memberId === character.id ? expGained : expPerMember;
      this.characterService.addExperience(member, expToAdd);

      const memberSocket = this.game.getConnection(memberId);
      if (memberSocket) {
        memberSocket.emit('getPlayerCharacter', member);
      }
    });
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

    character.stats.hp = 1;
    character.stats.mana = character.stats.maxMana;

    character.stats.coldStatus = 0;
    character.stats.voidStatus = 0;
    character.stats.lightStatus = 0;
    character.stats.fireStatus = 0;
    character.stats.poisonStatus = 0;

    const cityInstance = this.game.addCharacterToCity(character);

    await Promise.all([
      this.characterService.syncCharacterToDatabase(character),
    ]);

    this.game.connectCharacterToInstance(character);
    this.emitCharacterJoinInstance(cityInstance, client);
  }

  private async emitUpdatedInventoryFromDb(client: GameSocket): Promise<void> {
    const characterId = client.data?.character?.id;
    const inventoryEntity =
      await this.characterService.getInventory(characterId);
    const inventory = inventoryEntityToInventoryClass(inventoryEntity);
    client.emit('getInventory', inventory.serialize());
  }

  private emitEntityAttack(
    client: GameSocket,
    instance: GameInstance,
    attackLog: AttackLog,
  ): void {
    console.log('client rooms', client.rooms);
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
}

import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { BaseHandler } from './base.handler';
import { Game } from '../engine/game';
import { GameService } from '../game.service';
import { CharacterService } from '../character.service';
import { Character } from '../class/Character';
import { AttackLog } from '../engine/battle-manager';
import { GameInstance } from '../class/GameInstance';
import { Server } from 'socket.io';
import { InventoryService } from '../inventory.service';
import { inventoryEntityToInventoryClass } from '../engine/utils';

@Injectable()
export class CombatHandler extends BaseHandler {
  private readonly game: Game;
  private server: Server;

  constructor(
    private readonly gameService: GameService,
    private readonly characterService: CharacterService,
    private readonly inventoryService: InventoryService,
  ) {
    super();
    this.game = Game.getInstance();
  }

  public setServer(server: Server) {
    this.server = server;
  }

  async handleAttackEntity(
    data: { entityId: number },
    client: Socket,
  ): Promise<void> {
    if (!this.validateClient(client)) return;

    console.log('handleAttackEntity');

    try {
      const character: Character = client.data.character;
      const { success, instance, attackLog } = this.game.attackEntity(
        character,
        data.entityId,
      );

      console.log('success', success);

      if (success && instance && attackLog) {
        this.emitEntityAttack(client, instance, attackLog);
        await this.handleAttackResult(client, character, attackLog, instance);
      } else {
        console.log('success false (else)');
        throw new Error('Invalid attack attempt');
      }
    } catch (error) {
      this.handleError(client, 'Attack error', error);
    }
  }

  private async handleAttackResult(
    client: Socket,
    character: Character,
    attackLog: AttackLog,
    instance: GameInstance,
  ): Promise<void> {
    if (attackLog.characterDied) {
      await this.handleCharacterDeath(client, character);
    }

    if (attackLog.entityDied) {
      this.game.removeEntity(instance, attackLog.entityId);
      await this.handleEntityDeath(client, character);
    }

    client.emit('updateStats', character.stats);
  }

  private async handleCharacterDeath(
    client: Socket,
    character: Character,
  ): Promise<void> {
    const oldInstance = this.game.disconnectCharacterFromInstance(character);
    this.emitCharacterLeaveInstance(oldInstance, client);

    character.stats.hp = 1;
    character.stats.mana = character.stats.maxMana;
    const cityInstance = this.game.addCharacterToCity(character);

    await Promise.all([
      this.gameService.syncCharacter(character),
      this.characterService.syncStatsToDatabase(character),
    ]);

    this.game.connectCharacterToInstance(character);
    this.emitCharacterJoinInstance(cityInstance, client);
  }

  private async handleEntityDeath(
    client: Socket,
    character: Character,
  ): Promise<void> {
    const droppedItem = await this.inventoryService.generateAndAddItem(
      character,
      character.level,
    );
    console.log('item dropped');
    if (droppedItem) {
      client.emit('itemDropped', droppedItem);
      await this.emitUpdatedInventoryFromDb(client);
    }
  }

  private async emitUpdatedInventoryFromDb(client: Socket): Promise<void> {
    const characterId = client.data?.character?.id;
    const inventoryEntity = await this.gameService.getInventory(characterId);
    const inventory = inventoryEntityToInventoryClass(inventoryEntity);
    client.emit('getInventory', inventory.serialize());
  }

  private emitEntityAttack(
    client: Socket,
    instance: GameInstance,
    attackLog: AttackLog,
  ): void {
    console.log('client rooms', client.rooms);
    this.server.to(instance.room).emit('attackLog', attackLog);
  }

  private emitCharacterLeaveInstance(
    instance: GameInstance,
    client: Socket,
  ): void {
    client.to(instance.room).emit('removeCharacter', client.data.character.id);
    client.leave(instance.room);
  }

  private emitCharacterJoinInstance(
    instance: GameInstance,
    client: Socket,
  ): void {
    client.join(instance.room);
    client.emit('getPlayerCharacter', client.data.character);
    client.emit('getInstance', instance.serialize());
    client.to(instance.room).emit('spawnCharacter', client.data.character);
  }
}

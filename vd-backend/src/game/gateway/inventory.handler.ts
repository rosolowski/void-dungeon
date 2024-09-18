import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { BaseHandler, GameSocket } from './base.handler';
import { InventoryService } from '../inventory.service';
import { GameService } from '../game.service';
import { CharacterService } from '../character.service';
import { Item } from '../entities/item.entity';
import { ItemType } from '../class/Item';
import { Character } from '../class/Character';
import { inventoryEntityToInventoryClass } from '../engine/utils';
import { CITY_INSTANCE_ID } from '../constants';
import { DungeonProgressService } from '../dungeon-progress.service';

@Injectable()
export class InventoryHandler extends BaseHandler {
  private server: Server;

  constructor(
    private readonly inventoryService: InventoryService,
    private readonly gameService: GameService,
    private readonly characterService: CharacterService,
    private readonly dungeonProgressService: DungeonProgressService,
  ) {
    super();
  }

  public setServer(server: Server) {
    this.server = server;
  }

  async handleAddItem(
    itemData: Partial<Item>,
    client: GameSocket,
  ): Promise<void> {
    if (!this.validateClient(client)) return;
    try {
      const characterId = client.data?.character?.id;
      await this.inventoryService.addItem(characterId, itemData);
      await this.emitUpdatedInventoryFromDb(client);
    } catch (error) {
      await this.handleInventoryError(client, error);
    }
  }

  async handleEquipItem(
    data: { fromSlotId: number; equipmentSlot: ItemType },
    client: GameSocket,
  ): Promise<void> {
    if (!this.validateClient(client)) return;
    try {
      const character: Character = client.data.character;
      await this.inventoryService.equipItem(
        character,
        data.fromSlotId,
        data.equipmentSlot,
      );
      await this.updateClientInventoryAndStats(client);
    } catch (error) {
      await this.handleInventoryError(client, error);
    }
  }

  async handleUnequipItem(
    data: { equipmentSlot: ItemType },
    client: GameSocket,
  ): Promise<void> {
    if (!this.validateClient(client)) return;
    try {
      const character: Character = client.data.character;
      await this.inventoryService.unequipItem(character, data.equipmentSlot);
      await this.updateClientInventoryAndStats(client);
    } catch (error) {
      await this.handleInventoryError(client, error);
    }
  }

  async handleUnequipItemToSlot(
    data: { equipmentSlot: ItemType; targetSlotId: number },
    client: GameSocket,
  ): Promise<void> {
    if (!this.validateClient(client)) return;
    try {
      const character: Character = client.data.character;
      await this.inventoryService.unequipItemToSlot(
        character,
        data.equipmentSlot,
        data.targetSlotId,
      );
      await this.updateClientInventoryAndStats(client);
    } catch (error) {
      await this.handleInventoryError(client, error);
    }
  }

  async handleMoveItem(
    data: { fromSlotId: number; targetSlotId: number },
    client: GameSocket,
  ): Promise<void> {
    if (!this.validateClient(client)) return;
    try {
      const characterId = client.data?.character?.id;
      await this.inventoryService.moveItem(
        characterId,
        data.fromSlotId,
        data.targetSlotId,
      );
      await this.emitUpdatedInventoryFromDb(client);
    } catch (error) {
      await this.handleInventoryError(client, error);
    }
  }

  async handleSellItem(
    data: { slotIndex: number },
    client: GameSocket,
  ): Promise<void> {
    if (!this.validateClient(client)) return;
    try {
      const character = client.data.character as Character;
      if (character.pos.instanceId !== CITY_INSTANCE_ID) {
        throw new Error('Can only sell items in city');
      }
      const { goldGained } = await this.inventoryService.sellItem(
        character.id,
        data.slotIndex,
      );
      await this.emitUpdatedInventoryFromDb(client);
      const updatedProgress =
        await this.dungeonProgressService.updateGoldCollected(
          character.id,
          goldGained,
        );
      if (updatedProgress) {
        client.emit('dungeonProgressUpdate', updatedProgress);
      }
      client.emit('lootGold', { goldGained });
    } catch (error) {
      this.handleError(client, 'Sell item error', error);
    }
  }

  async handleDismantleAllItems(
    data: { rarity: string },
    client: GameSocket,
  ): Promise<void> {
    if (!this.validateClient(client)) return;
    try {
      const character = client.data.character as Character;

      const { shardsGained, itemsDismantled } =
        await this.inventoryService.dismantleAllItems(
          character.id,
          data.rarity,
        );

      client.emit('lootShards', { shardsGained });
      client.emit('itemsDismantled', { count: itemsDismantled });

      if (itemsDismantled > 0) {
        await this.emitUpdatedInventoryFromDb(client);
      }
    } catch (error) {
      this.handleError(client, 'Dismantle all items error', error);
    }
  }

  async handleDismantleItem(
    data: { slotIndex: number },
    client: GameSocket,
  ): Promise<void> {
    if (!this.validateClient(client)) return;
    try {
      const character = client.data.character as Character;

      const { shardsGained } = await this.inventoryService.dismantleItem(
        character.id,
        data.slotIndex,
      );
      await this.emitUpdatedInventoryFromDb(client);
      client.emit('lootShards', { shardsGained });
    } catch (error) {
      this.handleError(client, 'Dismantle item error', error);
    }
  }

  private async updateClientInventoryAndStats(
    client: GameSocket,
  ): Promise<void> {
    await this.emitUpdatedInventoryFromDb(client);
    await this.emitCharacterStatsFromDb(client);
  }

  private async handleInventoryError(
    client: GameSocket,
    error: Error,
  ): Promise<void> {
    await this.emitUpdatedInventoryFromDb(client);
    this.handleError(client, 'Inventory error', error);
  }

  private async emitUpdatedInventoryFromDb(client: GameSocket): Promise<void> {
    const characterId = client.data?.character?.id;
    const inventoryEntity = await this.gameService.getInventory(characterId);
    const inventory = inventoryEntityToInventoryClass(inventoryEntity);
    client.emit('getInventory', inventory.serialize());
  }

  private async emitCharacterStatsFromDb(client: GameSocket): Promise<void> {
    const characterId = client.data?.character?.id;
    const { stats } = await this.characterService.getCharacter(characterId);
    client.data.character.stats = stats;
    client.emit('getStats', stats);
  }
}

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from '../game.service';
import { Game } from '../engine/game';
import {
  InventoryEntityToInventoryClass,
  characterEntityToCharacterClass,
} from '../engine/utils';
import { MoveCharacterDto } from '../dto/game.dto';
import { InventoryService } from '../inventory.service';
import { Item } from '../entities/item.entity';
import { ItemType } from '../class/Item';
import { CharacterService } from '../character.service';
import { Character } from '../class/Character';
import { GameInstance } from '../class/GameInstance';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private game: Game;

  // character IDs -> socket clients
  private connectionsMap: Map<number, Socket> = new Map();

  constructor(
    private gameService: GameService,
    private inventoryService: InventoryService,
    private chatacterService: CharacterService,
  ) {
    this.game = new Game();
  }

  async handleConnection(client: Socket) {
    const authField = client?.handshake?.auth?.token;
    const characterId = client?.handshake?.query?.characterId;

    const token = authField?.startsWith('Bearer ')
      ? authField.split(' ')[1]
      : null;

    if (!token || !characterId || typeof characterId !== 'string') {
      client.disconnect();
      return;
    }

    // handle multiple connections from the same player
    const prevSocket = this.connectionsMap.get(parseInt(characterId));
    if (prevSocket) {
      prevSocket.emit('error', {
        message: 'Multiple connections detected, disconnected.',
      });
      prevSocket.disconnect();
    }

    try {
      const data = await this.gameService.validateSocketConnection(
        token,
        parseInt(characterId),
      );
      client.data.user = data.user;
      client.data.character = characterEntityToCharacterClass(data.character);
      client.data.validated = true;

      this.connectionsMap.set(parseInt(characterId), client);

      const instance = this.game.connectCharacterToInstance(
        client.data.character,
      );

      this.emitCharacterJoinInstance(instance, client);
      this.emitUpdatedInventory(client);
    } catch (error) {
      console.error(error);
      client.disconnect();
      return;
    }
  }

  handleDisconnect(client: Socket) {
    try {
      if (!client.data.character) return;

      const instance = this.game.disconnectCharacterFromInstance(
        client.data.character,
      );

      this.emitCharacterLeaveInstance(instance, client);
      this.gameService.syncCharacter(client.data.character);
    } catch (error) {
      console.error('Disconnect error: ', error.message);
    }
  }

  @SubscribeMessage('move')
  handleMove(
    @MessageBody() data: MoveCharacterDto,
    @ConnectedSocket() client: Socket,
  ) {
    if (!client.data.validated) {
      client.disconnect();
      return;
    }

    const { x, y } = data;
    const character = client.data.character as Character;

    const moveData = this.game.moveCharacter(x, y, character);

    if (moveData.success && moveData.actionType === 'stairs') {
      const oldInstance = this.game.disconnectCharacterFromInstance(character);
      this.emitCharacterLeaveInstance(oldInstance, client);

      const newInstance = this.game.generateNewInstance();
      const { x, y } = newInstance.location.spawnCoords;
      character.setPos(x, y);
      character.pos.instanceId = newInstance.id;

      this.game.connectCharacterToInstance(character);
      this.emitCharacterJoinInstance(newInstance, client);
    } else {
      this.emitCharacterMove(client, moveData);
    }
  }

  @SubscribeMessage('addItem')
  async handleAddItem(
    @MessageBody() itemData: Partial<Item>,
    @ConnectedSocket() client: Socket,
  ) {
    if (!client.data.validated) {
      client.disconnect();
      return;
    }

    const characterId = client.data?.character?.id;

    try {
      await this.inventoryService.addItem(characterId, itemData);
      this.emitUpdatedInventory(client);
    } catch (error) {
      this.emitUpdatedInventory(client);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('equipItem')
  async handleEquipItem(
    @MessageBody() data: { fromSlotId: number; equipmentSlot: ItemType },
    @ConnectedSocket() client: Socket,
  ) {
    if (!client.data.validated) {
      client.disconnect();
      return;
    }

    const characterId = client.data?.character?.id;

    try {
      await this.inventoryService.equipItem(
        characterId,
        data.fromSlotId,
        data.equipmentSlot,
      );
      await this.emitUpdatedInventory(client);
      await this.emitCharacterStats(client);
    } catch (error) {
      this.emitUpdatedInventory(client);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('unequipItem')
  async handleUnequipItem(
    @MessageBody() data: { equipmentSlot: ItemType },
    @ConnectedSocket() client: Socket,
  ) {
    if (!client.data.validated) {
      client.disconnect();
      return;
    }

    const characterId = client.data?.character?.id;

    try {
      await this.inventoryService.unequipItem(characterId, data.equipmentSlot);
      await this.emitUpdatedInventory(client);
      await this.emitCharacterStats(client);
    } catch (error) {
      this.emitUpdatedInventory(client);
      client.emit('error', { message: error.message });
    }
  }

  // specific slot unequip
  @SubscribeMessage('unequipItemToSlot')
  async handleUnequipItemToSlot(
    @MessageBody()
    data: { equipmentSlot: ItemType; targetSlotId: number },
    @ConnectedSocket() client: Socket,
  ) {
    if (!client.data.validated) {
      client.disconnect();
      return;
    }

    const characterId = client.data?.character?.id;

    try {
      await this.inventoryService.unequipItemToSlot(
        characterId,
        data.equipmentSlot,
        data.targetSlotId,
      );

      await this.emitUpdatedInventory(client);
      await this.emitCharacterStats(client);
    } catch (error) {
      this.emitUpdatedInventory(client);
      client.emit('error', { message: error.message });
    }
  }

  // specific slot unequip
  @SubscribeMessage('moveItem')
  async handleMoveItem(
    @MessageBody()
    data: { fromSlotId: number; targetSlotId: number },
    @ConnectedSocket() client: Socket,
  ) {
    if (!client.data.validated) {
      client.disconnect();
      return;
    }

    const characterId = client.data?.character?.id;

    try {
      await this.inventoryService.moveItem(
        characterId,
        data.fromSlotId,
        data.targetSlotId,
      );
      this.emitUpdatedInventory(client);
    } catch (error) {
      client.emit('error', { message: error.message });
      this.emitUpdatedInventory(client);
    }
  }

  async emitUpdatedInventory(client: Socket): Promise<void> {
    const characterId = client.data?.character?.id;
    const inventoryEntity = await this.gameService.getInventory(characterId);
    const inventory = InventoryEntityToInventoryClass(inventoryEntity);
    client.emit('getInventory', inventory.serialize());
  }

  async emitCharacterStats(client: Socket): Promise<void> {
    // get new stats from db
    const characterId = client.data?.character?.id;
    const { stats } = await this.chatacterService.getCharacter(characterId);

    // set them to character in instance
    client.data.character.stats = stats;

    // send them to client
    client.emit('getStats', stats);
  }

  emitCharacterLeaveInstance(instance: GameInstance, client: Socket) {
    client.to(instance.room).emit('removeCharacter', client.data.character.id);
    client.leave(instance.room);
  }

  emitCharacterJoinInstance(instance: GameInstance, client: Socket) {
    client.join(instance.room);
    client.emit('getPlayerCharacter', client.data.character);
    client.emit('getInstance', instance.serialize());
    client.to(instance.room).emit('spawnCharacter', client.data.character);
  }

  emitCharacterMove(
    client: Socket,
    moveData: {
      success: boolean;
      room: string;
      newX: number;
      newY: number;
    },
  ) {
    const { success, room, newX, newY } = moveData;
    if (success) {
      client.to(room).emit('characterMoved', {
        characterId: client.data.character.id,
        x: newX,
        y: newY,
      });
    } else {
      client.emit('moveCorrection', { success, newX, newY });
    }
  }
}

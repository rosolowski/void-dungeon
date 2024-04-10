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
import { GameService } from './game.service';
import { Game } from './engine/game';
import {
  InventoryEntityToInventoryClass,
  characterEntityToCharacterClass,
} from './engine/utils';
import { MoveCharacterDto } from './dto/game.dto';
import { InventoryService } from './inventory.service';
import { Item } from './entities/item.entity';
import { ItemType } from './class/Item';
import { CharacterService } from './character.service';

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
      console.log('disconnected previous socket');
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

      const instance = this.game.connectCharacter(client.data.character);

      client.join(instance.room);
      client.emit('getInstance', instance.serialize());

      this.sendUpdatedInventory(client);

      client.emit('getPlayerCharacter', client.data.character);
      client.to(instance.room).emit('spawnCharacter', client.data.character);
    } catch (error) {
      console.error(error);
      client.disconnect();
      return;
    }
  }

  handleDisconnect(client: Socket) {
    try {
      if (!client.data.character) return;

      console.log(`Character disconnected: ${client.data?.character?.id}`);

      const instance = this.game.disconnectCharacter(client.data.character);

      client
        .to(instance.room)
        .emit('removeCharacter', client.data?.character?.id);
      this.gameService.syncCharacter(client.data.character);
      console.log('Set characters data from server to database! *synced*');
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
    const character = client.data.character;

    const { success, room, newX, newY } = this.game.moveCharacter(
      x,
      y,
      character,
    );

    if (success) {
      client.to(room).emit('characterMoved', {
        characterId: character.id,
        x: newX,
        y: newY,
      });
    } else {
      client.emit('moveCorrection', { success, newX, newY });
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
      this.sendUpdatedInventory(client);
    } catch (error) {
      this.sendUpdatedInventory(client);
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
      await this.sendUpdatedInventory(client);
      await this.updateCharacterStats(client);
    } catch (error) {
      this.sendUpdatedInventory(client);
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
      await this.sendUpdatedInventory(client);
      await this.updateCharacterStats(client);
    } catch (error) {
      this.sendUpdatedInventory(client);
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

      await this.sendUpdatedInventory(client);
      await this.updateCharacterStats(client);
    } catch (error) {
      this.sendUpdatedInventory(client);
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
      this.sendUpdatedInventory(client);
    } catch (error) {
      client.emit('error', { message: error.message });
      this.sendUpdatedInventory(client);
    }
  }

  async sendUpdatedInventory(client: Socket): Promise<void> {
    const characterId = client.data?.character?.id;
    const inventoryEntity = await this.gameService.getInventory(characterId);
    const inventory = InventoryEntityToInventoryClass(inventoryEntity);
    client.emit('getInventory', inventory.serialize());
  }

  async updateCharacterStats(client: Socket): Promise<void> {
    // get new stats from db
    const characterId = client.data?.character?.id;
    const { stats } = await this.chatacterService.getCharacter(characterId);

    // set them to character in instance
    client.data.character.stats = stats;

    // send them to client
    client.emit('getStats', stats);
  }
}

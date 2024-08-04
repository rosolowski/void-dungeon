import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, OnModuleInit } from '@nestjs/common';
import { ConnectionHandler } from './connection.handler';
import { MovementHandler } from './movement.handler';
import { CombatHandler } from './combat.handler';
import { InventoryHandler } from './inventory.handler';
import { MoveCharacterDto } from '../dto/game.dto';
import { ItemType } from '../class/Item';

@WebSocketGateway({ cors: { origin: '*' } })
export class GameGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(GameGateway.name);

  constructor(
    private readonly connectionHandler: ConnectionHandler,
    private readonly movementHandler: MovementHandler,
    private readonly combatHandler: CombatHandler,
    private readonly inventoryHandler: InventoryHandler,
  ) {}

  onModuleInit() {
    this.connectionHandler.setServer(this.server);
    this.movementHandler.setServer(this.server);
    this.combatHandler.setServer(this.server);
    this.inventoryHandler.setServer(this.server);
  }

  async handleConnection(client: Socket): Promise<void> {
    this.logger.log(`Client connected: ${client.id}`);
    await this.connectionHandler.handleConnection(client);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectionHandler.handleDisconnect(client);
  }

  @SubscribeMessage('move')
  handleMove(
    @MessageBody() data: MoveCharacterDto,
    @ConnectedSocket() client: Socket,
  ): void {
    this.logger.log(`Move request received from client ${client.id}`);
    this.movementHandler.handleMove(data, client);
  }

  @SubscribeMessage('attackEntity')
  async handleAttackEntity(
    @MessageBody() data: { entityId: number },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    this.logger.log(`Attack request received from client ${client.id}`);
    await this.combatHandler.handleAttackEntity(data, client);
  }

  @SubscribeMessage('addItem')
  async handleAddItem(
    @MessageBody() itemData: any,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    this.logger.log(`Add item request received from client ${client.id}`);
    await this.inventoryHandler.handleAddItem(itemData, client);
  }

  @SubscribeMessage('equipItem')
  async handleEquipItem(
    @MessageBody() data: { fromSlotId: number; equipmentSlot: ItemType },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    this.logger.log(`Equip item request received from client ${client.id}`);
    await this.inventoryHandler.handleEquipItem(data, client);
  }

  @SubscribeMessage('unequipItem')
  async handleUnequipItem(
    @MessageBody() data: { equipmentSlot: ItemType },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    this.logger.log(`Unequip item request received from client ${client.id}`);
    await this.inventoryHandler.handleUnequipItem(data, client);
  }

  @SubscribeMessage('unequipItemToSlot')
  async handleUnequipItemToSlot(
    @MessageBody() data: { equipmentSlot: ItemType; targetSlotId: number },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    this.logger.log(
      `Unequip item to slot request received from client ${client.id}`,
    );
    await this.inventoryHandler.handleUnequipItemToSlot(data, client);
  }

  @SubscribeMessage('moveItem')
  async handleMoveItem(
    @MessageBody() data: { fromSlotId: number; targetSlotId: number },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    this.logger.log(`Move item request received from client ${client.id}`);
    await this.inventoryHandler.handleMoveItem(data, client);
  }

  @SubscribeMessage('sellItem')
  async handleSellItem(
    @MessageBody() data: { slotIndex: number },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    this.logger.log(`Sell item request received from client ${client.id}`);
    await this.inventoryHandler.handleSellItem(data, client);
  }

  @SubscribeMessage('dismantleItem')
  async handleDismantleItem(
    @MessageBody() data: { slotIndex: number },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    this.logger.log(`Dismantle item request received from client ${client.id}`);
    await this.inventoryHandler.handleDismantleItem(data, client);
  }
}

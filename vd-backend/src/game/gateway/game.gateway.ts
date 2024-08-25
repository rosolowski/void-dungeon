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
import { PartyHandler } from './party.handler';

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
    private readonly partyHandler: PartyHandler,
  ) {}

  onModuleInit() {
    this.connectionHandler.setServer(this.server);
    this.movementHandler.setServer(this.server);
    this.combatHandler.setServer(this.server);
    this.inventoryHandler.setServer(this.server);
    this.partyHandler.setServer(this.server);
  }

  async handleConnection(client: Socket): Promise<void> {
    this.logger.log(`Client connected: ${client.id}`);
    await this.connectionHandler.handleConnection(client);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectionHandler.handleDisconnect(client);
    this.partyHandler.handleDisconnection(client as any);
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
    client: Socket,
    data: { slotIndex: number },
  ): Promise<void> {
    await this.inventoryHandler.handleDismantleItem(data, client);
  }

  @SubscribeMessage('dismantleAllItems')
  async handleDismantleAllItems(
    client: Socket,
    data: { rarity: string },
  ): Promise<void> {
    await this.inventoryHandler.handleDismantleAllItems(data, client);
  }

  @SubscribeMessage('inviteToParty')
  handleInviteToParty(
    @MessageBody() data: { inviteeId: number },
    @ConnectedSocket() client: Socket,
  ): void {
    this.logger.log(`Party invite request received from client ${client.id}`);
    this.partyHandler.handleInvite(client as any, data.inviteeId);
  }

  @SubscribeMessage('respondToPartyInvite')
  handleRespondToPartyInvite(
    @MessageBody() data: { accepted: boolean; inviterId: number },
    @ConnectedSocket() client: Socket,
  ): void {
    this.logger.log(`Party invite response received from client ${client.id}`);
    this.partyHandler.handleInviteResponse(
      client as any,
      data.accepted,
      data.inviterId,
    );
  }

  @SubscribeMessage('leaveParty')
  handleLeaveParty(@ConnectedSocket() client: Socket): void {
    this.logger.log(`Leave party request received from client ${client.id}`);
    this.partyHandler.handleLeaveParty(client as any);
  }

  @SubscribeMessage('voteNextLevel')
  handleVoteNextLevel(@ConnectedSocket() client: Socket): void {
    this.logger.log(`Vote for next level received from client ${client.id}`);
    this.partyHandler.handleVoteNextLevel(client as any);
  }

  @SubscribeMessage('exitDungeon')
  handleExitDungeon(@ConnectedSocket() client: Socket): void {
    this.logger.log(`Exit dungeon request received from client ${client.id}`);
    this.partyHandler.handleExitDungeonVote(client as any);
  }
}

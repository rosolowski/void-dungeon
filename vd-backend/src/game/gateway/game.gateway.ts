import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger, OnModuleInit } from '@nestjs/common';
import { ConnectionHandler } from './connection.handler';
import { MovementHandler } from './movement.handler';
import { CombatHandler } from './combat.handler';
import { InventoryHandler } from './inventory.handler';
import { MoveCharacterDto } from '../dto/game.dto';
import { ItemType } from '../class/Item';
import { PartyHandler } from './party.handler';
import { GameSocket } from './base.handler';
import { ChatHandler } from './chat.handler';
import { NpcHandler } from './npc.handler';
import { VoteType } from '../class/Party';

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
    private readonly chatHandler: ChatHandler,
    private readonly npcHandler: NpcHandler,
  ) {}

  onModuleInit() {
    this.connectionHandler.setServer(this.server);
    this.movementHandler.setServer(this.server);
    this.combatHandler.setServer(this.server);
    this.inventoryHandler.setServer(this.server);
    this.partyHandler.setServer(this.server);
    this.partyHandler.initializeVotingManager();
    this.chatHandler.setServer(this.server);
    this.npcHandler.setServer(this.server);
  }

  async handleConnection(client: GameSocket): Promise<void> {
    this.logger.log(`Client connected: ${client.id}`);
    await this.connectionHandler.handleConnection(client);
  }

  handleDisconnect(client: GameSocket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectionHandler.handleDisconnect(client);
    this.partyHandler.handleLeaveParty(client);
  }

  @SubscribeMessage('move')
  handleMove(
    @MessageBody() data: MoveCharacterDto,
    @ConnectedSocket() client: GameSocket,
  ): void {
    this.logger.log(`Move request received from client ${client.id}`);
    this.movementHandler.handleMove(data, client);
  }

  @SubscribeMessage('attackEntity')
  async handleAttackEntity(
    @MessageBody() data: { entityId: number },
    @ConnectedSocket() client: GameSocket,
  ): Promise<void> {
    this.logger.log(`Attack request received from client ${client.id}`);
    await this.combatHandler.handleAttackEntity(data, client);
  }

  @SubscribeMessage('addItem')
  async handleAddItem(
    @MessageBody() itemData: any,
    @ConnectedSocket() client: GameSocket,
  ): Promise<void> {
    this.logger.log(`Add item request received from client ${client.id}`);
    await this.inventoryHandler.handleAddItem(itemData, client);
  }

  @SubscribeMessage('equipItem')
  async handleEquipItem(
    @MessageBody() data: { fromSlotId: number; equipmentSlot: ItemType },
    @ConnectedSocket() client: GameSocket,
  ): Promise<void> {
    this.logger.log(`Equip item request received from client ${client.id}`);
    await this.inventoryHandler.handleEquipItem(data, client);
  }

  @SubscribeMessage('unequipItem')
  async handleUnequipItem(
    @MessageBody() data: { equipmentSlot: ItemType },
    @ConnectedSocket() client: GameSocket,
  ): Promise<void> {
    this.logger.log(`Unequip item request received from client ${client.id}`);
    await this.inventoryHandler.handleUnequipItem(data, client);
  }

  @SubscribeMessage('unequipItemToSlot')
  async handleUnequipItemToSlot(
    @MessageBody() data: { equipmentSlot: ItemType; targetSlotId: number },
    @ConnectedSocket() client: GameSocket,
  ): Promise<void> {
    this.logger.log(
      `Unequip item to slot request received from client ${client.id}`,
    );
    await this.inventoryHandler.handleUnequipItemToSlot(data, client);
  }

  @SubscribeMessage('moveItem')
  async handleMoveItem(
    @MessageBody() data: { fromSlotId: number; targetSlotId: number },
    @ConnectedSocket() client: GameSocket,
  ): Promise<void> {
    this.logger.log(`Move item request received from client ${client.id}`);
    await this.inventoryHandler.handleMoveItem(data, client);
  }

  @SubscribeMessage('sellItem')
  async handleSellItem(
    @MessageBody() data: { slotIndex: number },
    @ConnectedSocket() client: GameSocket,
  ): Promise<void> {
    this.logger.log(`Sell item request received from client ${client.id}`);
    await this.inventoryHandler.handleSellItem(data, client);
  }

  @SubscribeMessage('npcInteraction')
  async npcInteraction(
    @MessageBody() data: { actionId: number },
    @ConnectedSocket() client: GameSocket,
  ): Promise<void> {
    this.logger.log(
      `Npc interaction request received from client ${client.id}`,
    );
    this.npcHandler.handleNpcInteraction(client, data.actionId);
  }

  @SubscribeMessage('dismantleItem')
  async handleDismantleItem(
    @MessageBody() data: { slotIndex: number },
    @ConnectedSocket() client: GameSocket,
  ): Promise<void> {
    this.logger.log(`Dismantle item request received from client ${client.id}`);
    await this.inventoryHandler.handleDismantleItem(data, client);
  }

  @SubscribeMessage('dismantleAllItems')
  async handleDismantleAllItems(
    @MessageBody() data: { rarity: string },
    @ConnectedSocket() client: GameSocket,
  ): Promise<void> {
    this.logger.log(
      `Dismantle all items request received from client ${client.id}`,
    );
    await this.inventoryHandler.handleDismantleAllItems(data, client);
  }

  @SubscribeMessage('inviteToParty')
  handleInviteToParty(
    @MessageBody() data: { inviteeId: number },
    @ConnectedSocket() client: GameSocket,
  ): void {
    this.logger.log(`Party invite request received from client ${client.id}`);
    this.partyHandler.handleInvite(client, data.inviteeId);
  }

  @SubscribeMessage('respondToPartyInvite')
  handleRespondToPartyInvite(
    @MessageBody() data: { accepted: boolean; inviterId: number },
    @ConnectedSocket() client: GameSocket,
  ): void {
    this.logger.log(`Party invite response received from client ${client.id}`);
    this.partyHandler.handleInviteResponse(
      client,
      data.accepted,
      data.inviterId,
    );
  }

  @SubscribeMessage('leaveParty')
  handleLeaveParty(@ConnectedSocket() client: GameSocket): void {
    this.logger.log(`Leave party request received from client ${client.id}`);
    this.partyHandler.handleLeaveParty(client);
  }

  @SubscribeMessage('initiateVote')
  handleInitiateVote(
    @MessageBody() data: { type: VoteType; dungeonLevel?: number },
    @ConnectedSocket() client: GameSocket,
  ): void {
    this.logger.log(`Initiate vote request received from client ${client.id}`);
    this.partyHandler.initiateVote(client, data.type, data.dungeonLevel);
  }

  @SubscribeMessage('vote')
  handleVote(@ConnectedSocket() client: GameSocket): void {
    this.logger.log(`Vote received from client ${client.id}`);
    this.partyHandler.handleVote(client);
  }

  @SubscribeMessage('sendInstanceMessage')
  handleInstanceChatMessage(
    @ConnectedSocket() client: GameSocket,
    @MessageBody() data: { message: string },
  ): void {
    this.logger.log(`Chat message from client ${client.id}: ${data.message}`);
    this.chatHandler.handleInstanceMessage(client, data.message);
  }
}

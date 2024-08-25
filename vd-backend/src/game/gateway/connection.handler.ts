import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { BaseHandler } from './base.handler';
import { GameService } from '../game.service';
import { Game } from '../engine/game';
import {
  characterEntityToCharacterClass,
  inventoryEntityToInventoryClass,
} from '../engine/utils';
import { GameInstance } from '../class/GameInstance';

@Injectable()
export class ConnectionHandler extends BaseHandler {
  private readonly game: Game;
  private server: Server;

  constructor(private readonly gameService: GameService) {
    super();
    this.game = Game.getInstance();
  }

  public setServer(server: Server) {
    this.server = server;
  }

  async handleConnection(client: Socket): Promise<void> {
    try {
      const { token, characterId } = this.extractConnectionInfo(client);
      if (!this.validateConnectionInfo(token, characterId)) {
        throw new Error('Invalid connection info');
      }
      this.handleMultipleConnections(characterId);
      await this.setupClientConnection(client, token, characterId);
    } catch (error) {
      this.handleError(client, 'Connection error', error);
      this.disconnectClient(client);
    }
  }

  handleDisconnect(client: Socket): void {
    if (!client.data.character) return;

    const instance = this.game.disconnectCharacterFromInstance(
      client.data.character,
    );
    this.emitCharacterLeaveInstance(instance, client);
    this.gameService.syncCharacter(client.data.character);
    this.game.removeConnection(client.data.character.id);
  }

  private extractConnectionInfo(client: Socket): {
    token: string | null;
    characterId: string | null;
  } {
    const authField = client?.handshake?.auth?.token;
    const characterId = client?.handshake?.query?.characterId;
    const token = authField?.startsWith('Bearer ')
      ? authField.split(' ')[1]
      : null;
    return {
      token,
      characterId: typeof characterId === 'string' ? characterId : null,
    };
  }

  private validateConnectionInfo(
    token: string | null,
    characterId: string | null,
  ): boolean {
    return !!token && !!characterId;
  }

  private handleMultipleConnections(characterId: string): void {
    const prevSocket = this.game.getConnection(parseInt(characterId));
    if (prevSocket) {
      prevSocket.emit('error', {
        message: 'Multiple connections detected, disconnected.',
      });
      prevSocket.disconnect();
    }
  }

  private async setupClientConnection(
    client: Socket,
    token: string,
    characterId: string,
  ): Promise<void> {
    const data = await this.gameService.validateSocketConnection(
      token,
      parseInt(characterId),
    );
    client.data.user = data.user;
    client.data.character = characterEntityToCharacterClass(data.character);
    client.data.validated = true;
    this.game.addConnection(parseInt(characterId), client);
    const instance = this.game.connectCharacterToInstance(
      client.data.character,
    );
    this.emitCharacterJoinInstance(instance, client);
    await this.emitUpdatedInventoryFromDb(client);
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

  private async emitUpdatedInventoryFromDb(client: Socket): Promise<void> {
    const characterId = client.data?.character?.id;
    const inventoryEntity = await this.gameService.getInventory(characterId);
    const inventory = inventoryEntityToInventoryClass(inventoryEntity);
    client.emit('getInventory', inventory.serialize());
  }
}

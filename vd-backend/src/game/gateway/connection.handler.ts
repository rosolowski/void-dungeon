import { Injectable } from '@nestjs/common';
import { BaseHandler, GameSocket } from './base.handler';
import {
  characterEntityToCharacterClass,
  inventoryEntityToInventoryClass,
} from '../engine/utils';
import { GameInstance } from '../class/GameInstance';
import { DungeonProgressService } from '../dungeon-progress.service';
import { CharacterService } from '../character.service';
import { JwtPayloadDto } from 'src/auth/dto/jwt.dto';
import { Character as CharacterEntity } from '../entities/character.entity';
import { WsException } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ConnectionHandler extends BaseHandler {
  constructor(
    private readonly dungeonProgressService: DungeonProgressService,
    private readonly characterService: CharacterService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    super();
  }

  async handleConnection(client: GameSocket): Promise<void> {
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

  handleDisconnect(client: GameSocket): void {
    if (!client.data.character) return;

    const instance = this.game.disconnectCharacterFromInstance(
      client.data.character,
    );
    this.emitCharacterLeaveInstance(instance, client);
    this.characterService.syncCharacterToDatabase(client.data.character);
    this.game.removeConnection(client.data.character.id);
  }

  private extractConnectionInfo(client: GameSocket): {
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
    client: GameSocket,
    token: string,
    characterId: string,
  ): Promise<void> {
    const data = await this.validateSocketConnection(
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
    await this.emitDungeonProgress(client);
  }

  private async emitDungeonProgress(client: GameSocket): Promise<void> {
    const characterId = client.data?.character?.id;
    if (characterId) {
      const dungeonProgress =
        await this.dungeonProgressService.getDungeonProgress(characterId);
      if (dungeonProgress) {
        client.emit('dungeonProgressUpdate', dungeonProgress);
      }
    }
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

  private async emitUpdatedInventoryFromDb(client: GameSocket): Promise<void> {
    const characterId = client.data?.character?.id;
    const inventoryEntity =
      await this.characterService.getInventory(characterId);
    const inventory = inventoryEntityToInventoryClass(inventoryEntity);
    client.emit('getInventory', inventory.serialize());
  }

  async validateSocketConnection(
    token: string,
    characterId: number,
  ): Promise<{ user: JwtPayloadDto; character: CharacterEntity }> {
    try {
      // Decode and verify the JWT token
      const secret = this.configService.get<string>(
        'JWT_SECRET',
        'default_secret',
      );
      const payload: JwtPayloadDto = await this.jwtService.verifyAsync(token, {
        secret,
      });

      // Extract the user ID from the token's payload
      const userId = payload.id;

      // Verify whether the specified character belongs to the user
      const character = await this.characterService.getPlayerCharacter(
        userId,
        characterId,
      );
      if (!character) {
        throw new Error('Character does not belong to user');
      }

      return {
        user: payload,
        character,
      };
    } catch (e) {
      throw new WsException('Unauthorized');
    }
  }
}

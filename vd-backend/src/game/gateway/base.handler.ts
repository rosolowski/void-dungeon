import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { Character } from '../class/Character';
import { User } from '../class/User';
import { Game } from '../engine/game';

export interface GameSocket extends Socket {
  data: {
    character?: Character;
    partyId?: number;
    user?: Partial<User>;
    validated?: boolean;
  };
}

export abstract class BaseHandler {
  protected readonly game: Game;
  protected server: Server;
  protected readonly logger = new Logger(this.constructor.name);

  constructor() {
    this.game = Game.getInstance();
  }

  public setServer(server: Server) {
    this.server = server;
  }

  protected validateClient(client: GameSocket): boolean {
    if (!client.data.validated) {
      this.disconnectClient(client);
      return false;
    }
    return true;
  }

  protected disconnectClient(client: GameSocket): void {
    client.disconnect();
  }

  protected handleError(
    client: GameSocket,
    context: string,
    error: Error,
  ): void {
    this.logger.error(`${context}: ${error.message}`, error.stack);
    client.emit('error', { message: error.message });
  }

  protected emitCharacterUpdate(
    client: GameSocket,
    character: Character,
  ): void {
    const instance = this.game
      .getInstanceManager()
      .getInstanceFromCharacter(character);
    client.emit('getPlayerCharacter', character);
    this.server.to(instance.room).emit('characterUpdate', character);
  }
}

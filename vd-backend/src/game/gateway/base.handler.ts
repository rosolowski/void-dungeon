import { Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Character } from '../class/Character';
import { User } from '../class/User';

export interface GameSocket extends Socket {
  data: {
    character?: Character;
    partyId?: number;
    user?: Partial<User>;
    validated?: boolean;
  };
}

export abstract class BaseHandler {
  protected readonly logger = new Logger(this.constructor.name);

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
}

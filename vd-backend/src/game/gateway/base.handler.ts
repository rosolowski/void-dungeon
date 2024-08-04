import { Logger } from '@nestjs/common';
import { Socket } from 'socket.io';

export abstract class BaseHandler {
  protected readonly logger = new Logger(this.constructor.name);

  protected validateClient(client: Socket): boolean {
    if (!client.data.validated) {
      this.disconnectClient(client);
      return false;
    }
    return true;
  }

  protected disconnectClient(client: Socket): void {
    client.disconnect();
  }

  protected handleError(client: Socket, context: string, error: Error): void {
    this.logger.error(`${context}: ${error.message}`, error.stack);
    client.emit('error', { message: error.message });
  }
}

import { Injectable } from '@nestjs/common';
import { BaseHandler, GameSocket } from './base.handler';

interface InstanceMessage {
  from: string;
  message: string;
}

@Injectable()
export class ChatHandler extends BaseHandler {
  constructor() {
    super();
  }

  public handleInstanceMessage(socket: GameSocket, message: string) {
    const character = socket.data.character;
    if (!character) return;
    const instanceManager = this.game.getInstanceManager();
    const instance = instanceManager.getInstanceFromCharacter(character);

    const outgoingMessage = {
      from: character.name,
      message,
    } as InstanceMessage;

    socket.to(instance.room).emit('chatInstanceMessage', outgoingMessage);
  }
}

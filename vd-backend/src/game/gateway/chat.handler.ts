import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { BaseHandler, GameSocket } from './base.handler';
import { Game } from '../engine/game';

interface InstanceMessage {
  from: string;
  message: string;
}

@Injectable()
export class ChatHandler extends BaseHandler {
  private readonly game: Game;
  private server: Server;

  constructor() {
    super();
    this.game = Game.getInstance();
  }

  public setServer(server: Server) {
    this.server = server;
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

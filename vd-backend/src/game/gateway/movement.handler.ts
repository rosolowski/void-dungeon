import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { BaseHandler, GameSocket } from './base.handler';
import { Game } from '../engine/game';
import { MoveCharacterDto } from '../dto/game.dto';
import { Character } from '../class/Character';
import { GameInstance } from '../class/GameInstance';
import { Party } from '../class/Party';

@Injectable()
export class MovementHandler extends BaseHandler {
  private readonly game: Game;
  private server: Server;

  constructor() {
    super();
    this.game = Game.getInstance();
  }

  public setServer(server: Server) {
    this.server = server;
  }

  handleMove(data: MoveCharacterDto, client: GameSocket): void {
    if (!this.validateClient(client)) return;

    try {
      const { x, y } = data;
      const character = client.data.character as Character;
      const moveData = this.game.moveCharacter(x, y, character);

      if (moveData.success && moveData.actionType === 'stairs') {
        this.handleStairsMovement(character, client);
      } else {
        this.emitCharacterMove(client, moveData);
      }
    } catch (error) {
      this.handleError(client, 'Move error', error);
    }
  }

  private handleStairsMovement(character: Character, client: GameSocket): void {
    const party = this.game.getPartyFromCharacter(character);

    if (!party || party.members.length === 1) {
      this.moveCharacterToNewInstance(character, client);
    } else {
      this.initiatePartyVoting(party, client);
    }
  }

  private moveCharacterToNewInstance(
    character: Character,
    client: GameSocket,
  ): void {
    const oldInstance = this.game.disconnectCharacterFromInstance(character);
    this.emitCharacterLeaveInstance(oldInstance, client);

    const newInstance = this.game.generateNewInstance(oldInstance.depth + 1);
    const { x, y } = newInstance.location.spawnCoords;
    character.setPos(x, y);
    character.pos.instanceId = newInstance.id;

    this.game.connectCharacterToInstance(character);
    this.emitCharacterJoinInstance(newInstance, client);
  }

  private initiatePartyVoting(party: Party, client: GameSocket): void {
    if (party.voting === 'nextLevel') {
      client.emit('voteAlreadyInProgress');
      return;
    }

    party.voting = 'nextLevel';
    party.votes = [client.data.character.id];

    this.server.to(`party:${party.id}`).emit('nextLevelVoteStarted', {
      initiator: client.data.character.id,
      timeout: 10, // 10 seconds to vote
    });

    // Set a timeout to conclude the vote
    setTimeout(() => this.concludeVoting(party), 10000);
  }

  private concludeVoting(party: Party): void {
    if (party.voting !== 'nextLevel') return;

    const allVoted = party.votes.length === party.members.length;

    if (allVoted) {
      this.movePartyToNextLevel(party);
    } else {
      this.cancelVoting(party);
    }
  }

  private movePartyToNextLevel(party: Party): void {
    const character = this.game.getCharacterById(party.members[0]);
    const currentInstance = this.game
      .getInstanceManager()
      .getInstanceFromCharacter(character);
    const newInstance = this.game.generateNewInstance(
      currentInstance.depth + 1,
    );

    party.members.forEach((memberId) => {
      const character = this.game.getCharacterById(memberId);
      if (character) {
        const oldInstance =
          this.game.disconnectCharacterFromInstance(character);
        const { x, y } = newInstance.location.spawnCoords;
        character.setPos(x, y);
        character.pos.instanceId = newInstance.id;
        this.game.connectCharacterToInstance(character);

        const socket = this.game.getConnection(memberId);
        if (socket) {
          socket.leave(oldInstance.room);
          socket.join(newInstance.room);
          socket.emit('getPlayerCharacter', character);
          socket.emit('getInstance', newInstance.serialize());
        }
      }
    });

    this.server
      .to(`party:${party.id}`)
      .emit('partyMovedToNextLevel', newInstance.id);

    party.voting = null;
    party.votes = [];
  }

  private cancelVoting(party: Party): void {
    party.voting = null;
    party.votes = [];
    this.server.to(`party:${party.id}`).emit('nextLevelVoteCancelled');
  }

  public handleVoteForNextLevel(client: GameSocket): void {
    const character = client.data.character as Character;
    const party = this.game.getPartyFromCharacter(character);

    if (!party || party.voting !== 'nextLevel') {
      client.emit('invalidVote');
      return;
    }

    if (!party.votes.includes(character.id)) {
      party.votes.push(character.id);
    }

    this.server.to(`party:${party.id}`).emit('voteUpdate', {
      votes: party.votes.length,
      total: party.members.length,
    });

    if (party.votes.length === party.members.length) {
      this.concludeVoting(party);
    }
  }

  private emitCharacterMove(
    client: GameSocket,
    moveData: { success: boolean; room: string; newX: number; newY: number },
  ): void {
    const { success, room, newX, newY } = moveData;
    if (success) {
      client.to(room).emit('characterMoved', {
        characterId: client.data.character.id,
        x: newX,
        y: newY,
      });
    } else {
      client.emit('moveCorrection', { success, newX, newY });
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
}

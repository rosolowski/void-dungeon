import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { BaseHandler, GameSocket } from './base.handler';
import { Game } from '../engine/game';
import { Character } from '../class/Character';
import { PartyManager } from '../engine/party-manager';
import { Party, Voting } from '../class/Party';

type PartyInviteData = {
  inviterId: number;
  inviterName: string;
};

type PartyUpdateData = {
  id: number;
  members: number[];
  voting: Voting;
  votes: number[];
};

@Injectable()
export class PartyHandler extends BaseHandler {
  private readonly game: Game;
  private readonly partyManager: PartyManager;
  private server: Server;

  constructor() {
    super();
    this.game = Game.getInstance();
    this.partyManager = this.game.getPartyManager();
  }

  public setServer(server: Server) {
    this.server = server;
  }

  handleDisconnection(client: GameSocket): void {
    const character = this.getCharacter(client);
    if (!character) return;

    const party = this.partyManager.getPartyFromCharacter(character.id);
    if (party) {
      this.leaveParty(character.id, party);
    }
  }

  handleInvite(inviterClient: GameSocket, inviteeId: number): void {
    const inviter = this.getCharacter(inviterClient);
    if (!inviter) return;

    const inviteeClient = this.game.getConnection(inviteeId);
    if (!inviteeClient) {
      this.emitError(inviterClient, 'Invited player not found');
      return;
    }

    this.emitPartyInvite(inviteeClient, {
      inviterId: inviter.id,
      inviterName: inviter.name,
    });
  }

  handleInviteResponse(
    client: GameSocket,
    accepted: boolean,
    inviterId: number,
  ): void {
    const invitee = this.getCharacter(client);
    if (!invitee) return;

    const inviterClient = this.game.getConnection(inviterId);
    if (!inviterClient) {
      this.emitError(client, 'Inviter not found');
      return;
    }

    const inviter = this.getCharacter(inviterClient as GameSocket);
    if (!inviter) return;

    if (accepted) {
      let inviterParty = this.partyManager.getPartyFromCharacter(inviter.id);
      if (!inviterParty) {
        const newParty = this.partyManager.createParty([inviter.id]);
        this.setClientParty(client, newParty.id);
        inviterClient.join(`party:${newParty.id}`);
        inviterParty = newParty;
      }

      this.leaveCurrentParty(invitee.id);
      this.joinParty(invitee.id, inviterParty);

      this.setClientParty(client, inviterParty.id);
      client.join(`party:${inviterParty.id}`);

      this.emitPartyUpdate(inviterParty);
    } else {
      this.emitPartyInviteRejected(inviterClient as GameSocket, invitee.name);
    }
  }

  handleLeaveParty(client: GameSocket): void {
    const character = this.getCharacter(client);
    if (!character) return;

    const party = this.partyManager.getPartyFromCharacter(character.id);
    if (!party) return;

    client.leave(`party:${party.id}`);
    this.removeClientParty(client);
    this.leaveParty(character.id, party);

    if (party.members.length > 0) {
      this.emitPartyUpdate(party);
    } else {
      this.partyManager.deleteParty(party.id);
    }
  }

  handleVoteNextLevel(client: GameSocket): void {
    const character = this.getCharacter(client);
    if (!character) return;

    const party = this.partyManager.getPartyFromCharacter(character.id);
    if (!party) {
      this.moveToNextLevel([character.id]);
      return;
    }

    if (party.voting !== 'nextLevel') {
      party.voting = 'nextLevel';
      party.votes = [character.id];
    } else if (!party.votes.includes(character.id)) {
      party.votes.push(character.id);
    }

    if (party.votes.length === party.members.length) {
      this.moveToNextLevel(party.members);
      party.voting = null;
      party.votes = [];
    }

    this.emitPartyUpdate(party);
  }

  private leaveCurrentParty(characterId: number): void {
    const currentParty = this.partyManager.getPartyFromCharacter(characterId);
    if (currentParty) {
      this.leaveParty(characterId, currentParty);
    }
  }

  private leaveParty(characterId: number, party: Party): void {
    party.members = party.members.filter((id) => id !== characterId);
    party.votes = party.votes.filter((id) => id !== characterId);

    if (
      party.votes.length === party.members.length &&
      party.voting === 'nextLevel'
    ) {
      this.moveToNextLevel(party.members);
      party.voting = null;
      party.votes = [];
    }

    this.emitPartyUpdate(party);
  }

  private joinParty(characterId: number, party: Party): void {
    party.members.push(characterId);
  }

  private moveToNextLevel(characterIds: number[]): void {
    const character = this.game.getCharacterById(characterIds[0]);
    const currentInstance = this.game
      .getInstanceManager()
      .getInstanceFromCharacter(character);
    const newInstance = this.game.generateNewInstance(
      currentInstance.depth + 1,
    );

    characterIds.forEach((characterId) => {
      const character = this.game.getCharacterById(characterId);
      if (!character) return;

      const oldInstance = this.game.disconnectCharacterFromInstance(character);
      const { x, y } = newInstance.location.spawnCoords;
      character.setPos(x, y);
      character.pos.instanceId = newInstance.id;
      this.game.connectCharacterToInstance(character);

      const client = this.game.getConnection(characterId);
      if (client) {
        client.leave(oldInstance.room);
        client.join(newInstance.room);
        client.emit('getPlayerCharacter', character);
        client.emit('getInstance', newInstance.serialize());
        client.to(newInstance.room).emit('spawnCharacter', character);
      }
    });

    this.server
      .to(newInstance.room)
      .emit('partyMovedToNextLevel', newInstance.id);
  }

  private serializeParty(party: Party): PartyUpdateData {
    return {
      id: party.id,
      members: party.members,
      voting: party.voting,
      votes: party.votes,
    };
  }

  private getCharacter(client: GameSocket): Character | undefined {
    if (!client.data.character) {
      this.emitError(client, 'Character data not found');
      return undefined;
    }
    return client.data.character;
  }

  private setClientParty(client: GameSocket, partyId: number): void {
    client.data.partyId = partyId;
  }

  private removeClientParty(client: GameSocket): void {
    delete client.data.partyId;
  }

  private emitError(client: GameSocket, message: string): void {
    client.emit('partyError', message);
  }

  private emitPartyInvite(client: Socket, data: PartyInviteData): void {
    client.emit('partyInvite', data);
  }

  private emitPartyInviteRejected(
    client: GameSocket,
    inviteeName: string,
  ): void {
    client.emit('partyInviteRejected', inviteeName);
  }

  private emitPartyUpdate(party: Party): void {
    this.server
      .to(`party:${party.id}`)
      .emit('partyUpdate', this.serializeParty(party));
  }

  handleExitDungeonVote(client: GameSocket): void {
    const character = this.getCharacter(client);
    if (!character) return;

    const party = this.partyManager.getPartyFromCharacter(character.id);
    if (!party) {
      this.exitDungeon([character.id]);
      return;
    }

    if (party.voting !== 'quit') {
      party.voting = 'quit';
      party.votes = [character.id];
    } else if (!party.votes.includes(character.id)) {
      party.votes.push(character.id);
    }

    if (party.votes.length === party.members.length) {
      this.exitDungeon(party.members);
      party.voting = null;
      party.votes = [];
    }

    this.emitPartyUpdate(party);
  }

  private exitDungeon(characterIds: number[]): void {
    const cityInstance = this.game.getCityInstance();

    characterIds.forEach((characterId) => {
      const character = this.game.getCharacterById(characterId);
      if (!character) return;

      const oldInstance = this.game.disconnectCharacterFromInstance(character);
      this.game.addCharacterToCity(character);

      const client = this.game.getConnection(characterId);
      if (client) {
        client.leave(oldInstance.room);
        client.join(cityInstance.room);
        client.emit('getPlayerCharacter', character);
        client.emit('getInstance', cityInstance.serialize());
        client.to(cityInstance.room).emit('spawnCharacter', character);
      }
    });

    this.server.to(cityInstance.room).emit('partyExitedDungeon', characterIds);
  }
}

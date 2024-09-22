import { Injectable } from '@nestjs/common';
import { BaseHandler, GameSocket } from './base.handler';
import { Character } from '../class/Character';
import { PartyManager } from '../engine/party-manager';
import { Party, VoteType } from '../class/Party';
import { DungeonProgressService } from '../dungeon-progress.service';
import { VotingManager } from '../engine/voting-manager';
import { GameInstance } from '../class/GameInstance';
import { Tile } from '../engine/utils';

@Injectable()
export class PartyHandler extends BaseHandler {
  private partyManager: PartyManager;
  private votingManager: VotingManager;

  constructor(private readonly dungeonProgressService: DungeonProgressService) {
    super();
    this.partyManager = this.game.getPartyManager();
  }

  initializeVotingManager(): void {
    this.votingManager = new VotingManager(this.server);
  }

  handleInvite(inviterClient: GameSocket, inviteeId: number): void {
    const inviter = this.getCharacter(inviterClient);
    const inviteeClient = this.game.getConnection(inviteeId);

    if (!inviter || !inviteeClient) {
      this.handleError(
        inviterClient,
        'Party handler: handleInvite',
        new Error('Invited player not found'),
      );
      return;
    }

    inviteeClient.emit('partyInvite', {
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
    const inviterClient = this.game.getConnection(inviterId) as GameSocket;
    const inviter = this.getCharacter(inviterClient);

    if (!invitee || !inviter) {
      this.handleError(
        client,
        'Party handler: handleInviteResponse',
        new Error('Character data not found'),
      );
      return;
    }

    if (accepted) {
      this.addMemberToParty(invitee, inviter, client, inviterClient);
    } else {
      this.emitPartyInviteRejected(inviterClient, invitee.name);
    }
  }

  handleLeaveParty(client: GameSocket): void {
    const character = this.getCharacter(client);
    if (!character) return;

    const party = this.partyManager.getPartyFromCharacter(character.id);
    if (party) {
      client.data.partyId = undefined;
      this.removeMemberFromParty(character.id, party, client);
    }
  }

  initiateVote(
    client: GameSocket,
    voteType: VoteType,
    dungeonLevel?: number,
  ): void {
    const character = this.getCharacter(client);
    if (!character) return;

    if (
      voteType === 'nextLevel' &&
      !this.canCharacterVoteNextLevel(character)
    ) {
      return;
    }

    const party = this.partyManager.getPartyFromCharacter(character.id);
    if (!party || party.members.length === 1) {
      this.handleSoloAction(character, client, voteType, dungeonLevel);
      return;
    }

    if (party.voting !== null) {
      client.emit('voteAlreadyInProgress');
      return;
    }

    this.votingManager.initiateVoting(
      party,
      voteType,
      character.id,
      dungeonLevel,
    );
  }

  canCharacterVoteNextLevel(character: Character): boolean {
    const { x, y } = character.pos;
    const instance = this.game
      .getInstanceManager()
      .getInstanceFromCharacter(character);
    if (!instance) return false;

    const tile = instance.location.terrain[y][x];

    return tile === Tile.STAIRS;
  }

  handleVote(client: GameSocket): void {
    const character = this.getCharacter(client);
    if (!character) return;

    const party = this.partyManager.getPartyFromCharacter(character.id);
    if (!party || party.voting === null) {
      client.emit('invalidVote');
      return;
    }

    const votingType = party.voting;
    const votingData = { ...party.votingData };

    console.log('handleVote votingData', votingData);

    const vote = this.votingManager.vote(party, character.id);

    console.log('handleVote vote', vote);

    if (vote.success && vote.finished) {
      const dungeonLevel = votingData?.level ?? null;
      this.handlePartyAction(party, votingType, dungeonLevel);
    }
  }

  private handleSoloAction(
    character: Character,
    client: GameSocket,
    actionType: VoteType,
    dungeonLevel?: number,
  ): void {
    switch (actionType) {
      case 'enterDungeon':
        if (dungeonLevel !== undefined) {
          this.enterDungeonSolo(character, client, dungeonLevel);
        }
        break;
      case 'nextLevel':
        this.moveToNextLevel([character.id]);
        break;
      case 'exitDungeon':
        this.exitDungeon([character.id]);
        break;
    }
  }

  private handlePartyAction(
    party: Party,
    actionType: VoteType,
    dungeonLevel?: number,
  ): void {
    console.log(
      'party.handler.ts : handlePartyAction : actionType',
      actionType,
    );
    console.log(
      'party.handler.ts : handlePartyAction : dungeonLevel',
      dungeonLevel,
    );
    switch (actionType) {
      case 'enterDungeon':
        if (dungeonLevel !== undefined) {
          this.enterDungeonParty(party.members, dungeonLevel);
        }
        break;
      case 'nextLevel':
        this.moveToNextLevel(party.members);
        break;
      case 'exitDungeon':
        this.exitDungeon(party.members);
        break;
    }
  }

  private addMemberToParty(
    invitee: Character,
    inviter: Character,
    inviteeClient: GameSocket,
    inviterClient: GameSocket,
  ): void {
    let party = this.partyManager.getPartyFromCharacter(inviter.id);
    if (!party) {
      party = this.partyManager.createParty([inviter.id]);
      inviterClient.join(`party:${party.id}`);
      inviterClient.data.partyId = party.id;
      console.log(`Created new party ${party.id} for inviter ${inviter.id}`);
    }

    if (party.members.includes(invitee.id)) {
      console.log(`Invitee ${invitee.id} already in party ${party.id}`);
      return;
    }
    party.members.push(invitee.id);

    inviteeClient.data.partyId = party.id;
    inviteeClient.join(`party:${party.id}`);

    console.log(`Added invitee ${invitee.id} to party ${party.id}`);
    console.log('Updated party members:', party.members);

    this.emitPartyUpdate(party);
  }

  private removeMemberFromParty(
    characterId: number,
    party: Party,
    client: GameSocket,
  ): void {
    console.log('Removing member from party:', characterId, party.id);
    client.leave(`party:${party.id}`);
    delete client.data.partyId;

    party.members = party.members.filter((id) => id !== characterId);
    party.votes = party.votes.filter((id) => id !== characterId);

    if (party.members.length === 1) {
      const lastMemberId = party.members[0];
      const lastMemberClient = this.game.getConnection(lastMemberId);
      if (lastMemberClient) {
        this.removeMemberFromParty(lastMemberId, party, lastMemberClient);
      }
    } else if (party.members.length > 0) {
      this.emitPartyUpdate(party);
    } else {
      this.partyManager.deleteParty(party.id);
    }

    client.emit('leftParty');
  }

  private async moveToNextLevel(characterIds: number[]): Promise<void> {
    const firstCharacter = this.game.getCharacterById(characterIds[0]);
    const oldInstance = this.game
      .getInstanceManager()
      .getInstanceFromCharacter(firstCharacter);
    const newInstance = this.game.generateNewInstance(oldInstance.depth + 1);

    const transitionPromises = characterIds.map(async (characterId) => {
      const character = this.game.getCharacterById(characterId);
      if (!character) return;

      this.game.disconnectCharacterFromInstance(character);
      const { x, y } = newInstance.location.spawnCoords;
      character.setPos(x, y);
      character.pos.instanceId = newInstance.id;
      this.game.connectCharacterToInstance(character);

      const socket = this.game.getConnection(characterId);
      if (socket) {
        const updatedProgress =
          await this.dungeonProgressService.updateMaxReachedLevel(
            character.id,
            newInstance.depth,
          );
        if (updatedProgress) {
          socket.emit('dungeonProgressUpdate', updatedProgress);
        }
        socket.leave(oldInstance.room);
        socket.join(newInstance.room);
        socket.emit('getPlayerCharacter', character);
        socket.emit('getInstance', newInstance.serialize());
      }
    });

    await Promise.all(transitionPromises);

    this.server
      .to(newInstance.room)
      .emit('getInstance', newInstance.serialize());

    this.game.getInstanceManager().disposeInstance(oldInstance.id);
  }

  private async enterDungeonSolo(
    character: Character,
    client: GameSocket,
    level: number,
  ): Promise<void> {
    const dungeonProgress =
      await this.dungeonProgressService.getDungeonProgress(character.id);

    if (!dungeonProgress) {
      this.handleError(
        client,
        'Party handler: enterDungeonSolo',
        new Error('No dungeon progress found for character'),
      );
      return;
    }

    const maxReachedLevel = dungeonProgress.maxReachedLevel;

    if (level > maxReachedLevel) {
      this.handleError(
        client,
        'Party handler: enterDungeonSolo',
        new Error('Cannot enter a level higher than your max reached level'),
      );

      return;
    }

    const oldInstance = this.game.disconnectCharacterFromInstance(character);
    this.emitCharacterLeaveInstance(oldInstance, client);

    const newInstance = this.game.generateNewInstance(level);
    const { x, y } = newInstance.location.spawnCoords;
    character.setPos(x, y);
    character.pos.instanceId = newInstance.id;

    const updatedProgress =
      await this.dungeonProgressService.updateMaxReachedLevel(
        character.id,
        level,
      );
    if (updatedProgress) {
      client.emit('dungeonProgressUpdate', updatedProgress);
    }

    const skillManager = this.game.getSkillManager();
    const newSkill = skillManager.distributeSkillOnNewFloor(character);

    if (newSkill) {
      client.emit('newSkillAcquired', newSkill.id);
    }

    this.game.connectCharacterToInstance(character);
    this.emitCharacterJoinInstance(newInstance, client);
  }

  private async enterDungeonParty(
    characterIds: number[],
    level: number,
  ): Promise<void> {
    console.log('entering party', characterIds, level);
    const newInstance = this.game.generateNewInstance(level);

    for (const characterId of characterIds) {
      const character = this.game.getCharacterById(characterId);
      if (!character) continue;

      const oldInstance = this.game.disconnectCharacterFromInstance(character);
      const { x, y } = newInstance.location.spawnCoords;
      character.setPos(x, y);
      character.pos.instanceId = newInstance.id;
      this.game.connectCharacterToInstance(character);

      const socket = this.game.getConnection(characterId);
      if (socket) {
        this.emitCharacterJoinInstance(newInstance, socket);
        const updatedProgress =
          await this.dungeonProgressService.updateMaxReachedLevel(
            character.id,
            newInstance.depth,
          );
        if (updatedProgress) {
          socket.emit('dungeonProgressUpdate', updatedProgress);
        }

        const skillManager = this.game.getSkillManager();
        const newSkill = skillManager.distributeSkillOnNewFloor(character);

        if (newSkill) {
          socket.emit('newSkillAcquired', newSkill.id);
        }

        socket.leave(oldInstance.room);
        socket.join(newInstance.room);
        socket.emit('getPlayerCharacter', character);
        socket.emit('getInstance', newInstance.serialize());
      }
    }
  }

  private exitDungeon(characterIds: number[]): void {
    const cityInstance = this.game.getCityInstance();
    let oldInstance: GameInstance;

    for (const characterId of characterIds) {
      const character = this.game.getCharacterById(characterId);
      if (!character) continue;

      oldInstance = this.game.disconnectCharacterFromInstance(character);
      this.game.addCharacterToCity(character);

      const client = this.game.getConnection(characterId);
      if (client) {
        client.leave(oldInstance.room);
        client.join(cityInstance.room);
        client.emit('getPlayerCharacter', character);
        client.emit('getInstance', cityInstance.serialize());
        client.to(cityInstance.room).emit('spawnCharacter', character);
      }
    }

    this.server.to(cityInstance.room).emit('partyExitedDungeon', characterIds);

    this.game.getInstanceManager().disposeInstance(oldInstance.id);
  }

  private getCharacter(client: GameSocket): Character | undefined {
    if (!client.data.character) {
      this.handleError(
        client,
        'Character data not found',
        new Error('Character data not found'),
      );

      return undefined;
    }
    return client.data.character;
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

  private serializeParty(party: Party): any {
    return {
      id: party.id,
      members: party.members,
      voting: party.voting,
      votes: party.votes,
      votingLevel:
        party.votingData && party.votingData.level
          ? party.votingData.level
          : null,
    };
  }
}

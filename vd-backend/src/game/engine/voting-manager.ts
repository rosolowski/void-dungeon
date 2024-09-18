import { Server } from 'socket.io';
import { Party, VoteType } from '../class/Party';

const VOTING_TIMEOUT = 15; // 15 seconds

export class VotingManager {
  constructor(private server: Server) {}

  initiateVoting(
    party: Party,
    voteType: VoteType,
    initiatorId: number,
    dungeonLevel?: number,
  ): void {
    party.voting = voteType;
    party.votes = [initiatorId];
    party.votingData =
      voteType === 'enterDungeon' ? { level: dungeonLevel } : null;

    console.log('initiating voting', party);

    this.server.to(`party:${party.id}`).emit('voteStarted', {
      voteType,
      initiator: initiatorId,
      dungeonLevel,
      timeout: VOTING_TIMEOUT,
    });

    setTimeout(() => this.concludeVoting(party), VOTING_TIMEOUT * 1000);
  }

  vote(
    party: Party,
    characterId: number,
  ): { success: boolean; finished: boolean } {
    if (!party.votes.includes(characterId)) {
      party.votes.push(characterId);
    }

    const allVoted = party.votes.length === party.members.length;
    this.server.to(`party:${party.id}`).emit('voteUpdate', {
      votes: party.votes,
      total: party.members.length,
    });

    if (allVoted) {
      this.concludeVoting(party);
      return { success: true, finished: true };
    }

    return { success: false, finished: false };
  }

  private concludeVoting(party: Party) {
    if (party.voting === null) return;

    const allVoted = party.votes.length === party.members.length;

    if (allVoted) {
      this.server.to(`party:${party.id}`).emit('voteSucceeded', {
        voteType: party.voting,
        votingData: party.votingData,
      });
    } else {
      this.cancelVoting(party);
    }

    party.voting = null;
    party.votes = [];
    party.votingData = null;
  }

  private cancelVoting(party: Party): void {
    this.server.to(`party:${party.id}`).emit('voteCancelled', {
      voteType: party.voting,
    });
  }
}

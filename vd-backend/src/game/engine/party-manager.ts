import { Party } from '../class/Party';

export class PartyManager {
  private parties = new Map<number, Party>();
  private nextFreeParty: number = 1;

  constructor() {}

  createParty(members: number[]): Party {
    const party = new Party(this.nextFreeParty++, members);
    this.parties.set(party.id, party);
    return party;
  }

  deleteParty(id: number) {
    console.log('deleting party', id);
    this.parties.delete(id);
  }

  getParty(id: number): Party | undefined {
    return this.parties.get(id);
  }

  getPartyFromCharacter(characterId: number): Party | undefined {
    console.log(`Searching for party for character ${characterId}`);
    console.log(`Current parties:`, Array.from(this.parties.entries()));
    for (const [partyId, party] of this.parties) {
      console.log(`Checking party ${partyId}:`, party);
      if (party.members.includes(characterId)) {
        console.log(`Found party ${partyId} for character ${characterId}`);
        return party;
      }
    }
    console.log(`No party found for character ${characterId}`);
    return undefined;
  }
}

import { Party } from '../class/Party';

export class PartyManager {
  private parties = new Map<number, Party>();
  private nextFreeParty: number = 1;

  constructor() {}

  createParty(members: number[]): Party {
    const party = new Party(this.nextFreeParty++, members, null, []);
    this.parties.set(party.id, party);
    return party;
  }

  deleteParty(id: number) {
    this.parties.delete(id);
  }

  getParty(id: number) {
    return this.parties.get(id);
  }

  getPartyFromCharacter(characterId: number): Party | undefined {
    for (const party of this.parties.values()) {
      if (party.members.includes(characterId)) {
        return party;
      }
    }
    return undefined;
  }
}

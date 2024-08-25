import { writable, derived } from 'svelte/store';
import type { Writable, Readable } from 'svelte/store';

export type Voting = null | 'nextLevel' | 'quit';

export interface PartyMember {
	id: number;
	name: string;
}

export interface PartyState {
	id: number | null;
	members: PartyMember[];
	voting: Voting;
	votes: number[];
}

const initialPartyState: PartyState = {
	id: null,
	members: [],
	voting: null,
	votes: []
};

function createPartyStore() {
	const { subscribe, set, update }: Writable<PartyState> = writable(initialPartyState);

	return {
		subscribe,
		setParty: (partyData: PartyState) => set(partyData),
		addMember: (member: PartyMember) =>
			update((state) => ({
				...state,
				members: [...state.members, member]
			})),
		removeMember: (memberId: number) =>
			update((state) => ({
				...state,
				members: state.members.filter((m) => m.id !== memberId)
			})),
		startVoting: (votingType: Voting) =>
			update((state) => ({
				...state,
				voting: votingType,
				votes: []
			})),
		addVote: (memberId: number) =>
			update((state) => ({
				...state,
				votes: [...state.votes, memberId]
			})),
		endVoting: () =>
			update((state) => ({
				...state,
				voting: null,
				votes: []
			})),
		reset: () => set(initialPartyState)
	};
}

export const party = createPartyStore();

export const isInParty: Readable<boolean> = derived(party, ($party) => $party.id !== null);
export const partySize: Readable<number> = derived(party, ($party) => $party.members.length);
export const isVoting: Readable<boolean> = derived(party, ($party) => $party.voting !== null);
export const voteProgress: Readable<{ current: number; total: number }> = derived(
	party,
	($party) => ({ current: $party.votes.length, total: $party.members.length })
);

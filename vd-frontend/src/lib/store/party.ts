import { writable, derived } from 'svelte/store';
import type { Writable, Readable } from 'svelte/store';

export type VoteType = 'nextLevel' | 'exitDungeon' | 'enterDungeon';

export interface PartyMember {
	id: number;
	name: string;
}

export interface PartyState {
	id: number | null;
	members: PartyMember[];
	voting: VoteType | null;
	votes: number[];
	votingLevel: number | null;
}

const initialPartyState: PartyState = {
	id: null,
	members: [],
	voting: null,
	votes: [],
	votingLevel: null
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
		startVoting: (votingType: VoteType, level?: number) =>
			update((state) => ({
				...state,
				voting: votingType,
				votes: [],
				votingLevel: votingType === 'enterDungeon' ? level || null : null
			})),
		updateVotes: (votes: number[]) =>
			update((state) => ({
				...state,
				votes
			})),
		endVoting: () =>
			update((state) => ({
				...state,
				voting: null,
				votes: [],
				votingLevel: null
			})),
		leaveParty: () => set(initialPartyState),
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

function createTimedStore(initialValue: boolean) {
	const { subscribe, set }: Writable<boolean> = writable(initialValue);

	return {
		subscribe,
		show: () => {
			set(true);
			setTimeout(() => set(false), 5000);
		},
		hide: () => set(false)
	};
}

export const showVoteSuccess = createTimedStore(false);
export const showVoteFail = createTimedStore(false);

function createTimerStore(initialTime: number | null) {
	const { subscribe, set, update } = writable<number | null>(initialTime);
	let interval: number;

	return {
		subscribe,
		start: () => {
			set(initialTime);
			if (interval) clearInterval(interval);
			interval = setInterval(() => {
				update((time) => {
					if (time === null || time <= 0) {
						clearInterval(interval);
						return 0;
					}
					return time - 1;
				});
			}, 1000);
		},
		stop: () => {
			clearInterval(interval);
			set(null);
		},
		reset: (time: number) => {
			clearInterval(interval);
			set(time);
			interval = setInterval(() => {
				update((time) => {
					if (time === null || time <= 0) {
						clearInterval(interval);
						return 0;
					}
					return time - 1;
				});
			}, 1000);
		}
	};
}

export const votingTimer = createTimerStore(15);

export const startVotingTimer = () => {
	votingTimer.start();
};

export const stopVotingTimer = () => {
	votingTimer.stop();
};

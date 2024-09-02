import { writable } from 'svelte/store';

export interface Message {
	from: string;
	message: string;
	timestamp: number;
}

interface ChatStore {
	messages: Message[];
	isActive: boolean;
}

function createChatStore() {
	const { subscribe, update, set } = writable<ChatStore>({
		messages: [],
		isActive: false
	});

	return {
		subscribe,
		set,
		addMessage: (message: Omit<Message, 'timestamp'>) =>
			update((store) => ({
				...store,
				messages: [...store.messages, { ...message, timestamp: Date.now() }]
			})),
		clear: () => update((store) => ({ ...store, messages: [] })),
		setActive: (active: boolean) => update((store) => ({ ...store, isActive: active }))
	};
}

export const chat = createChatStore();

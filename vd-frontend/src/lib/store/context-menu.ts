import { writable } from 'svelte/store';

export interface ContextMenuOption {
	label: string;
	action: () => void;
}

interface ContextMenuState {
	isOpen: boolean;
	x: number;
	y: number;
	options: ContextMenuOption[];
}

function createContextMenu() {
	const { subscribe, set, update } = writable<ContextMenuState>({
		isOpen: false,
		x: 0,
		y: 0,
		options: []
	});

	return {
		subscribe,
		open: (x: number, y: number, options: ContextMenuOption[]) =>
			set({ isOpen: true, x, y, options }),
		close: () => update((state) => ({ ...state, isOpen: false }))
	};
}

export const contextMenu = createContextMenu();

import type { Item } from '$lib/class/Item';
import { writable } from 'svelte/store';

export interface DragState {
	isDragging: boolean;
	item: Item | null;
	sourceType: 'inventory' | 'equipment' | 'merchant' | null;
	sourceIndex: number;
}

export const itemDrag = writable<DragState>({
	isDragging: false,
	item: null,
	sourceType: null,
	sourceIndex: -1
});

export function clearDrag() {
	itemDrag.set({
		isDragging: false,
		item: null,
		sourceType: null,
		sourceIndex: -1
	});
}

function handleMouseUp() {
	clearDrag();
	window.removeEventListener('mouseup', handleMouseUp);
}

export function startDrag(item: Item, sourceType: 'inventory' | 'equipment' | 'merchant', sourceIndex: number) {
	itemDrag.set({
		isDragging: true,
		item,
		sourceType,
		sourceIndex
	});
	window.addEventListener('mouseup', handleMouseUp);
}

import { writable } from 'svelte/store';

type Renderer = {
	tileSize: number;
};

function createRenderer() {
	const { subscribe, update } = writable<Renderer>({ tileSize: 96 });

	return {
		subscribe,
		zoomIn: () =>
			update((r) => {
				const newTileSize = Math.min(r.tileSize + 8, 256);

				return { ...r, tileSize: newTileSize };
			}),
		zoomOut: () =>
			update((r) => {
				const newTileSize = Math.max(r.tileSize - 8, 32);

				return { ...r, tileSize: newTileSize };
			})
	};
}

export const renderer = createRenderer();

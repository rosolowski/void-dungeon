import { writable } from 'svelte/store';

interface WindowData {
	id: string;
	title: string,
	component: any;
	props: Record<string, any>;
	zIndex: number;
}

function createWindowsStore() {
	const { subscribe, update } = writable<WindowData[]>([]);

	let highestZIndex = 1000;

	return {
		subscribe,
		openWindow: (windowData: Omit<WindowData, 'zIndex'>) => {
			update((windows) => {
				const windowExists = windows.some((w) => w.id === windowData.id);
				if (windowExists) {
					return windows;
				}

				highestZIndex++;
				return [...windows, { ...windowData, zIndex: highestZIndex }];
			});
		},
		closeWindow: (id: string) => {
			update((windows) => windows.filter((w) => w.id !== id));
		},
		bringToFront: (id: string) => {
			update((windows) => {
				highestZIndex++;
				return windows.map((window) => ({
					...window,
					zIndex: window.id === id ? highestZIndex : window.zIndex
				}));
			});
		}
	};
}

export const windows = createWindowsStore();

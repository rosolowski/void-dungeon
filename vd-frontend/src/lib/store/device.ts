import { readable } from 'svelte/store';

const isBrowser = typeof window !== 'undefined';

const isTouchDevice = () => {
	return isBrowser && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
};

const isMobileDevice = () => {
	return false;
	// return (isBrowser && window.innerWidth <= 768) || isTouchDevice();
};

export const device = readable(
	{
		isMobile: isBrowser ? isMobileDevice() : false,
		isTouchScreen: isBrowser ? isTouchDevice() : false
	},
	(set) => {
		if (!isBrowser) {
			return;
		}

		const updateDeviceInfo = () => {
			set({ isMobile: isMobileDevice(), isTouchScreen: isTouchDevice() });
		};

		window.addEventListener('resize', updateDeviceInfo);
		window.addEventListener('orientationchange', updateDeviceInfo);

		return () => {
			window.removeEventListener('resize', updateDeviceInfo);
			window.removeEventListener('orientationchange', updateDeviceInfo);
		};
	}
);

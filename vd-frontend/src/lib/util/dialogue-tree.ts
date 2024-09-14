import { requestHealPlayer } from '$lib/api/services/game.service';
import MerchantWindow from '$lib/components/windows/MerchantWindow.svelte';
import type { DialogueLine } from '$lib/store/dialogue';
import { windows } from '$lib/store/windows';

function openMerchantWindow() {
	windows.openWindow({
		id: 'merchantWindow',
		title: 'The Merchant',
		component: MerchantWindow,
		props: {}
	});
}

function openDoctorWindow() {}

function healPlayer() {
	requestHealPlayer();
}

export const dialogueTree: Record<number, DialogueLine> = {
	// Merchant
	0: {
		text: 'Merchant: Welcome to my shop, what do you want to do?',
		options: [
			{ text: 'Trade', nextId: 1 },
			{ text: 'Leave', nextId: null }
		]
	},
	1: {
		text: 'Merchant: Sure thing, take a look at my wares!',
		options: [{ text: 'Ok', nextId: null, action: openMerchantWindow }]
	},
	// Doctor
	100: {
		text: 'Doctor: What do you need?',
		options: [
			{ text: 'Heal me', nextId: 101 },
			{ text: 'I want to but potions', nextId: 103 },
			{ text: 'Leave', nextId: null }
		]
	},
	101: {
		text: 'Doctor: This will hurt...',
		options: [{ text: 'Ok', nextId: 102, action: healPlayer }]
	},
	102: {
		text: 'Doctor: You should feel better now.',
		options: [{ text: 'Thanks', nextId: 100 }]
	},
	103: {
		text: 'Doctor: Take a look, you will need these.',
		options: [{ text: 'Thanks', nextId: null, action: openDoctorWindow }]
	}
};

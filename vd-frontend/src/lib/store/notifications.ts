import { writable } from 'svelte/store';
import type { Item } from '$lib/class/Item';
import type { Skill } from '$lib/class/Skill';

export type NotificationType = 'item' | 'gold' | 'shards' | 'skill';

export interface Notification {
	id: number;
	type: NotificationType;
	content: string | Item | Skill;
}

function createNotificationsStore() {
	const { subscribe, update } = writable<Notification[]>([]);
	let notificationId = 0;

	function addNotification(notification: Omit<Notification, 'id'>) {
		update((n) => {
			const newNotification = { ...notification, id: notificationId++ };
			setTimeout(() => removeNotification(newNotification.id), 10000);
			return [...n, newNotification];
		});
	}

	function removeNotification(id: number) {
		update((n) => n.filter((notification) => notification.id !== id));
	}

	return {
		subscribe,
		notifyItemDropped: (item: Item) => {
			addNotification({
				type: 'item',
				content: item
			});
		},
		notifyGoldLooted: (amount: number) => {
			addNotification({
				type: 'gold',
				content: `${amount} gold looted`
			});
		},
		notifyShardsLooted: (amount: number) => {
			addNotification({
				type: 'shards',
				content: `${amount} shards looted`
			});
		},
		notifySkillAcquired: (skill: Skill) => {
			addNotification({
				type: 'skill',
				content: skill
			});
		}
	};
}

export const notifications = createNotificationsStore();

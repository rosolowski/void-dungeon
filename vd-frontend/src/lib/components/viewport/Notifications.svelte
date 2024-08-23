<script lang="ts">
	import { notifications } from '$lib/store/notifications';
	import gold from '../../assets/items/currency/gold.png';
	import shards from '../../assets/items/currency/shards.png';
	import { getItemImage } from '$lib/assets/items';
	import type { Item } from '$lib/class/Item';
	import type { NotificationType } from '$lib/store/notifications';
	import { onMount } from 'svelte';

	$: rarityGradients = {
		common: 'linear-gradient(90deg, var(--rarityCommon), transparent)',
		uncommon: 'linear-gradient(90deg, var(--rarityUncommon), transparent)',
		rare: 'linear-gradient(90deg, var(--rarityRare), transparent)',
		epic: 'linear-gradient(90deg, var(--rarityEpic), transparent)',
		legendary: 'linear-gradient(90deg, var(--rarityLegendary), transparent)'
	};

	function getNotificationBackground(type: NotificationType, content: string | Item): string {
		if (type === 'item' && typeof content !== 'string') {
			return rarityGradients[content.rarity];
		}
		return 'var(--background-transparency)';
	}

	function isItem(content: string | Item): content is Item {
		return typeof content !== 'string';
	}

	onMount(() => {
		const container = document.querySelector('.notifications-container');
		if (container) {
			container.addEventListener('animationend', (event) => {
				if (event.target instanceof HTMLElement) {
					event.target.remove();
				}
			});
		}
	});
</script>

<div class="notifications-container">
	{#each $notifications as notification (notification.id)}
		<div
			class="notification"
			style:background={getNotificationBackground(notification.type, notification.content)}
		>
			<span class="notification-content">
				{#if notification.type === 'item' && isItem(notification.content)}
					<img
						src={getItemImage(
							notification.content.type,
							notification.content.rarity,
							notification.content.id
						)}
						alt={notification.content.name}
						class="item-icon"
					/>
					{notification.content.name} ({notification.content.type})
				{:else if notification.type === 'gold'}
					<img src={gold} alt="gold" width="16" height="16" />
					{notification.content}
				{:else if notification.type === 'shards'}
					<img src={shards} alt="shards" width="16" height="16" />
					{notification.content}
				{/if}
			</span>
		</div>
	{/each}
</div>

<style lang="scss">
	.notifications-container {
		position: absolute;
		bottom: 20px;
		left: 0px;
		display: flex;
		flex-direction: column-reverse;
		align-items: flex-start;
		gap: 10px;
		z-index: var(--zi-game-hud);
	}

	.notification {
		position: absolute;
		width: max-content;
		left: 0;
		bottom: 0;
		padding: 10px 15px;
		border-radius: 0px;
		color: var(--primary);
		font-size: 14px;
		max-width: 45vw;
		backdrop-filter: blur(5px);
		opacity: 0;
		transform: translateX(-100px);
		animation: notificationAnimation 10s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
	}

	@keyframes notificationAnimation {
		0% {
			opacity: 0;
			transform: translateX(-100px) translateY(0);
		}
		1% {
			opacity: 1;
			transform: translateX(0) translateY(0);
		}
		100% {
			opacity: 0;
			transform: translateX(0) translateY(-300px);
		}
	}

	.notification-content {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	img {
		image-rendering: pixelated;
	}

	.item-icon {
		width: 16px;
		height: 16px;
	}
</style>

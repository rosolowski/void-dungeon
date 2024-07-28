<script lang="ts">
	import { itemImages } from '$lib/assets/items';
	import type { Item } from '$lib/class/Item';
	import Tooltip from '../tooltips/Tooltip.svelte';

	export let item: Item;

	$: itemImageIndex = item.id % itemImages.length;

	function formatStatName(stat: string): string {
		return stat.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
	}

	function getStatColor(statName: string): string {
		const damageStats = [
			'damage',
			'poisonDamage',
			'fireDamage',
			'coldDamage',
			'lightDamage',
			'voidDamage'
		];
		const defenseStats = ['armor', 'evasion'];

		if (damageStats.some((s) => statName.toLowerCase().includes(s))) return '#ff4136';
		if (defenseStats.some((s) => statName.toLowerCase().includes(s))) return '#2ecc40';
		if (statName.toLowerCase().includes('crit')) return '#ff851b';
		if (statName.toLowerCase().includes('chance')) return '#b10dc9';
		return '#ffffff';
	}

	function getItemRarity(item: Item): string {
		return item.rarity;
	}

	function getTooltipContent(item: Item): string {
		let content = `<div class="item-name">${item.name}</div>`;
		content += `<div class="item-type">${item.type}</div>`;
		content += `<div class="item-description">"${item.description}"</div>`;
		content += '<div class="item-stats">';

		for (const [key, value] of Object.entries(item.stats)) {
			if (value !== undefined && value !== null && value !== 0 && key !== 'hp' && key !== 'mana') {
				const statName = formatStatName(key);
				const statColor = getStatColor(key);
				content += `<div class="stat" style="color: ${statColor};">${statName}: ${value}</div>`;
			}
		}

		content += '</div>';
		return content;
	}
</script>

<Tooltip content={getTooltipContent(item)} borderClass={getItemRarity(item)}>
	<div class="item">
		<img src={itemImages[itemImageIndex]} alt={item.name} />
	</div>
</Tooltip>

<style lang="scss">
	.item {
		height: 100%;
		width: 100%;
		cursor: pointer;

		img {
			height: 100%;
			width: 100%;
			-webkit-user-drag: none;
			user-select: none;
			image-rendering: pixelated;
		}
	}

	:global(.item-name) {
		font-size: 18px;
		font-weight: bold;
		margin-bottom: 5px;
	}

	:global(.item-type) {
		font-size: 14px;
		font-style: italic;
		color: #888;
		margin-bottom: 10px;
	}

	:global(.item-description) {
		font-size: 14px;
		color: #a3a3a3;
		margin-bottom: 10px;
	}

	:global(.item-stats) {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 5px;
	}

	:global(.stat) {
		font-size: 12px;
	}
</style>

<script lang="ts">
	import type { Item, ItemRarity, ItemType } from '$lib/class/Item';
	import Tooltip from './Tooltip.svelte';
	import { player } from '$lib/store/player';
	import { get } from 'svelte/store';
	import type { Stats } from '$lib/class/Stats';
	import { inventory } from '$lib/store/inventory';
	import type { Equipment } from '$lib/class/Equipment';

	export let item: Item;

	function formatStatName(stat: string): string {
		return stat.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
	}

	function getStatColor(statName: string): string {
		const keywordColors: Record<string, string> = {
			poison: 'var(--poison)',
			fire: 'var(--fire)',
			cold: 'var(--cold)',
			light: 'var(--light)',
			void: 'var(--void)',
			hp: 'var(--hpLight)',
			mana: 'var(--manaLight)'
		};
		const damageStats = [
			'damage',
			'poisonDamage',
			'fireDamage',
			'coldDamage',
			'lightDamage',
			'voidDamage'
		];

		for (const [element, color] of Object.entries(keywordColors)) {
			if (statName.toLowerCase().includes(element)) {
				return color;
			}
		}

		if (damageStats.some((s) => statName.toLowerCase().includes(s))) return '#ff4136';
		if (statName.toLowerCase().includes('crit')) return '#ff851b';
		if (statName.toLowerCase().includes('chance')) return '#b10dc9';

		return 'var(--secondary)';
	}

	function calculateItemPrice(item: Item): number {
		let basePrice = 10;

		const rarityMultiplier = {
			common: 1,
			uncommon: 2,
			rare: 5,
			epic: 10,
			legendary: 25
		};

		basePrice *= rarityMultiplier[item.rarity];

		const stats = item.stats;
		basePrice += stats.hp + stats.maxHp + stats.mana + stats.maxMana;
		basePrice += stats.armor * 5 + stats.evasion * 5;
		basePrice += stats.damage * 10;
		basePrice += (stats.attackSpeed - 1) * 50;
		basePrice += (stats.critMultiplier - 1) * 100 + stats.critChance * 20;
		basePrice +=
			stats.poisonDamage +
			stats.fireDamage +
			stats.coldDamage +
			stats.lightDamage +
			stats.voidDamage;
		basePrice +=
			(stats.poisonChance +
				stats.fireChance +
				stats.coldChance +
				stats.lightChance +
				stats.voidChance) *
			10;
		basePrice +=
			(stats.poisonStatus +
				stats.fireStatus +
				stats.coldStatus +
				stats.lightStatus +
				stats.voidStatus) *
			5;
		basePrice +=
			stats.extraCurrencyChance * 50 + stats.extraDropChance * 50 + stats.dropRarityBoost * 100;

		return Math.round(basePrice);
	}

	function getRarityColor(rarity: ItemRarity): string {
		const rarityColors: Record<ItemRarity, string> = {
			common: 'var(--rarityCommon)',
			uncommon: 'var(--rarityUncommon)',
			rare: 'var(--rarityRare)',
			epic: 'var(--rarityEpic)',
			legendary: 'var(--rarityLegendary)'
		};
		return rarityColors[rarity];
	}

	function getComparisonStats(item: Item, equippedItem: Item | null): Partial<Stats> {
		if (!equippedItem) return {};

		const comparisonStats: Partial<Stats> = {};
		(Object.keys(item.stats) as Array<keyof Stats>).forEach((key) => {
			if (typeof item.stats[key] === 'number' && typeof equippedItem.stats[key] === 'number') {
				comparisonStats[key] = item.stats[key] - equippedItem.stats[key];
			}
		});
		return comparisonStats;
	}

	function formatComparison(value: number): string {
		if (value > 0) return `<span style="color: green;">(+${value})</span>`;
		if (value < 0) return `<span style="color: red;">(${value})</span>`;
		return '';
	}

	function getTooltipContent(item: Item): string {
		const rarityColor = getRarityColor(item.rarity);
		const playerInventory = get(inventory);
		const equippedItem = playerInventory
			? playerInventory.equipment[item.type as keyof Equipment]
			: null;
		const comparisonStats = getComparisonStats(item, equippedItem);

		let content = `
			<div class="item-name" style="color: var(--primary);">${item.name}</div>
			<div class="item-rarity" style="color: ${rarityColor};">${item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}</div>
			<div class="item-type">${item.type}</div>
			<div class="item-description">"${item.description}"</div>
			<div class="item-stats">
		`;

		(Object.keys(item.stats) as Array<keyof Stats>).forEach((key) => {
			const value = item.stats[key];
			if (value !== undefined && value !== null && value !== 0 && key !== 'hp' && key !== 'mana') {
				const statName = formatStatName(key);
				const statColor = getStatColor(key);
				const comparisonValue = comparisonStats[key];
				const comparisonText =
					comparisonValue !== undefined ? formatComparison(comparisonValue) : '';
				content += `<div class="stat" style="color: ${statColor};">${statName}: ${value} ${comparisonText}</div>`;
			}
		});

		content += `
			</div>
			<p class="item-price">${calculateItemPrice(item)} GOLD</p>
		`;

		return content;
	}
</script>

<Tooltip content={getTooltipContent(item)} borderClass={item.rarity}>
	<slot />
</Tooltip>

<style lang="scss">
	:global(.item-name) {
		font-size: 18px;
		font-weight: bold;
		margin-bottom: 5px;
	}

	:global(.item-type) {
		font-size: 14px;
		font-style: italic;
		color: var(--tetriary);
		margin-bottom: 5px;
	}

	:global(.item-rarity) {
		font-size: 14px;
		font-weight: bold;
		margin-bottom: 5px;
	}

	:global(.item-description) {
		font-size: 14px;
		color: var(--secondary);
		margin-bottom: 10px;
		font-style: italic;
	}

	:global(.item-stats) {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 5px;
		margin-bottom: 10px;
	}

	:global(.stat) {
		font-size: 12px;
	}

	:global(.item-price) {
		font-size: 14px;
		color: gold;
		margin-top: 30px;
		font-weight: bold;
	}
</style>

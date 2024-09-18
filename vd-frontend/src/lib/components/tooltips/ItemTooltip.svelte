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
		basePrice += stats.attackSpeed * 50;
		basePrice += stats.critMultiplier * 100 + stats.critChance * 20;
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
		const comparisonStats: Partial<Stats> = {};
		const allStats = new Set([
			...Object.keys(item.stats),
			...(equippedItem ? Object.keys(equippedItem.stats) : [])
		]);

		allStats.forEach((key) => {
			const itemValue = (item.stats as any)[key] || 0;
			const equippedValue = equippedItem ? (equippedItem.stats as any)[key] || 0 : 0;
			comparisonStats[key as keyof Stats] = itemValue - equippedValue;
		});

		return comparisonStats;
	}

	function formatComparison(value: number | undefined): string {
		if (value === undefined) return '';
		if (value > 0) return `<span style="color: green;">(+${value.toFixed(2)})</span>`;
		if (value < 0) return `<span style="color: red;">(${value.toFixed(2)})</span>`;
		return '';
	}

	function calculatePowerLevel(stats: Partial<Stats>): number {
		let powerLevel = 1;
		const weights = {
			damage: 10,
			attackSpeed: 200,
			critChance: 300,
			critMultiplier: 100,
			armor: 10,
			evasion: 50,
			maxHp: 1,
			maxMana: 0,
			poisonDamage: 5,
			fireDamage: 5,
			coldDamage: 5,
			lightDamage: 5,
			voidDamage: 5,
			poisonChance: 200,
			fireChance: 200,
			coldChance: 200,
			lightChance: 200,
			voidChance: 200,
			extraCurrencyChance: 200,
			extraDropChance: 200,
			dropRarityBoost: 200
		};

		Object.entries(stats).forEach(([key, value]) => {
			if (key in weights && typeof value === 'number') {
				powerLevel += value * weights[key as keyof typeof weights];
			}
		});

		return Math.max(1, Math.round(powerLevel / 10));
	}

	function getTooltipContent(item: Item): string {
		const rarityColor = getRarityColor(item.rarity);
		const playerInventory = get(inventory);
		const equippedItem = playerInventory
			? playerInventory.equipment[item.type as keyof Equipment]
			: null;
		const comparisonStats = getComparisonStats(item, equippedItem);

		const itemPowerLevel = calculatePowerLevel(item.stats);
		const equippedPowerLevel = equippedItem ? calculatePowerLevel(equippedItem.stats) : 0;
		const powerLevelDiff = itemPowerLevel - equippedPowerLevel;
		const powerLevelColor = powerLevelDiff > 0 ? 'green' : powerLevelDiff < 0 ? 'red' : 'white';

		let content = `
			<div class="item-name" style="color: var(--primary);">${item.name}</div>
			<div class="item-rarity" style="color: ${rarityColor};">${item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}</div>
			<div class="item-type">${item.type}</div>
			<div class="item-description">"${item.description}"</div>
			<div class="item-stats">
		`;

		Object.keys(comparisonStats).forEach((key) => {
			const value = item.stats[key as keyof Stats];
			const equippedValue = equippedItem ? equippedItem.stats[key as keyof Stats] : undefined;
			const comparisonValue = comparisonStats[key as keyof Stats];

			// Only show the stat if it's present in either the inspected item or the equipped item
			if (value || equippedValue) {
				const statName = formatStatName(key);
				const statColor = getStatColor(key);
				let displayValue: string | number = value !== undefined && value !== null ? value : 'N/A';
				const comparisonText = formatComparison(comparisonValue);

				let statClass = 'stat';
				if (!value) {
					statClass += ' missing-stat';
					displayValue = 0;
				}

				content += `<div class="${statClass}" style="color: ${statColor};">${statName}: ${displayValue} ${comparisonText}</div>`;
			}
		});

		content += `
			</div>
			<p class="item-price">${calculateItemPrice(item)} GOLD</p>
			<div class="power-level" style="color: ${powerLevelColor};">POWER: ${itemPowerLevel} ${powerLevelDiff !== 0 ? `(${powerLevelDiff >= 0 ? '+' : ''}${powerLevelDiff})` : ''}</div>
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

	:global(.missing-stat) {
		opacity: 0.5;
	}

	:global(.item-price) {
		font-size: 14px;
		color: gold;
		margin-top: 30px;
		font-weight: bold;
	}

	:global(.power-level) {
		font-size: 16px;
		font-weight: bold;
		margin-bottom: 10px;
	}
</style>

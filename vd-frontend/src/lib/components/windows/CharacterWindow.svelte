<script lang="ts">
	import type { Item } from '$lib/class/Item';
	import { inventory } from '$lib/store/inventory';
	import { player } from '$lib/store/player';
	import ItemSlot from '../game/ItemSlot.svelte';

	$: stats = $player ? $player.stats : null;
	$: equipment = $inventory ? $inventory.equipment : null;

	function formatStat(value: number | undefined): string {
		if (value === null || value === undefined) return '0';
		if (Math.floor(value) === value) {
			return value.toString();
		}
		return value.toFixed(2);
	}
</script>

<div class="character-window">
	<div class="secondary-panel">
		<div class="secondary-panel-content">
			<div class="title">EQUIPMENT</div>
			<div class="slots">
				<div class="helmet">
					<ItemSlot
						slotType="equipment"
						slotIndex={0}
						item={equipment?.helmet}
						acceptableTypes={['helmet']}
					/>
				</div>
				<div class="weapon">
					<ItemSlot
						slotType="equipment"
						slotIndex={1}
						item={equipment?.weapon}
						acceptableTypes={['weapon']}
					/>
				</div>
				<div class="armor">
					<ItemSlot
						slotType="equipment"
						slotIndex={2}
						item={equipment?.armor}
						acceptableTypes={['armor']}
					/>
				</div>
				<div class="secondary">
					<ItemSlot
						slotType="equipment"
						slotIndex={3}
						item={equipment?.secondary}
						acceptableTypes={['secondary']}
					/>
				</div>
				<div class="boots">
					<ItemSlot
						slotType="equipment"
						slotIndex={4}
						item={equipment?.boots}
						acceptableTypes={['boots']}
					/>
				</div>
				<div class="talisman">
					<ItemSlot
						slotType="equipment"
						slotIndex={5}
						item={equipment?.talisman}
						acceptableTypes={['talisman']}
					/>
				</div>
			</div>
		</div>
	</div>
	<div class="stats">
		<div class="category">
			<div class="title">GENERAL</div>
			<div class="category-values">
				<div class="value">
					<span class="stat-title">NAME:</span>
					<span class="stat-value">{$player?.name}</span>
				</div>
				<div class="value">
					<span class="stat-title">CLASS:</span>
					<span class="stat-value">{$player?.charClass}</span>
				</div>
				<div class="value">
					<span class="stat-title">LEVEL:</span>
					<span class="stat-value">{$player?.level}</span>
				</div>
				<div class="value">
					<span class="stat-title">EXP:</span>
					<div class="bar exp">
						<div class="text">{$player?.exp} / {$player?.maxExp}</div>
						<div
							class="fill"
							style:width={(($player?.exp || 0) / ($player?.maxExp || 1)) * 100 + '%'}
						></div>
					</div>
				</div>
				<div class="value">
					<span class="stat-title">HP:</span>
					<div class="bar hp">
						<div class="text">{stats?.hp} / {stats?.maxHp}</div>
						<div
							class="fill"
							style:width={((stats?.hp || 0) / (stats?.maxHp || 1)) * 100 + '%'}
						></div>
					</div>
				</div>
				<div class="value">
					<span class="stat-title">MANA:</span>
					<div class="bar mana">
						<div class="text">{stats?.mana} / {stats?.maxMana}</div>
						<div
							class="fill"
							style:width={((stats?.mana || 0) / (stats?.maxMana || 1)) * 100 + '%'}
						></div>
					</div>
				</div>
			</div>
		</div>

		<div class="category">
			<div class="title">ATTACK</div>
			<div class="category-values">
				<div class="value">
					<span class="stat-title">Damage:</span>
					<span class="stat-value">{formatStat(stats?.damage)}</span>
				</div>
				<div class="value">
					<span class="stat-title">Attack Speed:</span>
					<span class="stat-value">{formatStat(stats?.attackSpeed)}</span>
				</div>
				<div class="value">
					<span class="stat-title">Crit Multiplier:</span>
					<span class="stat-value">x{formatStat(stats?.critMultiplier)}</span>
				</div>
				<div class="value">
					<span class="stat-title">Crit Chance:</span>
					<span class="stat-value">{formatStat(stats?.critChance)}%</span>
				</div>
			</div>
		</div>

		<div class="category">
			<div class="title">DEFENSE</div>
			<div class="category-values">
				<div class="value">
					<span class="stat-title">Armor:</span>
					<span class="stat-value">{formatStat(stats?.armor)}</span>
				</div>
				<div class="value">
					<span class="stat-title">Evasion:</span>
					<span class="stat-value">{formatStat(stats?.evasion)}%</span>
				</div>
			</div>
		</div>

		<div class="category">
			<div class="title">STATUS EFFECTS</div>
			<div class="category-values">
				<div class="value">
					<span class="stat-title">Poison Damage:</span>
					<span class="stat-value poison">{formatStat(stats?.poisonDamage)}</span>
				</div>
				<div class="value">
					<span class="stat-title">Fire Damage:</span>
					<span class="stat-value fire">{formatStat(stats?.fireDamage)}</span>
				</div>
				<div class="value">
					<span class="stat-title">Cold Damage:</span>
					<span class="stat-value cold">{formatStat(stats?.coldDamage)}</span>
				</div>
				<div class="value">
					<span class="stat-title">Light Damage:</span>
					<span class="stat-value light">{formatStat(stats?.lightDamage)}</span>
				</div>
				<div class="value">
					<span class="stat-title">Void Damage:</span>
					<span class="stat-value void">{formatStat(stats?.voidDamage)}</span>
				</div>

				<br />
				<div class="value">
					<span class="stat-title">Poison Chance:</span>
					<span class="stat-value poison">{formatStat(stats?.poisonChance)}%</span>
				</div>
				<div class="value">
					<span class="stat-title">Fire Chance:</span>
					<span class="stat-value fire">{formatStat(stats?.fireChance)}%</span>
				</div>
				<div class="value">
					<span class="stat-title">Cold Chance:</span>
					<span class="stat-value cold">{formatStat(stats?.coldChance)}%</span>
				</div>
				<div class="value">
					<span class="stat-title">Light Chance:</span>
					<span class="stat-value light">{formatStat(stats?.lightChance)}%</span>
				</div>
				<div class="value">
					<span class="stat-title">Void Chance:</span>
					<span class="stat-value void">{formatStat(stats?.voidChance)}%</span>
				</div>
			</div>
		</div>

		<div class="category">
			<div class="title">OTHER</div>
			<div class="category-values">
				<div class="value">
					<span class="stat-title">Extra Currency Chance:</span>
					<span class="stat-value">{formatStat(stats?.extraCurrencyChance)}%</span>
				</div>
				<div class="value">
					<span class="stat-title">Extra Drop Chance:</span>
					<span class="stat-value">{formatStat(stats?.extraDropChance)}%</span>
				</div>
				<div class="value">
					<span class="stat-title">Drop Rarity Boost:</span>
					<span class="stat-value">{formatStat(stats?.dropRarityBoost)}</span>
				</div>
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	.character-window {
		width: 600px;
		height: 428px;
		display: flex;
	}

	.secondary-panel {
		position: relative;
		width: 224px;
		border-right: 1px solid var(--tetriary);

		.secondary-panel-content {
			position: absolute;
			width: 100%;
			height: 100%;

			.title {
				display: flex;
				justify-content: space-around;
				align-items: center;
				user-select: none;
				padding: 15px 0;
				color: var(--secondary);

				&::before {
					content: '';
					flex: 1;
					height: 1px;
					margin-right: 5px;
					background-image: linear-gradient(to left, var(--tetriary), transparent);
				}

				&::after {
					content: '';
					flex: 1;
					height: 1px;
					margin-left: 5px;
					background-image: linear-gradient(to right, var(--tetriary), transparent);
				}
			}
			.slots {
				display: grid;
				padding: 20px;
				grid-template-columns: 48px 48px 48px;
				grid-template-rows: 48px 48px 48px;
				gap: 20px 20px;
				grid-template-areas:
					'. helmet talisman'
					'weapon armor secondary'
					'. boots .';
				.armor {
					grid-area: armor;
				}
				.helmet {
					grid-area: helmet;
				}
				.boots {
					grid-area: boots;
				}
				.weapon {
					grid-area: weapon;
				}
				.secondary {
					grid-area: secondary;
				}
				.talisman {
					grid-area: talisman;
				}
			}
		}
	}

	.stats {
		flex: 1;
		height: 100%;
		overflow-y: scroll;
		padding-bottom: 20px;

		.category {
			.title {
				display: flex;
				justify-content: space-around;
				align-items: center;
				user-select: none;
				padding: 15px 0;
				color: var(--secondary);

				&::before {
					content: '';
					flex: 1;
					height: 1px;
					margin-right: 5px;
					background-image: linear-gradient(to left, var(--tetriary), transparent);
				}

				&::after {
					content: '';
					flex: 1;
					height: 1px;
					margin-left: 5px;
					background-image: linear-gradient(to right, var(--tetriary), transparent);
				}
			}

			.category-values {
				padding: 0 20px;

				.value {
					.stat-title {
						color: var(--secondary);
					}

					.stat-value {
						padding-left: 5px;
						color: var(--primary);

						&.poison {
							color: var(--poison);
						}
						&.fire {
							color: var(--fire);
						}
						&.cold {
							color: var(--cold);
						}
						&.light {
							color: var(--light);
						}
						&.void {
							color: var(--void);
						}
					}

					.bar {
						position: relative;
						height: 20px;
						margin: 5px 0;
						border-bottom: 1px solid var(--secondary);
						background-color: var(--background);

						.text {
							position: absolute;
							width: 100%;
							text-align: center;
						}

						.fill {
							height: 100%;
						}
					}

					.exp .fill {
						background-color: var(--exp);
					}
					.mana .fill {
						background-color: var(--mana);
					}
					.hp .fill {
						background-color: var(--hp);
					}
				}
			}
		}
	}
</style>

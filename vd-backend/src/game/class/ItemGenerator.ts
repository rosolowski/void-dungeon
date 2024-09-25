import { Character } from './Character';
import { Item, ItemType, ItemRarity } from './Item';
import { Stats } from './Stats';

type ItemStats = Pick<
  Stats,
  | 'maxHp'
  | 'maxMana'
  | 'armor'
  | 'evasion'
  | 'damage'
  | 'attackSpeed'
  | 'critMultiplier'
  | 'critChance'
  | 'poisonDamage'
  | 'fireDamage'
  | 'coldDamage'
  | 'lightDamage'
  | 'voidDamage'
  | 'poisonChance'
  | 'fireChance'
  | 'coldChance'
  | 'lightChance'
  | 'voidChance'
  | 'extraCurrencyChance'
  | 'extraDropChance'
  | 'dropRarityBoost'
>;

interface StatConfig {
  probability: number;
  valueMultiplier: number;
}

const statConfigurations: Record<
  ItemType,
  Record<keyof ItemStats, StatConfig>
> = {
  [ItemType.Weapon]: {
    maxHp: { probability: 0, valueMultiplier: 0.5 },
    maxMana: { probability: 0.1, valueMultiplier: 0.8 },
    armor: { probability: 0, valueMultiplier: 0.5 },
    evasion: { probability: 0.1, valueMultiplier: 0.8 },
    damage: { probability: 1, valueMultiplier: 1.5 },
    attackSpeed: { probability: 1, valueMultiplier: 1.2 },
    critMultiplier: { probability: 0.7, valueMultiplier: 1.3 },
    critChance: { probability: 0.7, valueMultiplier: 1.3 },
    poisonDamage: { probability: 0.1, valueMultiplier: 1.2 },
    fireDamage: { probability: 0.1, valueMultiplier: 1.2 },
    coldDamage: { probability: 0.1, valueMultiplier: 1.2 },
    lightDamage: { probability: 0.1, valueMultiplier: 1.2 },
    voidDamage: { probability: 0, valueMultiplier: 1 },
    poisonChance: { probability: 0.1, valueMultiplier: 1.1 },
    fireChance: { probability: 0.1, valueMultiplier: 1.1 },
    coldChance: { probability: 0.1, valueMultiplier: 1.1 },
    lightChance: { probability: 0.1, valueMultiplier: 1.1 },
    voidChance: { probability: 0, valueMultiplier: 1 },
    extraCurrencyChance: { probability: 0.02, valueMultiplier: 1 },
    extraDropChance: { probability: 0.02, valueMultiplier: 1 },
    dropRarityBoost: { probability: 0.05, valueMultiplier: 1 },
  },
  [ItemType.Secondary]: {
    maxHp: { probability: 0.1, valueMultiplier: 0.8 },
    maxMana: { probability: 0.5, valueMultiplier: 1.2 },
    armor: { probability: 0.1, valueMultiplier: 1 },
    evasion: { probability: 0.3, valueMultiplier: 1.1 },
    damage: { probability: 0.2, valueMultiplier: 0.8 },
    attackSpeed: { probability: 0.05, valueMultiplier: 0.9 },
    critMultiplier: { probability: 0.2, valueMultiplier: 1 },
    critChance: { probability: 0.2, valueMultiplier: 1 },
    poisonDamage: { probability: 0.1, valueMultiplier: 1 },
    fireDamage: { probability: 0.1, valueMultiplier: 1 },
    coldDamage: { probability: 0.1, valueMultiplier: 1 },
    lightDamage: { probability: 0.2, valueMultiplier: 1.1 },
    voidDamage: { probability: 0.2, valueMultiplier: 1.1 },
    poisonChance: { probability: 0.2, valueMultiplier: 1.1 },
    fireChance: { probability: 0.2, valueMultiplier: 1.1 },
    coldChance: { probability: 0.2, valueMultiplier: 1.1 },
    lightChance: { probability: 0.2, valueMultiplier: 1.1 },
    voidChance: { probability: 0.2, valueMultiplier: 1.1 },
    extraCurrencyChance: { probability: 0.02, valueMultiplier: 1.1 },
    extraDropChance: { probability: 0.02, valueMultiplier: 1.1 },
    dropRarityBoost: { probability: 0.02, valueMultiplier: 1.1 },
  },
  [ItemType.Armor]: {
    maxHp: { probability: 0.7, valueMultiplier: 1.3 },
    maxMana: { probability: 0.5, valueMultiplier: 1.1 },
    armor: { probability: 0.9, valueMultiplier: 1.5 },
    evasion: { probability: 0.7, valueMultiplier: 1.2 },
    damage: { probability: 0.2, valueMultiplier: 0.7 },
    attackSpeed: { probability: 0.05, valueMultiplier: 0.8 },
    critMultiplier: { probability: 0.05, valueMultiplier: 0.9 },
    critChance: { probability: 0.05, valueMultiplier: 0.9 },
    poisonDamage: { probability: 0.2, valueMultiplier: 0.9 },
    fireDamage: { probability: 0.2, valueMultiplier: 0.9 },
    coldDamage: { probability: 0.2, valueMultiplier: 0.9 },
    lightDamage: { probability: 0.2, valueMultiplier: 0.9 },
    voidDamage: { probability: 0.2, valueMultiplier: 0.9 },
    poisonChance: { probability: 0.2, valueMultiplier: 0.9 },
    fireChance: { probability: 0.2, valueMultiplier: 0.9 },
    coldChance: { probability: 0.2, valueMultiplier: 0.9 },
    lightChance: { probability: 0.2, valueMultiplier: 0.9 },
    voidChance: { probability: 0.2, valueMultiplier: 0.9 },
    extraCurrencyChance: { probability: 0.1, valueMultiplier: 1 },
    extraDropChance: { probability: 0.1, valueMultiplier: 1 },
    dropRarityBoost: { probability: 0.1, valueMultiplier: 1 },
  },
  [ItemType.Boots]: {
    maxHp: { probability: 0.4, valueMultiplier: 1 },
    maxMana: { probability: 0.1, valueMultiplier: 0.8 },
    armor: { probability: 0.3, valueMultiplier: 1 },
    evasion: { probability: 0.6, valueMultiplier: 1.3 },
    damage: { probability: 0, valueMultiplier: 0.5 },
    attackSpeed: { probability: 0.05, valueMultiplier: 1.1 },
    critMultiplier: { probability: 0, valueMultiplier: 0.8 },
    critChance: { probability: 0.4, valueMultiplier: 1.2 },
    poisonDamage: { probability: 0, valueMultiplier: 0.8 },
    fireDamage: { probability: 0, valueMultiplier: 0.8 },
    coldDamage: { probability: 0, valueMultiplier: 0.8 },
    lightDamage: { probability: 0, valueMultiplier: 0.8 },
    voidDamage: { probability: 0, valueMultiplier: 0.8 },
    poisonChance: { probability: 0.2, valueMultiplier: 1 },
    fireChance: { probability: 0.2, valueMultiplier: 1 },
    coldChance: { probability: 0.2, valueMultiplier: 1 },
    lightChance: { probability: 0.2, valueMultiplier: 1 },
    voidChance: { probability: 0.2, valueMultiplier: 1 },
    extraCurrencyChance: { probability: 0.01, valueMultiplier: 1.2 },
    extraDropChance: { probability: 0.01, valueMultiplier: 1.2 },
    dropRarityBoost: { probability: 0.04, valueMultiplier: 1.2 },
  },
  [ItemType.Talisman]: {
    maxHp: { probability: 0.05, valueMultiplier: 0.9 },
    maxMana: { probability: 0.5, valueMultiplier: 1.3 },
    armor: { probability: 0, valueMultiplier: 0.7 },
    evasion: { probability: 0.7, valueMultiplier: 1.2 },
    damage: { probability: 0.05, valueMultiplier: 0.8 },
    attackSpeed: { probability: 0.35, valueMultiplier: 1.1 },
    critMultiplier: { probability: 0.4, valueMultiplier: 1.2 },
    critChance: { probability: 0.4, valueMultiplier: 1.2 },
    poisonDamage: { probability: 0.05, valueMultiplier: 1.1 },
    fireDamage: { probability: 0.05, valueMultiplier: 1.1 },
    coldDamage: { probability: 0.05, valueMultiplier: 1.1 },
    lightDamage: { probability: 0.05, valueMultiplier: 1.1 },
    voidDamage: { probability: 0.1, valueMultiplier: 1.1 },
    poisonChance: { probability: 0.1, valueMultiplier: 1.1 },
    fireChance: { probability: 0.1, valueMultiplier: 1.1 },
    coldChance: { probability: 0.1, valueMultiplier: 1.1 },
    lightChance: { probability: 0.1, valueMultiplier: 1.1 },
    voidChance: { probability: 0.1, valueMultiplier: 1.1 },
    extraCurrencyChance: { probability: 0.1, valueMultiplier: 1.3 },
    extraDropChance: { probability: 0.1, valueMultiplier: 1.3 },
    dropRarityBoost: { probability: 0.1, valueMultiplier: 1.3 },
  },
  [ItemType.Helmet]: {
    maxHp: { probability: 0.7, valueMultiplier: 1.2 },
    maxMana: { probability: 0.2, valueMultiplier: 1 },
    armor: { probability: 0.9, valueMultiplier: 1.3 },
    evasion: { probability: 0.2, valueMultiplier: 0.9 },
    damage: { probability: 0, valueMultiplier: 0.7 },
    attackSpeed: { probability: 0, valueMultiplier: 0.9 },
    critMultiplier: { probability: 0, valueMultiplier: 1 },
    critChance: { probability: 0, valueMultiplier: 0.8 },
    poisonDamage: { probability: 0, valueMultiplier: 0.9 },
    fireDamage: { probability: 0, valueMultiplier: 0.9 },
    coldDamage: { probability: 0, valueMultiplier: 0.9 },
    lightDamage: { probability: 0, valueMultiplier: 0.9 },
    voidDamage: { probability: 0, valueMultiplier: 0.9 },
    poisonChance: { probability: 0, valueMultiplier: 0.9 },
    fireChance: { probability: 0, valueMultiplier: 0.9 },
    coldChance: { probability: 0, valueMultiplier: 0.9 },
    lightChance: { probability: 0, valueMultiplier: 0.9 },
    voidChance: { probability: 0, valueMultiplier: 0.9 },
    extraCurrencyChance: { probability: 0.1, valueMultiplier: 1.1 },
    extraDropChance: { probability: 0.1, valueMultiplier: 1.1 },
    dropRarityBoost: { probability: 0.1, valueMultiplier: 1.1 },
  },
};

interface Modifier {
  name: string;
  description: string;
  apply: (item: Item) => void;
  rarity: ItemRarity;
}

const modifiers: Modifier[] = [
  {
    name: "Berserker's",
    description: 'empowers attacks at the cost of defense',
    apply: (item: Item) => {
      item.stats.damage = Math.round(item.stats.damage * 2);
      item.stats.armor = Math.round(item.stats.armor * 0.5);
    },
    rarity: ItemRarity.Uncommon,
  },
  {
    name: 'Enchanted',
    description: 'imbued with elemental energies',
    apply: (item: Item) => {
      item.stats.fireDamage = Math.round((item.stats.fireDamage + 5) * 1.5);
      item.stats.coldDamage = Math.round(item.stats.coldDamage * 1.2);
      item.stats.lightDamage = Math.round(item.stats.lightDamage * 1.2);
    },
    rarity: ItemRarity.Rare,
  },
  {
    name: 'Celestial',
    description: 'blessed by the heavens',
    apply: (item: Item) => {
      item.stats.maxHp = Math.round(item.stats.maxHp * 2);
      item.stats.maxMana = Math.round(item.stats.maxMana * 2);
      item.stats.lightDamage = Math.round(item.stats.lightDamage * 2);
    },
    rarity: ItemRarity.Epic,
  },
  {
    name: 'Void-touched',
    description: 'infused with the power of the void',
    apply: (item: Item) => {
      item.stats.voidDamage = Math.round((item.stats.voidDamage || 0) + 10);
      item.stats.voidChance = parseFloat(
        (item.stats.voidChance + 5).toFixed(2),
      );
    },
    rarity: ItemRarity.Legendary,
  },
  {
    name: 'Swift',
    description: 'infused with unparalleled speed',
    apply: (item: Item) => {
      item.stats.attackSpeed = parseFloat(
        (item.stats.attackSpeed * 1.5).toFixed(2),
      );
      item.stats.evasion = parseFloat((item.stats.evasion * 1.5).toFixed(2));
    },
    rarity: ItemRarity.Rare,
  },
  {
    name: "Archmage's",
    description: 'amplified with magical prowess',
    apply: (item: Item) => {
      item.stats.maxMana = Math.round(item.stats.maxMana * 1.5);
      item.stats.fireDamage = Math.round(item.stats.fireDamage + 20);
      item.stats.fireDamage = Math.round(item.stats.fireDamage * 1.2);
      item.stats.coldDamage = Math.round(item.stats.coldDamage + 20);
      item.stats.coldDamage = Math.round(item.stats.coldDamage * 1.2);
      item.stats.lightDamage = Math.round(item.stats.lightDamage + 20);
      item.stats.lightDamage = Math.round(item.stats.lightDamage * 1.2);
    },
    rarity: ItemRarity.Epic,
  },
  {
    name: 'Ethereal',
    description: 'phasing in and out of reality',
    apply: (item: Item) => {
      item.stats.evasion = parseFloat((item.stats.evasion + 0.1).toFixed(2));
      item.stats.evasion = parseFloat((item.stats.evasion * 1.4).toFixed(2));
      item.stats.voidDamage = Math.round((item.stats.voidDamage || 0) + 15);
    },
    rarity: ItemRarity.Legendary,
  },
  {
    name: 'Venomous',
    description: 'coated with deadly toxins',
    apply: (item: Item) => {
      item.stats.poisonDamage = Math.round(item.stats.poisonDamage * 1.5);
      item.stats.poisonChance = parseFloat(
        (item.stats.poisonChance + 0.02).toFixed(2),
      );
    },
    rarity: ItemRarity.Rare,
  },
];

const typeAdjectives: Record<ItemType, string[]> = {
  [ItemType.Weapon]: [
    'Sharp',
    'Deadly',
    'Balanced',
    'Swift',
    'Crushing',
    'Precise',
  ],
  [ItemType.Secondary]: [
    'Sturdy',
    'Reinforced',
    'Protective',
    'Warding',
    'Deflecting',
    'Absorbing',
  ],
  [ItemType.Armor]: [
    'Durable',
    'Impenetrable',
    'Resilient',
    'Fortified',
    'Unyielding',
    'Adaptive',
  ],
  [ItemType.Boots]: [
    'Swift',
    'Nimble',
    'Steadfast',
    'Grounded',
    'Featherlight',
    'Surefooted',
  ],
  [ItemType.Talisman]: [
    'Mystical',
    'Arcane',
    'Enigmatic',
    'Potent',
    'Resonating',
    'Empowering',
  ],
  [ItemType.Helmet]: [
    'Vigilant',
    'Stalwart',
    'Insightful',
    'Focused',
    'All-seeing',
    'Intuitive',
  ],
};

const rarityAdjectives: Record<ItemRarity, string[]> = {
  [ItemRarity.Common]: ['Serviceable', 'Basic', 'Standard', 'Ordinary'],
  [ItemRarity.Uncommon]: ['Quality', 'Fine', 'Superior', 'Refined'],
  [ItemRarity.Rare]: ['Exceptional', 'Excellent', 'Superb', 'Masterful'],
  [ItemRarity.Epic]: ['Legendary', 'Mythical', 'Fabled', 'Renowned'],
  [ItemRarity.Legendary]: ['Godly', 'Divine', 'Celestial', 'Transcendent'],
};

const baseStatTotals: Record<keyof Stats, number> = {
  hp: 0, // Not used for items
  maxHp: 30,
  mana: 0, // Not used for items
  maxMana: 50,
  armor: 10,
  evasion: 0.15,
  damage: 12,
  attackSpeed: 0.1, // This is additional attack speed, 1 is the base
  critMultiplier: 0.5, // This is additional crit multiplier, 1 is the base
  critChance: 0.1,
  poisonDamage: 3,
  fireDamage: 3,
  coldDamage: 3,
  lightDamage: 3,
  voidDamage: 3,
  poisonChance: 0.05,
  fireChance: 0.05,
  coldChance: 0.05,
  lightChance: 0.05,
  voidChance: 0.05,
  poisonStatus: 0, // Not used for items
  fireStatus: 0, // Not used for items
  coldStatus: 0, // Not used for items
  lightStatus: 0, // Not used for items
  voidStatus: 0, // Not used for items
  extraCurrencyChance: 0.05,
  extraDropChance: 0.05,
  dropRarityBoost: 0.05,
};

export class ItemGenerator {
  static itemIdCounter: number = 0;

  static generateItem(level: number, character: Character): Item {
    const type = this.chooseItemType();
    const rarity = this.chooseItemRarity(character);
    const stats = this.generateItemStats(level, rarity, type, character);
    const modifier = this.chooseModifier(rarity);
    const name = this.generateItemName(type, rarity, modifier);
    const description = this.generateItemDescription(type, rarity, modifier);

    const item = new Item(
      this.itemIdCounter++,
      name,
      description,
      type,
      rarity,
      stats,
    );

    if (modifier) {
      modifier.apply(item);
    }

    return item;
  }

  private static chooseItemType(): ItemType {
    const types = Object.values(ItemType);
    return types[Math.floor(Math.random() * types.length)];
  }

  private static chooseItemRarity(character: Character): ItemRarity {
    const rarities = Object.values(ItemRarity);
    const baseWeights = [0.6, 0.2, 0.1, 0.07, 0.03];
    const adjustedWeights = this.calculateAdjustedWeights(
      baseWeights,
      character.stats.dropRarityBoost,
    );

    let sum = 0;
    const rand = Math.random();

    for (let i = 0; i < adjustedWeights.length; i++) {
      sum += adjustedWeights[i];
      if (rand < sum) {
        return rarities[i];
      }
    }

    return ItemRarity.Common;
  }

  private static calculateAdjustedWeights(
    baseWeights: number[],
    rarityBoost: number,
  ): number[] {
    const boostFactor = 1 + rarityBoost / 100;
    const adjustedWeights = baseWeights.map((weight, index) => {
      if (index === 0) {
        return Math.max(0.1, weight / boostFactor);
      } else {
        const scalingFactor = 1 - Math.exp(-index / 10);
        return Math.min(0.5, weight * boostFactor * scalingFactor);
      }
    });

    const sum = adjustedWeights.reduce((a, b) => a + b, 0);
    return adjustedWeights.map((weight) => weight / sum);
  }

  private static generateItemStats(
    level: number,
    rarity: ItemRarity,
    type: ItemType,
    character: Character,
  ): Stats {
    const newStats: Partial<Stats> = {};
    const rarityMultiplier = this.getRarityMultiplier(rarity);
    const variation = 0.2;

    for (const stat in baseStatTotals) {
      const key = stat as keyof Stats;
      const config = statConfigurations[type][key];
      if (!config) continue;

      if (config.probability > 0 && Math.random() < config.probability) {
        const baseValue = baseStatTotals[key] / 6;
        const scaledValue = this.scaleStatValue(
          baseValue,
          level,
          rarityMultiplier,
          character.level,
        );
        const adjustedValue = scaledValue * config.valueMultiplier;
        const finalValue = this.finalizeStatValue(
          key,
          this.randomize(adjustedValue, variation),
        );

        newStats[key] = finalValue;
      } else {
        newStats[key] = 0;
      }
    }

    return newStats as Stats;
  }

  private static finalizeStatValue(
    statKey: keyof Stats,
    value: number,
  ): number {
    const decimalStats = [
      'evasion',
      'attackSpeed',
      'critMultiplier',
      'critChance',
      'poisonChance',
      'fireChance',
      'coldChance',
      'lightChance',
      'voidChance',
      'extraCurrencyChance',
      'extraDropChance',
      'dropRarityBoost',
    ];

    if (decimalStats.includes(statKey)) {
      return parseFloat(value.toFixed(2));
    } else {
      return Math.round(value);
    }
  }

  private static scaleStatValue(
    base: number,
    level: number,
    rarityMultiplier: number,
    characterLevel: number,
  ): number {
    return base * Math.pow(characterLevel + level, 0.65) * rarityMultiplier;
  }

  private static randomize(value: number, variation: number): number {
    return value * (1 + (Math.random() - 0.5) * variation);
  }

  private static getRarityMultiplier(rarity: ItemRarity): number {
    switch (rarity) {
      case ItemRarity.Uncommon:
        return 1.5;
      case ItemRarity.Rare:
        return 2.0;
      case ItemRarity.Epic:
        return 3.0;
      case ItemRarity.Legendary:
        return 5.0;
      default:
        return 1.0;
    }
  }

  private static chooseModifier(rarity: ItemRarity): Modifier | null {
    const eligibleModifiers = modifiers.filter((mod) => mod.rarity <= rarity);
    if (eligibleModifiers.length === 0) return null;

    const modifierChance = this.getModifierChance(rarity);
    if (Math.random() > modifierChance) return null;

    return eligibleModifiers[
      Math.floor(Math.random() * eligibleModifiers.length)
    ];
  }

  private static getModifierChance(rarity: ItemRarity): number {
    switch (rarity) {
      case ItemRarity.Common:
        return 0;
      case ItemRarity.Uncommon:
        return 0.1;
      case ItemRarity.Rare:
        return 0.3;
      case ItemRarity.Epic:
        return 0.6;
      case ItemRarity.Legendary:
        return 1;
    }
  }

  private static generateItemName(
    type: ItemType,
    rarity: ItemRarity,
    modifier: Modifier | null,
  ): string {
    const typeAdjective =
      typeAdjectives[type][
        Math.floor(Math.random() * typeAdjectives[type].length)
      ];
    const rarityAdjective =
      rarityAdjectives[rarity][
        Math.floor(Math.random() * rarityAdjectives[rarity].length)
      ];
    const typeName = type.charAt(0).toUpperCase() + type.slice(1);

    let name = `${rarityAdjective} ${typeAdjective} ${typeName}`;
    if (modifier) {
      name = `${modifier.name} ${name}`;
    }
    return name;
  }

  private static generateItemDescription(
    type: ItemType,
    rarity: ItemRarity,
    modifier: Modifier | null,
  ): string {
    let description = `A ${rarity.toLowerCase()} ${type.toLowerCase()} `;

    switch (type) {
      case ItemType.Weapon:
        description += 'that strikes fear into the hearts of enemies. ';
        break;
      case ItemType.Secondary:
        description += 'that provides excellent protection and utility. ';
        break;
      case ItemType.Armor:
        description += 'that offers superior defense against various threats. ';
        break;
      case ItemType.Boots:
        description += 'that grants agility and sure footing in any terrain. ';
        break;
      case ItemType.Talisman:
        description += 'that resonates with arcane energies. ';
        break;
      case ItemType.Helmet:
        description +=
          "that enhances perception and protects the wearer's mind. ";
        break;
    }

    if (modifier) {
      description += `It is ${modifier.description}. `;
    }

    description += 'The craftsmanship is ';
    switch (rarity) {
      case ItemRarity.Common:
        description += 'ordinary, but dependable.';
        break;
      case ItemRarity.Uncommon:
        description += 'of notably high quality.';
        break;
      case ItemRarity.Rare:
        description += 'exceptional, a prized possession for any adventurer.';
        break;
      case ItemRarity.Epic:
        description += 'truly remarkable, the work of a master artisan.';
        break;
      case ItemRarity.Legendary:
        description +=
          'beyond mortal understanding, imbued with otherworldly power.';
        break;
    }

    return description;
  }
}

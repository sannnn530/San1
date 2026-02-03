const Discord = require('discord.js');
const ms = require("ms");

const Schema = require("../../database/models/economy");
const Schema2 = require("../../database/models/economyTimeout");
const itemSchema = require("../../database/models/economyItems");
const { processAutoRestock } = require('./restock');

const fishTypes = [
    { name: "Shrimp", emoji: ":shrimp:", rarity: "junk", basePrice: 1, minWeight: 0.05, maxWeight: 0.2 },
    { name: "Seaweed", emoji: ":herb:", rarity: "junk", basePrice: 1, minWeight: 0.01, maxWeight: 0.1 },
    { name: "Old Boot", emoji: ":boot:", rarity: "junk", basePrice: 0, minWeight: 0.5, maxWeight: 1 },
    { name: "Tin Can", emoji: ":can:", rarity: "junk", basePrice: 0, minWeight: 0.1, maxWeight: 0.3 },
    { name: "Plastic Bag", emoji: ":shopping_bags:", rarity: "junk", basePrice: 0, minWeight: 0.05, maxWeight: 0.1 },
    
    { name: "Minnow", emoji: ":fish:", rarity: "common", basePrice: 2, minWeight: 0.1, maxWeight: 0.3 },
    { name: "Sardine", emoji: ":fish:", rarity: "common", basePrice: 3, minWeight: 0.2, maxWeight: 0.5 },
    { name: "Anchovy", emoji: ":fish:", rarity: "common", basePrice: 3, minWeight: 0.1, maxWeight: 0.4 },
    { name: "Herring", emoji: ":fish:", rarity: "common", basePrice: 4, minWeight: 0.3, maxWeight: 0.8 },
    { name: "Crab", emoji: ":crab:", rarity: "common", basePrice: 4, minWeight: 0.2, maxWeight: 0.6 },
    { name: "Clam", emoji: ":shell:", rarity: "common", basePrice: 3, minWeight: 0.1, maxWeight: 0.3 },
    { name: "Snail", emoji: ":snail:", rarity: "common", basePrice: 2, minWeight: 0.05, maxWeight: 0.2 },
    { name: "Perch", emoji: ":fish:", rarity: "common", basePrice: 5, minWeight: 0.5, maxWeight: 1.5 },
    
    { name: "Bass", emoji: ":fish:", rarity: "uncommon", basePrice: 8, minWeight: 1, maxWeight: 3 },
    { name: "Trout", emoji: ":fish:", rarity: "uncommon", basePrice: 10, minWeight: 1, maxWeight: 4 },
    { name: "Catfish", emoji: ":fish:", rarity: "uncommon", basePrice: 12, minWeight: 2, maxWeight: 6 },
    { name: "Carp", emoji: ":fish:", rarity: "uncommon", basePrice: 9, minWeight: 1.5, maxWeight: 5 },
    { name: "Squid", emoji: ":squid:", rarity: "uncommon", basePrice: 15, minWeight: 1, maxWeight: 4 },
    { name: "Lobster", emoji: ":lobster:", rarity: "uncommon", basePrice: 18, minWeight: 0.5, maxWeight: 2 },
    { name: "Blowfish", emoji: ":blowfish:", rarity: "uncommon", basePrice: 14, minWeight: 0.3, maxWeight: 1.5 },
    { name: "Mackerel", emoji: ":fish:", rarity: "uncommon", basePrice: 11, minWeight: 1, maxWeight: 3 },
    
    { name: "Salmon", emoji: ":tropical_fish:", rarity: "rare", basePrice: 25, minWeight: 3, maxWeight: 10 },
    { name: "Tuna", emoji: ":fish:", rarity: "rare", basePrice: 30, minWeight: 5, maxWeight: 15 },
    { name: "Swordfish", emoji: ":fish:", rarity: "rare", basePrice: 35, minWeight: 10, maxWeight: 30 },
    { name: "Octopus", emoji: ":octopus:", rarity: "rare", basePrice: 28, minWeight: 3, maxWeight: 12 },
    { name: "Eel", emoji: ":snake:", rarity: "rare", basePrice: 32, minWeight: 2, maxWeight: 8 },
    { name: "Pufferfish", emoji: ":blowfish:", rarity: "rare", basePrice: 40, minWeight: 0.5, maxWeight: 3 },
    { name: "Sea Turtle", emoji: ":turtle:", rarity: "rare", basePrice: 45, minWeight: 10, maxWeight: 40 },
    { name: "Barracuda", emoji: ":fish:", rarity: "rare", basePrice: 38, minWeight: 5, maxWeight: 20 },
    
    { name: "Dolphin", emoji: ":dolphin:", rarity: "epic", basePrice: 60, minWeight: 30, maxWeight: 100 },
    { name: "Shark", emoji: ":shark:", rarity: "epic", basePrice: 80, minWeight: 50, maxWeight: 200 },
    { name: "Manta Ray", emoji: ":fish:", rarity: "epic", basePrice: 70, minWeight: 40, maxWeight: 150 },
    { name: "Giant Squid", emoji: ":squid:", rarity: "epic", basePrice: 90, minWeight: 100, maxWeight: 300 },
    { name: "Marlin", emoji: ":fish:", rarity: "epic", basePrice: 85, minWeight: 60, maxWeight: 250 },
    { name: "Stingray", emoji: ":fish:", rarity: "epic", basePrice: 65, minWeight: 20, maxWeight: 80 },
    
    { name: "Whale", emoji: ":whale:", rarity: "legendary", basePrice: 150, minWeight: 500, maxWeight: 2000 },
    { name: "Orca", emoji: ":whale2:", rarity: "legendary", basePrice: 180, minWeight: 300, maxWeight: 1000 },
    { name: "Giant Oarfish", emoji: ":fish:", rarity: "legendary", basePrice: 200, minWeight: 50, maxWeight: 200 },
    { name: "Megalodon Tooth", emoji: ":tooth:", rarity: "legendary", basePrice: 250, minWeight: 0.5, maxWeight: 2 },
    { name: "Coelacanth", emoji: ":fish:", rarity: "legendary", basePrice: 300, minWeight: 30, maxWeight: 90 },
    
    { name: "Golden Koi", emoji: ":tropical_fish:", rarity: "mythical", basePrice: 500, minWeight: 5, maxWeight: 15 },
    { name: "Crystal Jellyfish", emoji: ":jellyfish:", rarity: "mythical", basePrice: 600, minWeight: 0.5, maxWeight: 3 },
    { name: "Abyssal Leviathan", emoji: ":dragon:", rarity: "mythical", basePrice: 800, minWeight: 1000, maxWeight: 5000 },
    { name: "Phoenix Fish", emoji: ":fire:", rarity: "mythical", basePrice: 750, minWeight: 10, maxWeight: 50 },
    
    { name: "Diamond", emoji: ":gem:", rarity: "divine", basePrice: 1000, minWeight: 0.1, maxWeight: 0.5 },
    { name: "Neptune's Trident Shard", emoji: ":trident:", rarity: "divine", basePrice: 1500, minWeight: 1, maxWeight: 5 },
    { name: "Poseidon's Blessing", emoji: ":crown:", rarity: "divine", basePrice: 2000, minWeight: 0.01, maxWeight: 0.1 }
];

const rarityColors = {
    junk: "🗑️",
    common: "⚪",
    uncommon: "🟢",
    rare: "🔵",
    epic: "🟣",
    legendary: "🟡",
    mythical: "🔴",
    divine: "💠"
};

const rarityChances = {
    junk: 25,
    common: 40,
    uncommon: 22,
    rare: 9,
    epic: 2.8,
    legendary: 0.8,
    mythical: 0.35,
    divine: 0.05
};

const baitBonuses = {
    basic: { rarityBoost: 0, weightBoost: 1.0, emoji: '🪱', name: 'Basic Bait' },
    worm: { rarityBoost: 1, weightBoost: 1.02, emoji: '🐛', name: 'Worm Bait' },
    cricket: { rarityBoost: 2, weightBoost: 1.04, emoji: '🦗', name: 'Cricket Bait' },
    grub: { rarityBoost: 3, weightBoost: 1.06, emoji: '🐜', name: 'Grub Bait' },
    beetle: { rarityBoost: 4, weightBoost: 1.08, emoji: '🪲', name: 'Beetle Bait' },
    minnow: { rarityBoost: 5, weightBoost: 1.1, emoji: '🐟', name: 'Minnow Bait' },
    leech: { rarityBoost: 6, weightBoost: 1.12, emoji: '🪱', name: 'Leech Bait' },
    maggot: { rarityBoost: 7, weightBoost: 1.14, emoji: '🦠', name: 'Maggot Bait' },
    fly: { rarityBoost: 8, weightBoost: 1.16, emoji: '🪰', name: 'Fly Bait' },
    caterpillar: { rarityBoost: 9, weightBoost: 1.18, emoji: '🐛', name: 'Caterpillar Bait' },
    insect: { rarityBoost: 10, weightBoost: 1.2, emoji: '🦟', name: 'Insect Bait' },
    grasshopper: { rarityBoost: 11, weightBoost: 1.22, emoji: '🦗', name: 'Grasshopper Bait' },
    spider: { rarityBoost: 12, weightBoost: 1.24, emoji: '🕷️', name: 'Spider Bait' },
    shrimp: { rarityBoost: 13, weightBoost: 1.26, emoji: '🦐', name: 'Shrimp Bait' },
    prawn: { rarityBoost: 14, weightBoost: 1.28, emoji: '🦐', name: 'Prawn Bait' },
    crab: { rarityBoost: 15, weightBoost: 1.3, emoji: '🦀', name: 'Crab Bait' },
    lobster: { rarityBoost: 16, weightBoost: 1.32, emoji: '🦞', name: 'Lobster Bait' },
    squid: { rarityBoost: 17, weightBoost: 1.34, emoji: '🦑', name: 'Squid Bait' },
    octopus: { rarityBoost: 18, weightBoost: 1.36, emoji: '🐙', name: 'Octopus Bait' },
    clam: { rarityBoost: 19, weightBoost: 1.38, emoji: '🐚', name: 'Clam Bait' },
    oyster: { rarityBoost: 20, weightBoost: 1.4, emoji: '🦪', name: 'Oyster Bait' },
    sardine: { rarityBoost: 21, weightBoost: 1.42, emoji: '🐟', name: 'Sardine Bait' },
    anchovy: { rarityBoost: 22, weightBoost: 1.44, emoji: '🐟', name: 'Anchovy Bait' },
    herring: { rarityBoost: 23, weightBoost: 1.46, emoji: '🐟', name: 'Herring Bait' },
    mackerel: { rarityBoost: 24, weightBoost: 1.48, emoji: '🐟', name: 'Mackerel Bait' },
    premium: { rarityBoost: 25, weightBoost: 1.5, emoji: '🌟', name: 'Premium Bait' },
    super: { rarityBoost: 26, weightBoost: 1.55, emoji: '⚡', name: 'Super Bait' },
    mega: { rarityBoost: 27, weightBoost: 1.6, emoji: '🔥', name: 'Mega Bait' },
    ultra: { rarityBoost: 28, weightBoost: 1.65, emoji: '💥', name: 'Ultra Bait' },
    hyper: { rarityBoost: 29, weightBoost: 1.7, emoji: '🚀', name: 'Hyper Bait' },
    enchanted: { rarityBoost: 30, weightBoost: 1.75, emoji: '💫', name: 'Enchanted Bait' },
    blessed: { rarityBoost: 31, weightBoost: 1.8, emoji: '🙏', name: 'Blessed Bait' },
    holy: { rarityBoost: 32, weightBoost: 1.85, emoji: '✝️', name: 'Holy Bait' },
    sacred: { rarityBoost: 33, weightBoost: 1.9, emoji: '🕊️', name: 'Sacred Bait' },
    divine: { rarityBoost: 34, weightBoost: 1.95, emoji: '👼', name: 'Divine Bait' },
    mystic: { rarityBoost: 35, weightBoost: 2.0, emoji: '🔮', name: 'Mystic Bait' },
    arcane: { rarityBoost: 36, weightBoost: 2.05, emoji: '🧙', name: 'Arcane Bait' },
    magical: { rarityBoost: 37, weightBoost: 2.1, emoji: '🪄', name: 'Magical Bait' },
    wizard: { rarityBoost: 38, weightBoost: 2.15, emoji: '🧙‍♂️', name: 'Wizard Bait' },
    sorcerer: { rarityBoost: 39, weightBoost: 2.2, emoji: '🧙‍♀️', name: 'Sorcerer Bait' },
    ancient: { rarityBoost: 40, weightBoost: 2.25, emoji: '📜', name: 'Ancient Bait' },
    fossil: { rarityBoost: 41, weightBoost: 2.3, emoji: '🦴', name: 'Fossil Bait' },
    relic: { rarityBoost: 42, weightBoost: 2.35, emoji: '🏺', name: 'Relic Bait' },
    artifact: { rarityBoost: 43, weightBoost: 2.4, emoji: '⚱️', name: 'Artifact Bait' },
    legendary: { rarityBoost: 44, weightBoost: 2.45, emoji: '🏆', name: 'Legendary Bait' },
    golden: { rarityBoost: 45, weightBoost: 2.5, emoji: '✨', name: 'Golden Bait' },
    platinum: { rarityBoost: 46, weightBoost: 2.55, emoji: '⚪', name: 'Platinum Bait' },
    diamond: { rarityBoost: 47, weightBoost: 2.6, emoji: '💎', name: 'Diamond Bait' },
    ruby: { rarityBoost: 48, weightBoost: 2.65, emoji: '❤️', name: 'Ruby Bait' },
    sapphire: { rarityBoost: 49, weightBoost: 2.7, emoji: '💙', name: 'Sapphire Bait' },
    emerald: { rarityBoost: 50, weightBoost: 2.75, emoji: '💚', name: 'Emerald Bait' },
    amethyst: { rarityBoost: 51, weightBoost: 2.8, emoji: '💜', name: 'Amethyst Bait' },
    topaz: { rarityBoost: 52, weightBoost: 2.85, emoji: '💛', name: 'Topaz Bait' },
    opal: { rarityBoost: 53, weightBoost: 2.9, emoji: '🤍', name: 'Opal Bait' },
    onyx: { rarityBoost: 54, weightBoost: 2.95, emoji: '🖤', name: 'Onyx Bait' },
    celestial: { rarityBoost: 55, weightBoost: 3.0, emoji: '🌙', name: 'Celestial Bait' },
    lunar: { rarityBoost: 56, weightBoost: 3.05, emoji: '🌛', name: 'Lunar Bait' },
    solar: { rarityBoost: 57, weightBoost: 3.1, emoji: '☀️', name: 'Solar Bait' },
    stellar: { rarityBoost: 58, weightBoost: 3.15, emoji: '⭐', name: 'Stellar Bait' },
    nebula: { rarityBoost: 59, weightBoost: 3.2, emoji: '🌌', name: 'Nebula Bait' },
    cosmic: { rarityBoost: 60, weightBoost: 3.25, emoji: '🌌', name: 'Cosmic Bait' },
    galactic: { rarityBoost: 61, weightBoost: 3.3, emoji: '🌀', name: 'Galactic Bait' },
    universal: { rarityBoost: 62, weightBoost: 3.35, emoji: '🌍', name: 'Universal Bait' },
    infinite: { rarityBoost: 63, weightBoost: 3.4, emoji: '♾️', name: 'Infinite Bait' },
    eternal: { rarityBoost: 64, weightBoost: 3.45, emoji: '⏳', name: 'Eternal Bait' },
    ultimate: { rarityBoost: 65, weightBoost: 3.5, emoji: '💎', name: 'Ultimate Bait' },
    supreme: { rarityBoost: 66, weightBoost: 3.6, emoji: '👑', name: 'Supreme Bait' },
    omega: { rarityBoost: 67, weightBoost: 3.7, emoji: 'Ω', name: 'Omega Bait' },
    alpha: { rarityBoost: 68, weightBoost: 3.8, emoji: 'α', name: 'Alpha Bait' },
    prime: { rarityBoost: 69, weightBoost: 3.9, emoji: '🔱', name: 'Prime Bait' },
    apex: { rarityBoost: 70, weightBoost: 4.0, emoji: '🏔️', name: 'Apex Bait' },
    zenith: { rarityBoost: 72, weightBoost: 4.2, emoji: '🎯', name: 'Zenith Bait' },
    titan: { rarityBoost: 74, weightBoost: 4.4, emoji: '🗿', name: 'Titan Bait' },
    god: { rarityBoost: 76, weightBoost: 4.6, emoji: '⚡', name: 'God Bait' },
    transcendent: { rarityBoost: 80, weightBoost: 5.0, emoji: '🌈', name: 'Transcendent Bait' }
};

const rodTypes = {
    basic: { name: 'Basic Rod', emoji: '🎣', weightBoost: 1.0, minDurability: 8, maxDurability: 15, sellPrice: 25, timeBonus: 0, buttonCount: 5, shakeReduction: 0, catchReduction: 0 },
    wooden: { name: 'Wooden Rod', emoji: '🪵', weightBoost: 1.02, minDurability: 10, maxDurability: 18, sellPrice: 40, timeBonus: 50, buttonCount: 5, shakeReduction: 1, catchReduction: 0 },
    pine: { name: 'Pine Rod', emoji: '🌲', weightBoost: 1.04, minDurability: 12, maxDurability: 20, sellPrice: 55, timeBonus: 100, buttonCount: 5, shakeReduction: 1, catchReduction: 0 },
    oak: { name: 'Oak Rod', emoji: '🌳', weightBoost: 1.06, minDurability: 14, maxDurability: 22, sellPrice: 70, timeBonus: 150, buttonCount: 5, shakeReduction: 1, catchReduction: 0 },
    bamboo: { name: 'Bamboo Rod', emoji: '🎋', weightBoost: 1.08, minDurability: 16, maxDurability: 25, sellPrice: 90, timeBonus: 200, buttonCount: 5, shakeReduction: 2, catchReduction: 0 },
    maple: { name: 'Maple Rod', emoji: '🍁', weightBoost: 1.1, minDurability: 18, maxDurability: 28, sellPrice: 110, timeBonus: 250, buttonCount: 5, shakeReduction: 2, catchReduction: 0 },
    willow: { name: 'Willow Rod', emoji: '🌿', weightBoost: 1.12, minDurability: 20, maxDurability: 30, sellPrice: 130, timeBonus: 300, buttonCount: 5, shakeReduction: 2, catchReduction: 1 },
    fiberglass: { name: 'Fiberglass Rod', emoji: '🔷', weightBoost: 1.14, minDurability: 22, maxDurability: 32, sellPrice: 150, timeBonus: 350, buttonCount: 5, shakeReduction: 2, catchReduction: 1 },
    graphite: { name: 'Graphite Rod', emoji: '⬛', weightBoost: 1.16, minDurability: 24, maxDurability: 35, sellPrice: 175, timeBonus: 400, buttonCount: 5, shakeReduction: 3, catchReduction: 1 },
    carbon: { name: 'Carbon Rod', emoji: '⚫', weightBoost: 1.18, minDurability: 26, maxDurability: 38, sellPrice: 200, timeBonus: 450, buttonCount: 5, shakeReduction: 3, catchReduction: 1 },
    composite: { name: 'Composite Rod', emoji: '🔘', weightBoost: 1.2, minDurability: 28, maxDurability: 40, sellPrice: 230, timeBonus: 500, buttonCount: 5, shakeReduction: 3, catchReduction: 1 },
    bronze: { name: 'Bronze Rod', emoji: '🟤', weightBoost: 1.22, minDurability: 30, maxDurability: 42, sellPrice: 280, timeBonus: 550, buttonCount: 5, shakeReduction: 3, catchReduction: 1 },
    iron: { name: 'Iron Rod', emoji: '🔩', weightBoost: 1.24, minDurability: 32, maxDurability: 45, sellPrice: 330, timeBonus: 600, buttonCount: 5, shakeReduction: 4, catchReduction: 1 },
    steel: { name: 'Steel Rod', emoji: '🔧', weightBoost: 1.26, minDurability: 35, maxDurability: 48, sellPrice: 380, timeBonus: 650, buttonCount: 5, shakeReduction: 4, catchReduction: 1 },
    silver: { name: 'Silver Rod', emoji: '🥈', weightBoost: 1.28, minDurability: 38, maxDurability: 52, sellPrice: 450, timeBonus: 700, buttonCount: 4, shakeReduction: 4, catchReduction: 1 },
    titanium: { name: 'Titanium Rod', emoji: '⚪', weightBoost: 1.3, minDurability: 40, maxDurability: 55, sellPrice: 550, timeBonus: 750, buttonCount: 4, shakeReduction: 4, catchReduction: 1 },
    gold: { name: 'Gold Rod', emoji: '🥇', weightBoost: 1.32, minDurability: 45, maxDurability: 60, sellPrice: 700, timeBonus: 800, buttonCount: 4, shakeReduction: 5, catchReduction: 1 },
    platinum: { name: 'Platinum Rod', emoji: '⬜', weightBoost: 1.34, minDurability: 50, maxDurability: 65, sellPrice: 850, timeBonus: 850, buttonCount: 4, shakeReduction: 5, catchReduction: 1 },
    electrum: { name: 'Electrum Rod', emoji: '⚡', weightBoost: 1.36, minDurability: 55, maxDurability: 70, sellPrice: 1000, timeBonus: 900, buttonCount: 4, shakeReduction: 5, catchReduction: 2 },
    mithril: { name: 'Mithril Rod', emoji: '🔵', weightBoost: 1.38, minDurability: 60, maxDurability: 75, sellPrice: 1200, timeBonus: 950, buttonCount: 4, shakeReduction: 5, catchReduction: 2 },
    adamant: { name: 'Adamant Rod', emoji: '🟢', weightBoost: 1.4, minDurability: 65, maxDurability: 80, sellPrice: 1400, timeBonus: 1000, buttonCount: 4, shakeReduction: 6, catchReduction: 2 },
    rune: { name: 'Rune Rod', emoji: '🟣', weightBoost: 1.42, minDurability: 70, maxDurability: 85, sellPrice: 1700, timeBonus: 1050, buttonCount: 4, shakeReduction: 6, catchReduction: 2 },
    crystal: { name: 'Crystal Rod', emoji: '💠', weightBoost: 1.44, minDurability: 75, maxDurability: 90, sellPrice: 2000, timeBonus: 1100, buttonCount: 4, shakeReduction: 6, catchReduction: 2 },
    dragon: { name: 'Dragon Rod', emoji: '🐉', weightBoost: 1.46, minDurability: 80, maxDurability: 95, sellPrice: 2400, timeBonus: 1150, buttonCount: 4, shakeReduction: 6, catchReduction: 2 },
    diamond: { name: 'Diamond Rod', emoji: '💎', weightBoost: 1.48, minDurability: 85, maxDurability: 100, sellPrice: 2800, timeBonus: 1200, buttonCount: 4, shakeReduction: 7, catchReduction: 2 },
    ruby: { name: 'Ruby Rod', emoji: '❤️', weightBoost: 1.5, minDurability: 90, maxDurability: 110, sellPrice: 3300, timeBonus: 1250, buttonCount: 4, shakeReduction: 7, catchReduction: 2 },
    sapphire: { name: 'Sapphire Rod', emoji: '💙', weightBoost: 1.52, minDurability: 95, maxDurability: 120, sellPrice: 3800, timeBonus: 1300, buttonCount: 4, shakeReduction: 7, catchReduction: 2 },
    emerald: { name: 'Emerald Rod', emoji: '💚', weightBoost: 1.54, minDurability: 100, maxDurability: 130, sellPrice: 4300, timeBonus: 1350, buttonCount: 4, shakeReduction: 7, catchReduction: 3 },
    amethyst: { name: 'Amethyst Rod', emoji: '💜', weightBoost: 1.56, minDurability: 110, maxDurability: 140, sellPrice: 4800, timeBonus: 1400, buttonCount: 4, shakeReduction: 8, catchReduction: 3 },
    topaz: { name: 'Topaz Rod', emoji: '💛', weightBoost: 1.58, minDurability: 120, maxDurability: 150, sellPrice: 5300, timeBonus: 1450, buttonCount: 4, shakeReduction: 8, catchReduction: 3 },
    opal: { name: 'Opal Rod', emoji: '🤍', weightBoost: 1.6, minDurability: 130, maxDurability: 160, sellPrice: 5800, timeBonus: 1500, buttonCount: 3, shakeReduction: 8, catchReduction: 3 },
    obsidian: { name: 'Obsidian Rod', emoji: '🖤', weightBoost: 1.62, minDurability: 140, maxDurability: 170, sellPrice: 6500, timeBonus: 1550, buttonCount: 3, shakeReduction: 8, catchReduction: 3 },
    onyx: { name: 'Onyx Rod', emoji: '⚫', weightBoost: 1.64, minDurability: 150, maxDurability: 180, sellPrice: 7200, timeBonus: 1600, buttonCount: 3, shakeReduction: 9, catchReduction: 3 },
    jade: { name: 'Jade Rod', emoji: '🟩', weightBoost: 1.66, minDurability: 160, maxDurability: 190, sellPrice: 8000, timeBonus: 1650, buttonCount: 3, shakeReduction: 9, catchReduction: 3 },
    pearl: { name: 'Pearl Rod', emoji: '🫧', weightBoost: 1.68, minDurability: 170, maxDurability: 200, sellPrice: 8800, timeBonus: 1700, buttonCount: 3, shakeReduction: 9, catchReduction: 3 },
    mystic: { name: 'Mystic Rod', emoji: '🔮', weightBoost: 1.7, minDurability: 180, maxDurability: 220, sellPrice: 10000, timeBonus: 1750, buttonCount: 3, shakeReduction: 9, catchReduction: 4 },
    enchanted: { name: 'Enchanted Rod', emoji: '💫', weightBoost: 1.72, minDurability: 200, maxDurability: 240, sellPrice: 12000, timeBonus: 1800, buttonCount: 3, shakeReduction: 10, catchReduction: 4 },
    blessed: { name: 'Blessed Rod', emoji: '🙏', weightBoost: 1.74, minDurability: 220, maxDurability: 260, sellPrice: 14000, timeBonus: 1850, buttonCount: 3, shakeReduction: 10, catchReduction: 4 },
    holy: { name: 'Holy Rod', emoji: '✝️', weightBoost: 1.76, minDurability: 240, maxDurability: 280, sellPrice: 16000, timeBonus: 1900, buttonCount: 3, shakeReduction: 10, catchReduction: 4 },
    divine: { name: 'Divine Rod', emoji: '👼', weightBoost: 1.78, minDurability: 260, maxDurability: 300, sellPrice: 18000, timeBonus: 1950, buttonCount: 3, shakeReduction: 10, catchReduction: 4 },
    ancient: { name: 'Ancient Rod', emoji: '📜', weightBoost: 1.8, minDurability: 300, maxDurability: 350, sellPrice: 22000, timeBonus: 2000, buttonCount: 3, shakeReduction: 11, catchReduction: 4 },
    fossil: { name: 'Fossil Rod', emoji: '🦴', weightBoost: 1.82, minDurability: 350, maxDurability: 400, sellPrice: 26000, timeBonus: 2050, buttonCount: 3, shakeReduction: 11, catchReduction: 4 },
    relic: { name: 'Relic Rod', emoji: '🏺', weightBoost: 1.84, minDurability: 400, maxDurability: 450, sellPrice: 30000, timeBonus: 2100, buttonCount: 3, shakeReduction: 11, catchReduction: 4 },
    artifact: { name: 'Artifact Rod', emoji: '⚱️', weightBoost: 1.86, minDurability: 450, maxDurability: 500, sellPrice: 35000, timeBonus: 2150, buttonCount: 3, shakeReduction: 11, catchReduction: 5 },
    celestial: { name: 'Celestial Rod', emoji: '🌙', weightBoost: 1.88, minDurability: 500, maxDurability: 600, sellPrice: 40000, timeBonus: 2200, buttonCount: 3, shakeReduction: 12, catchReduction: 5 },
    lunar: { name: 'Lunar Rod', emoji: '🌛', weightBoost: 1.9, minDurability: 600, maxDurability: 700, sellPrice: 45000, timeBonus: 2250, buttonCount: 3, shakeReduction: 12, catchReduction: 5 },
    solar: { name: 'Solar Rod', emoji: '☀️', weightBoost: 1.92, minDurability: 700, maxDurability: 800, sellPrice: 50000, timeBonus: 2300, buttonCount: 3, shakeReduction: 12, catchReduction: 5 },
    stellar: { name: 'Stellar Rod', emoji: '⭐', weightBoost: 1.94, minDurability: 800, maxDurability: 900, sellPrice: 55000, timeBonus: 2350, buttonCount: 3, shakeReduction: 12, catchReduction: 5 },
    nebula: { name: 'Nebula Rod', emoji: '🌌', weightBoost: 1.96, minDurability: 900, maxDurability: 1000, sellPrice: 60000, timeBonus: 2400, buttonCount: 3, shakeReduction: 13, catchReduction: 5 },
    cosmic: { name: 'Cosmic Rod', emoji: '🌠', weightBoost: 1.98, minDurability: 1000, maxDurability: 1200, sellPrice: 70000, timeBonus: 2450, buttonCount: 3, shakeReduction: 13, catchReduction: 5 },
    galactic: { name: 'Galactic Rod', emoji: '🌀', weightBoost: 2.0, minDurability: 1200, maxDurability: 1400, sellPrice: 80000, timeBonus: 2500, buttonCount: 3, shakeReduction: 13, catchReduction: 5 },
    universal: { name: 'Universal Rod', emoji: '🌍', weightBoost: 2.05, minDurability: 1400, maxDurability: 1600, sellPrice: 90000, timeBonus: 2600, buttonCount: 3, shakeReduction: 13, catchReduction: 6 },
    infinite: { name: 'Infinite Rod', emoji: '♾️', weightBoost: 2.1, minDurability: 1600, maxDurability: 2000, sellPrice: 100000, timeBonus: 2700, buttonCount: 3, shakeReduction: 14, catchReduction: 6 },
    eternal: { name: 'Eternal Rod', emoji: '⏳', weightBoost: 2.15, minDurability: 2000, maxDurability: 2500, sellPrice: 120000, timeBonus: 2800, buttonCount: 3, shakeReduction: 14, catchReduction: 6 },
    legendary: { name: 'Legendary Rod', emoji: '🏆', weightBoost: 2.2, minDurability: 9999, maxDurability: 9999, sellPrice: 150000, timeBonus: 3000, buttonCount: 3, shakeReduction: 14, catchReduction: 6 },
    supreme: { name: 'Supreme Rod', emoji: '👑', weightBoost: 2.3, minDurability: 9999, maxDurability: 9999, sellPrice: 200000, timeBonus: 3200, buttonCount: 3, shakeReduction: 15, catchReduction: 6 },
    omega: { name: 'Omega Rod', emoji: 'Ω', weightBoost: 2.4, minDurability: 9999, maxDurability: 9999, sellPrice: 250000, timeBonus: 3400, buttonCount: 3, shakeReduction: 15, catchReduction: 7 },
    titan: { name: 'Titan Rod', emoji: '🗿', weightBoost: 2.5, minDurability: 9999, maxDurability: 9999, sellPrice: 300000, timeBonus: 3600, buttonCount: 3, shakeReduction: 15, catchReduction: 7 },
    god: { name: 'God Rod', emoji: '⚡', weightBoost: 2.75, minDurability: 9999, maxDurability: 9999, sellPrice: 400000, timeBonus: 4000, buttonCount: 3, shakeReduction: 15, catchReduction: 7 },
    transcendent: { name: 'Transcendent Rod', emoji: '🌈', weightBoost: 3.0, minDurability: 9999, maxDurability: 9999, sellPrice: 500000, timeBonus: 5000, buttonCount: 3, shakeReduction: 15, catchReduction: 7 }
};

function getRandomFish(baitType, rodType) {
    const bait = baitBonuses[baitType] || baitBonuses.basic;
    const rod = rodTypes[rodType] || rodTypes.basic;
    
    const adjustedChances = {};
    let totalChance = 0;
    
    for (const [rarity, chance] of Object.entries(rarityChances)) {
        let adjustedChance = chance;
        if (rarity !== 'junk') {
            adjustedChance = chance + (bait.rarityBoost * 0.15);
        } else {
            adjustedChance = Math.max(5, chance - (bait.rarityBoost * 0.3));
        }
        adjustedChances[rarity] = adjustedChance;
        totalChance += adjustedChance;
    }
    
    let roll = Math.random() * totalChance;
    let selectedRarity = 'common';
    
    for (const [rarity, chance] of Object.entries(adjustedChances)) {
        roll -= chance;
        if (roll <= 0) {
            selectedRarity = rarity;
            break;
        }
    }
    
    const fishOfRarity = fishTypes.filter(f => f.rarity === selectedRarity);
    const fish = fishOfRarity[Math.floor(Math.random() * fishOfRarity.length)];
    const weight = parseFloat(((fish.minWeight + Math.random() * (fish.maxWeight - fish.minWeight)) * bait.weightBoost * rod.weightBoost).toFixed(2));
    
    return { ...fish, weight };
}

module.exports = async (client, interaction, args) => {
    let user = interaction.user;
    let timeout = 60000;

    const userItems = await itemSchema.findOne({ Guild: interaction.guild.id, User: user.id });

    if (!userItems || !userItems.FishingRods || userItems.FishingRods.length === 0) {
        return client.errNormal({ error: "You have to buy a fishing rod! Use `/economy buy`", type: 'editreply' }, interaction);
    }

    const dataTime = await Schema2.findOne({ Guild: interaction.guild.id, User: user.id });
    
    if (dataTime && dataTime.Fish !== null && timeout - (Date.now() - dataTime.Fish) > 0) {
        let time = (dataTime.Fish / 1000 + timeout / 1000).toFixed(0);
        return client.errWait({ time: time, type: 'editreply' }, interaction);
    }

    const ownedRods = userItems.FishingRods.filter(r => r.durability > 0);
    if (ownedRods.length === 0) {
        return client.errNormal({ error: "All your fishing rods are broken! Buy a new one with `/economy buy`", type: 'editreply' }, interaction);
    }

    const rodLabels = ownedRods.slice(0, 25).map((r, index) => {
        const rodInfo = rodTypes[r.type] || rodTypes.basic;
        return {
            label: `${rodInfo.emoji} ${rodInfo.name}`,
            description: `Durability: ${r.durability} | Weight: +${((rodInfo.weightBoost - 1) * 100).toFixed(0)}%`,
            value: `${r.type}_${index}`
        };
    });

    const rodSelect = {
        type: 1,
        components: [{
            type: 3,
            custom_id: `rod_select_${Date.now()}`,
            placeholder: "Choose your fishing rod...",
            options: rodLabels
        }]
    };

    await interaction.editReply({
        embeds: [{
            title: "🎣 Choose Your Fishing Rod!",
            description: `You own **${ownedRods.length}** fishing rod(s).\n\nBetter rods = Heavier fish & easier mini-games!`,
            color: 0x3498db,
            footer: { text: "Higher tier rods reduce shake and catch rounds!" }
        }],
        components: [rodSelect]
    });

    const rodFilter = i => i.user.id === user.id && i.customId.startsWith('rod_select_');
    let selectedRodType;
    
    try {
        const rodInteraction = await interaction.channel.awaitMessageComponent({ filter: rodFilter, time: 30000 });
        selectedRodType = rodInteraction.values[0].replace(/_\d+$/, '');
        
        const currentRod = rodTypes[selectedRodType] || rodTypes.basic;
        
        await rodInteraction.update({
            embeds: [{
                title: `${currentRod.emoji} ${currentRod.name} Selected!`,
                description: "Now choose your bait...",
                color: 0x3498db
            }],
            components: []
        });
        
        await new Promise(r => setTimeout(r, 1000));
    } catch (e) {
        return interaction.editReply({
            embeds: [{
                title: "🎣 Cancelled",
                description: "You didn't select a rod in time!",
                color: 0xe74c3c
            }],
            components: []
        });
    }

    const currentRodType = selectedRodType;
    const currentRod = rodTypes[currentRodType] || rodTypes.basic;

    const availableBait = userItems.Bait?.filter(b => b.quantity > 0) || [];
    if (availableBait.length === 0) {
        return client.errNormal({ 
            error: "You need bait to fish! Buy some from `/economy buy`\n\n🪱 Basic Bait - $20 (10x)\n🦗 Good Bait - $50 (10x)\n🦐 Premium Bait - $150 (10x)\n✨ Golden Bait - $500 (10x)", 
            type: 'editreply' 
        }, interaction);
    }

    const baitLabels = availableBait.slice(0, 25).map(b => ({
        label: `${baitBonuses[b.type]?.emoji || '🪱'} ${baitBonuses[b.type]?.name || b.type} (${b.quantity} left)`,
        value: b.type
    }));

    const baitSelect = await client.generateSelect('fishBait', baitLabels);
    
    await interaction.editReply({
        embeds: [{
            title: "🎣 Choose Your Bait!",
            description: `Using: ${currentRod.emoji} **${currentRod.name}**\n\nBetter bait = Better fish!\n\n🪱 **Basic** - Normal catches\n🦗 **Good** - +20% weight, better rarity\n🦐 **Premium** - +50% weight, much better rarity\n✨ **Golden** - +100% weight, best rarity!`,
            color: 0x3498db
        }],
        components: baitSelect
    });

    const baitFilter = i => i.user.id === user.id;
    let selectedBait;
    
    try {
        const baitInteraction = await interaction.channel.awaitMessageComponent({ filter: baitFilter, componentType: Discord.ComponentType.StringSelect, time: 30000 });
        selectedBait = baitInteraction.values[0];
        
        const baitIndex = userItems.Bait.findIndex(b => b.type === selectedBait);
        if (baitIndex !== -1) {
            userItems.Bait[baitIndex].quantity -= 1;
            if (userItems.Bait[baitIndex].quantity <= 0) {
                userItems.Bait.splice(baitIndex, 1);
            }
            await userItems.save();
        }
        
        await baitInteraction.update({
            embeds: [new Discord.EmbedBuilder()
                .setTitle("🎣 Casting your line...")
                .setDescription(`Using ${currentRod.emoji} **${currentRod.name}** with ${baitBonuses[selectedBait]?.emoji || '🪱'} **${baitBonuses[selectedBait]?.name || selectedBait}**\n\n🌊 Shake your rod to attract fish!\n\n*Click the 🎣 button rapidly when it appears!*`)
                .setColor("#3498db")
            ],
            components: []
        });
        
        await new Promise(r => setTimeout(r, 1500));
    } catch (e) {
        return interaction.editReply({
            embeds: [new Discord.EmbedBuilder()
                .setTitle("🎣 Cancelled")
                .setDescription("You didn't select bait in time!")
                .setColor("#e74c3c")
            ],
            components: []
        });
    }

    let shakeCount = 0;
    const baseShakes = 20;
    const requiredShakes = Math.max(5, baseShakes - (currentRod.shakeReduction || 0));
    const shakeTimeLimit = 15000 + (currentRod.timeBonus || 0);
    const shakeButton = new Discord.ButtonBuilder()
        .setCustomId(`shake_${Date.now()}`)
        .setEmoji("🎣")
        .setLabel(`Shake! (${shakeCount}/${requiredShakes})`)
        .setStyle(Discord.ButtonStyle.Primary);
    
    const shakeRow = new Discord.ActionRowBuilder().addComponents(shakeButton);
    
    const getShakeProgress = (count, total) => {
        const filled = Math.floor((count / total) * 10);
        return "🟦".repeat(filled) + "⬜".repeat(10 - filled);
    };
    
    await interaction.editReply({
        embeds: [new Discord.EmbedBuilder()
            .setTitle("🌊 Shake to Attract Fish!")
            .setDescription(`Click the button **${requiredShakes} times** quickly to attract a fish!\n\n${getShakeProgress(shakeCount, requiredShakes)}\n\nProgress: ${shakeCount}/${requiredShakes}\n⏱️ Time: ${(shakeTimeLimit/1000).toFixed(0)}s\n\n🎣 **Rod Bonus:** -${currentRod.shakeReduction || 0} shakes`)
            .setColor("#3498db")
        ],
        components: [shakeRow]
    });

    const shakeFilter = i => i.user.id === user.id && i.customId.startsWith('shake_');
    const shakeCollector = interaction.channel.createMessageComponentCollector({ filter: shakeFilter, time: shakeTimeLimit });
    
    await new Promise((resolve) => {
        shakeCollector.on('collect', async (i) => {
            shakeCount++;
            if (shakeCount >= requiredShakes) {
                shakeCollector.stop('success');
                await i.update({
                    embeds: [new Discord.EmbedBuilder()
                        .setTitle("🐟 A fish is biting!")
                        .setDescription("Get ready for the catch mini-game...")
                        .setColor("#2ecc71")
                    ],
                    components: []
                });
                resolve();
            } else {
                const newButton = new Discord.ButtonBuilder()
                    .setCustomId(`shake_${Date.now()}`)
                    .setEmoji("🎣")
                    .setLabel(`Shake! (${shakeCount}/${requiredShakes})`)
                    .setStyle(Discord.ButtonStyle.Primary);
                const newRow = new Discord.ActionRowBuilder().addComponents(newButton);
                
                await i.update({
                    embeds: [new Discord.EmbedBuilder()
                        .setTitle("🌊 Shake to Attract Fish!")
                        .setDescription(`Click the button **${requiredShakes} times** quickly to attract a fish!\n\n${getShakeProgress(shakeCount, requiredShakes)}\n\nProgress: ${shakeCount}/${requiredShakes}\n⏱️ Time remaining...\n\n🎣 **Rod Bonus:** -${currentRod.shakeReduction || 0} shakes`)
                        .setColor("#3498db")
                    ],
                    components: [newRow]
                });
            }
        });
        
        shakeCollector.on('end', (collected, reason) => {
            if (reason !== 'success') {
                interaction.editReply({
                    embeds: [new Discord.EmbedBuilder()
                        .setTitle("🎣 Too Slow!")
                        .setDescription(`You only shook **${shakeCount}/${requiredShakes}** times.\nThe fish got away!`)
                        .setColor("#e74c3c")
                    ],
                    components: []
                }).catch(() => {});
                resolve();
            }
        });
    });

    if (shakeCount < requiredShakes) return;

    await new Promise(r => setTimeout(r, 1500));

    const baseCatchRounds = 10;
    const rounds = Math.max(3, baseCatchRounds - (currentRod.catchReduction || 0));
    const baseTime = 4500;
    let score = 0;
    const filter = i => i.user.id === user.id;
    const fishEmojis = ["🐟", "🐠", "🦈", "🐡", "🦐", "🦑", "🐙", "🦞"];
    
    for (let round = 1; round <= rounds; round++) {
        const targetEmoji = fishEmojis[Math.floor(Math.random() * fishEmojis.length)];
        const buttonEmojis = [...fishEmojis].sort(() => Math.random() - 0.5).slice(0, currentRod.buttonCount || 5);
        if (!buttonEmojis.includes(targetEmoji)) {
            buttonEmojis[Math.floor(Math.random() * buttonEmojis.length)] = targetEmoji;
        }
        
        const buttons = buttonEmojis.map((emoji, idx) => 
            new Discord.ButtonBuilder()
                .setCustomId(`catch_${round}_${idx}_${Date.now()}`)
                .setEmoji(emoji)
                .setStyle(Discord.ButtonStyle.Secondary)
        );
        
        const row = new Discord.ActionRowBuilder().addComponents(buttons);
        const timeLimit = Math.max(2500, baseTime - (round * 200));
        const progressFilled = Math.floor((round / rounds) * 10);
        const progressBar = "🟦".repeat(progressFilled) + "⬜".repeat(10 - progressFilled);
        
        await interaction.editReply({
            embeds: [new Discord.EmbedBuilder()
                .setTitle(`🎣 Catch the Fish! - Round ${round}/${rounds}`)
                .setDescription(`**Find and click:** ${targetEmoji}\n\n⏱️ Time: ${(timeLimit/1000).toFixed(1)}s\n📊 Progress: ${progressBar}\n🎯 Score: ${score}/${round - 1}\n\n🎣 **Rod Bonus:** -${currentRod.catchReduction || 0} rounds needed`)
                .setColor("#3498db")
                .setFooter({ text: "The game gets faster each round! Get 60% correct to catch fish!" })
            ],
            components: [row]
        });
        
        try {
            const buttonInteraction = await interaction.channel.awaitMessageComponent({ filter, time: timeLimit });
            const clickedEmoji = buttonInteraction.component.emoji.name;
            
            if (clickedEmoji === targetEmoji) {
                score++;
                await buttonInteraction.update({
                    embeds: [new Discord.EmbedBuilder()
                        .setTitle("✅ Correct!")
                        .setDescription(`Score: ${score}/${round}`)
                        .setColor("#2ecc71")
                    ],
                    components: []
                });
            } else {
                await buttonInteraction.update({
                    embeds: [new Discord.EmbedBuilder()
                        .setTitle("❌ Wrong!")
                        .setDescription(`That was ${clickedEmoji}, not ${targetEmoji}\nScore: ${score}/${round}`)
                        .setColor("#e74c3c")
                    ],
                    components: []
                });
            }
            
            if (round < rounds) await new Promise(r => setTimeout(r, 800));
        } catch (e) {
            await interaction.editReply({
                embeds: [new Discord.EmbedBuilder()
                    .setTitle("⏰ Too Slow!")
                    .setDescription(`You ran out of time!\nScore: ${score}/${round}`)
                    .setColor("#e74c3c")
                ],
                components: []
            });
            if (round < rounds) await new Promise(r => setTimeout(r, 800));
        }
    }
    
    const rodIndex = userItems.FishingRods.findIndex(r => r.type === currentRodType);
    if (rodIndex !== -1 && currentRodType !== 'legendary' && currentRodType !== 'supreme' && currentRodType !== 'omega' && currentRodType !== 'titan' && currentRodType !== 'god' && currentRodType !== 'transcendent') {
        userItems.FishingRods[rodIndex].durability -= 1;
        if (userItems.FishingRods[rodIndex].durability <= 0) {
            const brokenRod = userItems.FishingRods.splice(rodIndex, 1)[0];
            await userItems.save();
            await interaction.followUp({
                embeds: [{
                    title: "💔 Rod Broken!",
                    description: `Your ${currentRod.emoji} **${currentRod.name}** has broken from use!`,
                    color: 0xe74c3c
                }],
                ephemeral: true
            }).catch(() => {});
        } else {
            await userItems.save();
        }
    }

    if (dataTime) {
        dataTime.Fish = Date.now();
        await dataTime.save();
    } else {
        await new Schema2({ Guild: interaction.guild.id, User: user.id, Fish: Date.now() }).save();
    }
    
    const requiredScore = Math.ceil(rounds * 0.6);
    const scorePercent = Math.round((score / rounds) * 100);
    
    if (score >= requiredScore) {
        const isPerfect = score === rounds;
        const isExcellent = scorePercent >= 90 && !isPerfect;
        const bonusFish = isPerfect ? 3 : (isExcellent ? 2 : 1);
        const caughtFish = [];
        
        for (let i = 0; i < bonusFish; i++) {
            const fish = getRandomFish(selectedBait, currentRodType);
            if (isPerfect) {
                fish.weight = parseFloat((fish.weight * 2.0).toFixed(2));
            } else if (isExcellent) {
                fish.weight = parseFloat((fish.weight * 1.5).toFixed(2));
            }
            caughtFish.push(fish);
            
            await itemSchema.findOneAndUpdate(
                { Guild: interaction.guild.id, User: user.id },
                { $push: { Fish: { name: fish.name, emoji: fish.emoji, weight: fish.weight, rarity: fish.rarity, basePrice: fish.basePrice } } }
            );
        }
        
        const fishDesc = caughtFish.map(f => {
            const sellPrice = Math.floor(f.basePrice * (f.weight / 0.1) * 0.5);
            return `${rarityColors[f.rarity]} **${f.name}** ${f.emoji} - ${f.weight}kg ($${sellPrice})`;
        }).join('\n');
        
        let title, bonusText, color;
        if (isPerfect) {
            title = "🏆 PERFECT! Legendary Catch!";
            bonusText = "🌟 **PERFECT BONUS:** +100% fish weight & 3 fish caught!";
            color = "#ffd700";
        } else if (isExcellent) {
            title = "⭐ Excellent Fishing!";
            bonusText = "✨ **EXCELLENT BONUS:** +50% fish weight & 2 fish caught!";
            color = "#9b59b6";
        } else {
            title = "🎣 Nice Catch!";
            bonusText = "";
            color = "#2ecc71";
        }
        
        await interaction.editReply({
            embeds: [new Discord.EmbedBuilder()
                .setTitle(title)
                .setDescription(`**Final Score: ${score}/${rounds} (${scorePercent}%)**\n\n${bonusText ? bonusText + "\n\n" : ""}**You caught:**\n${fishDesc}`)
                .setColor(color)
                .setFooter({ text: `Perfect (100%): 3 fish +100% weight | Excellent (90%+): 2 fish +50% weight | Better rods = fewer rounds!` })
            ],
            components: []
        });
    } else {
        await interaction.editReply({
            embeds: [new Discord.EmbedBuilder()
                .setTitle("🎣 The Fish Got Away!")
                .setDescription(`**Final Score: ${score}/${rounds} (${scorePercent}%)**\n\nYou need at least ${requiredScore} correct (60%) to catch a fish.\nBetter luck next time!\n\n💡 **Tip:** Better rods reduce the number of rounds needed!`)
                .setColor("#e74c3c")
                .setFooter({ text: "Focus on finding the target emoji quickly!" })
            ],
            components: []
        });
    }
    
    try {
        const restockResult = await processAutoRestock(interaction.guild.id, user.id);
        if (restockResult.restocked) {
            const restockList = restockResult.items.map(item => `+${item.amount} ${item.type}`).join(', ');
            await interaction.followUp({
                embeds: [{
                    title: "🔄 Auto-Restock Triggered!",
                    description: `Your bait was low, so we restocked: ${restockList}\n💰 Spent: $${restockResult.totalSpent.toLocaleString()}`,
                    color: 0x3498db
                }],
                ephemeral: true
            }).catch(() => {});
        }
    } catch (e) {}
}


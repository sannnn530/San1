const Discord = require('discord.js');
const Schema = require("../../database/models/economy");
const items = require("../../database/models/economyItems");

const allBaitTypes = [
    'basic', 'worm', 'cricket', 'grub', 'beetle', 'minnow', 'leech', 'maggot', 'fly', 'caterpillar',
    'insect', 'grasshopper', 'spider', 'shrimp', 'prawn', 'crab', 'lobster', 'squid', 'octopus', 'clam',
    'oyster', 'sardine', 'anchovy', 'herring', 'mackerel', 'premium', 'super', 'mega', 'ultra', 'hyper',
    'enchanted', 'blessed', 'holy', 'sacred', 'divine', 'mystic', 'arcane', 'magical', 'wizard', 'sorcerer',
    'ancient', 'fossil', 'relic', 'artifact', 'legendary', 'golden', 'platinum', 'diamond', 'ruby', 'sapphire',
    'emerald', 'amethyst', 'topaz', 'opal', 'onyx', 'celestial', 'lunar', 'solar', 'stellar', 'nebula',
    'cosmic', 'galactic', 'universal', 'infinite', 'eternal', 'ultimate', 'supreme', 'omega', 'alpha', 'prime',
    'apex', 'zenith', 'titan', 'god', 'transcendent'
];

const allRodTypes = {
    basic: { emoji: '🎣', name: 'Basic Rod', minDur: 8, maxDur: 15 },
    wooden: { emoji: '🪵', name: 'Wooden Rod', minDur: 10, maxDur: 18 },
    pine: { emoji: '🌲', name: 'Pine Rod', minDur: 12, maxDur: 20 },
    oak: { emoji: '🌳', name: 'Oak Rod', minDur: 14, maxDur: 22 },
    bamboo: { emoji: '🎋', name: 'Bamboo Rod', minDur: 16, maxDur: 25 },
    maple: { emoji: '🍁', name: 'Maple Rod', minDur: 18, maxDur: 28 },
    willow: { emoji: '🌿', name: 'Willow Rod', minDur: 20, maxDur: 30 },
    fiberglass: { emoji: '🔷', name: 'Fiberglass Rod', minDur: 22, maxDur: 32 },
    graphite: { emoji: '⬛', name: 'Graphite Rod', minDur: 24, maxDur: 35 },
    carbon: { emoji: '⚫', name: 'Carbon Rod', minDur: 26, maxDur: 38 },
    composite: { emoji: '🔘', name: 'Composite Rod', minDur: 28, maxDur: 40 },
    bronze: { emoji: '🟤', name: 'Bronze Rod', minDur: 30, maxDur: 42 },
    iron: { emoji: '🔩', name: 'Iron Rod', minDur: 32, maxDur: 45 },
    steel: { emoji: '🔧', name: 'Steel Rod', minDur: 35, maxDur: 48 },
    silver: { emoji: '🥈', name: 'Silver Rod', minDur: 38, maxDur: 52 },
    titanium: { emoji: '⚪', name: 'Titanium Rod', minDur: 40, maxDur: 55 },
    gold: { emoji: '🥇', name: 'Gold Rod', minDur: 45, maxDur: 60 },
    platinum: { emoji: '⬜', name: 'Platinum Rod', minDur: 50, maxDur: 65 },
    electrum: { emoji: '⚡', name: 'Electrum Rod', minDur: 55, maxDur: 70 },
    mithril: { emoji: '🔵', name: 'Mithril Rod', minDur: 60, maxDur: 75 },
    adamant: { emoji: '🟢', name: 'Adamant Rod', minDur: 65, maxDur: 80 },
    rune: { emoji: '🟣', name: 'Rune Rod', minDur: 70, maxDur: 85 },
    crystal: { emoji: '💠', name: 'Crystal Rod', minDur: 75, maxDur: 90 },
    dragon: { emoji: '🐉', name: 'Dragon Rod', minDur: 80, maxDur: 95 },
    diamond: { emoji: '💎', name: 'Diamond Rod', minDur: 85, maxDur: 100 },
    ruby: { emoji: '❤️', name: 'Ruby Rod', minDur: 90, maxDur: 110 },
    sapphire: { emoji: '💙', name: 'Sapphire Rod', minDur: 95, maxDur: 120 },
    emerald: { emoji: '💚', name: 'Emerald Rod', minDur: 100, maxDur: 130 },
    amethyst: { emoji: '💜', name: 'Amethyst Rod', minDur: 110, maxDur: 140 },
    topaz: { emoji: '💛', name: 'Topaz Rod', minDur: 120, maxDur: 150 },
    opal: { emoji: '🤍', name: 'Opal Rod', minDur: 130, maxDur: 160 },
    obsidian: { emoji: '🖤', name: 'Obsidian Rod', minDur: 140, maxDur: 170 },
    onyx: { emoji: '⚫', name: 'Onyx Rod', minDur: 150, maxDur: 180 },
    jade: { emoji: '🟩', name: 'Jade Rod', minDur: 160, maxDur: 190 },
    pearl: { emoji: '🫧', name: 'Pearl Rod', minDur: 170, maxDur: 200 },
    mystic: { emoji: '🔮', name: 'Mystic Rod', minDur: 180, maxDur: 220 },
    enchanted: { emoji: '💫', name: 'Enchanted Rod', minDur: 200, maxDur: 240 },
    blessed: { emoji: '🙏', name: 'Blessed Rod', minDur: 220, maxDur: 260 },
    holy: { emoji: '✝️', name: 'Holy Rod', minDur: 240, maxDur: 280 },
    divine: { emoji: '👼', name: 'Divine Rod', minDur: 260, maxDur: 300 },
    ancient: { emoji: '📜', name: 'Ancient Rod', minDur: 300, maxDur: 350 },
    fossil: { emoji: '🦴', name: 'Fossil Rod', minDur: 350, maxDur: 400 },
    relic: { emoji: '🏺', name: 'Relic Rod', minDur: 400, maxDur: 450 },
    artifact: { emoji: '⚱️', name: 'Artifact Rod', minDur: 450, maxDur: 500 },
    celestial: { emoji: '🌙', name: 'Celestial Rod', minDur: 500, maxDur: 600 },
    lunar: { emoji: '🌛', name: 'Lunar Rod', minDur: 600, maxDur: 700 },
    solar: { emoji: '☀️', name: 'Solar Rod', minDur: 700, maxDur: 800 },
    stellar: { emoji: '⭐', name: 'Stellar Rod', minDur: 800, maxDur: 900 },
    nebula: { emoji: '🌌', name: 'Nebula Rod', minDur: 900, maxDur: 1000 },
    cosmic: { emoji: '🌠', name: 'Cosmic Rod', minDur: 1000, maxDur: 1200 },
    galactic: { emoji: '🌀', name: 'Galactic Rod', minDur: 1200, maxDur: 1400 },
    universal: { emoji: '🌍', name: 'Universal Rod', minDur: 1400, maxDur: 1600 },
    infinite: { emoji: '♾️', name: 'Infinite Rod', minDur: 1600, maxDur: 2000 },
    eternal: { emoji: '⏳', name: 'Eternal Rod', minDur: 2000, maxDur: 2500 },
    legendary: { emoji: '🏆', name: 'Legendary Rod', minDur: 9999, maxDur: 9999 },
    supreme: { emoji: '👑', name: 'Supreme Rod', minDur: 9999, maxDur: 9999 },
    omega: { emoji: 'Ω', name: 'Omega Rod', minDur: 9999, maxDur: 9999 },
    titan: { emoji: '🗿', name: 'Titan Rod', minDur: 9999, maxDur: 9999 },
    god: { emoji: '⚡', name: 'God Rod', minDur: 9999, maxDur: 9999 },
    transcendent: { emoji: '🌈', name: 'Transcendent Rod', minDur: 9999, maxDur: 9999 }
};

module.exports = async (client, interaction, args) => {
    const type = interaction.options.getString('type');
    const item = interaction.options.getString('item');
    const amount = interaction.options.getInteger('amount') || 1;
    const targetUser = interaction.options.getUser('user') || interaction.user;
    
    if (type === 'money') {
        await Schema.findOneAndUpdate(
            { Guild: interaction.guild.id, User: targetUser.id },
            { $inc: { Money: amount } },
            { upsert: true }
        );
        
        return interaction.editReply({
            embeds: [{
                title: "✅ Money Added",
                description: `Added **$${amount.toLocaleString()}** to ${targetUser}'s wallet`,
                color: 0x2ecc71
            }]
        });
    }
    
    if (!item) {
        return interaction.editReply({
            embeds: [{
                title: "❌ Missing Item",
                description: `You must specify an item type for ${type}`,
                color: 0xe74c3c
            }]
        });
    }
    
    let itemData = await items.findOne({ Guild: interaction.guild.id, User: targetUser.id });
    if (!itemData) {
        itemData = new items({ Guild: interaction.guild.id, User: targetUser.id, Bait: [], FishingRods: [] });
    }

    if (type === 'bait') {
        if (!allBaitTypes.includes(item)) {
            return interaction.editReply({
                embeds: [{
                    title: "❌ Invalid Bait Type",
                    description: `Valid types include: basic, worm, premium, legendary, cosmic, transcendent, etc.\n\nFull list: ${allBaitTypes.slice(0, 20).join(', ')}...`,
                    color: 0xe74c3c
                }]
            });
        }
        
        if (!itemData.Bait) itemData.Bait = [];
        const existingBait = itemData.Bait.find(b => b.type === item);
        if (existingBait) {
            existingBait.quantity += amount;
        } else {
            itemData.Bait.push({ type: item, quantity: amount });
        }
        await itemData.save();
        
        return interaction.editReply({
            embeds: [{
                title: "✅ Bait Added",
                description: `Added **${amount}x** **${item}** bait to ${targetUser}'s inventory`,
                color: 0x2ecc71
            }]
        });
        
    } else if (type === 'rod') {
        if (!allRodTypes[item]) {
            return interaction.editReply({
                embeds: [{
                    title: "❌ Invalid Rod Type",
                    description: `Valid types include: basic, wooden, bamboo, gold, diamond, legendary, god, transcendent, etc.\n\nFull list: ${Object.keys(allRodTypes).slice(0, 15).join(', ')}...`,
                    color: 0xe74c3c
                }]
            });
        }
        
        if (!itemData.FishingRods) itemData.FishingRods = [];
        const rodData = allRodTypes[item];
        
        for (let i = 0; i < amount; i++) {
            const durability = Math.floor(Math.random() * (rodData.maxDur - rodData.minDur + 1)) + rodData.minDur;
            itemData.FishingRods.push({ type: item, durability: durability });
        }
        await itemData.save();
        
        return interaction.editReply({
            embeds: [{
                title: "✅ Rod(s) Added",
                description: `Added **${amount}x** ${rodData.emoji} **${rodData.name}** to ${targetUser}'s inventory`,
                color: 0x2ecc71
            }]
        });
    }
};

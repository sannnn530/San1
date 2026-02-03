const { EmbedBuilder } = require('discord.js');
const Discord = require('discord.js');

const items = require("../../database/models/economyItems");

const rarityColors = { junk: "🗑️", common: "⚪", uncommon: "🟢", rare: "🔵", epic: "🟣", legendary: "🟡", mythical: "🔴", divine: "💠" };

const baitInfo = {
    basic: { emoji: '🪱', name: 'Basic' }, worm: { emoji: '🐛', name: 'Worm' },
    cricket: { emoji: '🦗', name: 'Cricket' }, grub: { emoji: '🐜', name: 'Grub' },
    beetle: { emoji: '🪲', name: 'Beetle' }, minnow: { emoji: '🐟', name: 'Minnow' },
    leech: { emoji: '🪱', name: 'Leech' }, maggot: { emoji: '🦠', name: 'Maggot' },
    fly: { emoji: '🪰', name: 'Fly' }, caterpillar: { emoji: '🐛', name: 'Caterpillar' },
    insect: { emoji: '🦟', name: 'Insect' }, grasshopper: { emoji: '🦗', name: 'Grasshopper' },
    spider: { emoji: '🕷️', name: 'Spider' }, shrimp: { emoji: '🦐', name: 'Shrimp' },
    prawn: { emoji: '🦐', name: 'Prawn' }, crab: { emoji: '🦀', name: 'Crab' },
    lobster: { emoji: '🦞', name: 'Lobster' }, squid: { emoji: '🦑', name: 'Squid' },
    octopus: { emoji: '🐙', name: 'Octopus' }, clam: { emoji: '🐚', name: 'Clam' },
    oyster: { emoji: '🦪', name: 'Oyster' }, sardine: { emoji: '🐟', name: 'Sardine' },
    anchovy: { emoji: '🐟', name: 'Anchovy' }, herring: { emoji: '🐟', name: 'Herring' },
    mackerel: { emoji: '🐟', name: 'Mackerel' }, premium: { emoji: '🌟', name: 'Premium' },
    super: { emoji: '⚡', name: 'Super' }, mega: { emoji: '🔥', name: 'Mega' },
    ultra: { emoji: '💥', name: 'Ultra' }, hyper: { emoji: '🚀', name: 'Hyper' },
    enchanted: { emoji: '💫', name: 'Enchanted' }, blessed: { emoji: '🙏', name: 'Blessed' },
    holy: { emoji: '✝️', name: 'Holy' }, sacred: { emoji: '🕊️', name: 'Sacred' },
    divine: { emoji: '👼', name: 'Divine' }, mystic: { emoji: '🔮', name: 'Mystic' },
    arcane: { emoji: '🧙', name: 'Arcane' }, magical: { emoji: '🪄', name: 'Magical' },
    wizard: { emoji: '🧙‍♂️', name: 'Wizard' }, sorcerer: { emoji: '🧙‍♀️', name: 'Sorcerer' },
    ancient: { emoji: '📜', name: 'Ancient' }, fossil: { emoji: '🦴', name: 'Fossil' },
    relic: { emoji: '🏺', name: 'Relic' }, artifact: { emoji: '⚱️', name: 'Artifact' },
    legendary: { emoji: '🏆', name: 'Legendary' }, golden: { emoji: '✨', name: 'Golden' },
    platinum: { emoji: '⚪', name: 'Platinum' }, diamond: { emoji: '💎', name: 'Diamond' },
    ruby: { emoji: '❤️', name: 'Ruby' }, sapphire: { emoji: '💙', name: 'Sapphire' },
    emerald: { emoji: '💚', name: 'Emerald' }, amethyst: { emoji: '💜', name: 'Amethyst' },
    topaz: { emoji: '💛', name: 'Topaz' }, opal: { emoji: '🤍', name: 'Opal' },
    onyx: { emoji: '🖤', name: 'Onyx' }, celestial: { emoji: '🌙', name: 'Celestial' },
    lunar: { emoji: '🌛', name: 'Lunar' }, solar: { emoji: '☀️', name: 'Solar' },
    stellar: { emoji: '⭐', name: 'Stellar' }, nebula: { emoji: '🌌', name: 'Nebula' },
    cosmic: { emoji: '🌌', name: 'Cosmic' }, galactic: { emoji: '🌀', name: 'Galactic' },
    universal: { emoji: '🌍', name: 'Universal' }, infinite: { emoji: '♾️', name: 'Infinite' },
    eternal: { emoji: '⏳', name: 'Eternal' }, ultimate: { emoji: '💎', name: 'Ultimate' },
    supreme: { emoji: '👑', name: 'Supreme' }, omega: { emoji: 'Ω', name: 'Omega' },
    alpha: { emoji: 'α', name: 'Alpha' }, prime: { emoji: '🔱', name: 'Prime' },
    apex: { emoji: '🏔️', name: 'Apex' }, zenith: { emoji: '🎯', name: 'Zenith' },
    titan: { emoji: '🗿', name: 'Titan' }, god: { emoji: '⚡', name: 'God' },
    transcendent: { emoji: '🌈', name: 'Transcendent' }
};

const rodInfo = {
    basic: { name: 'Basic', emoji: '🎣' }, wooden: { name: 'Wooden', emoji: '🪵' },
    pine: { name: 'Pine', emoji: '🌲' }, oak: { name: 'Oak', emoji: '🌳' },
    bamboo: { name: 'Bamboo', emoji: '🎋' }, maple: { name: 'Maple', emoji: '🍁' },
    willow: { name: 'Willow', emoji: '🌿' }, fiberglass: { name: 'Fiberglass', emoji: '🔷' },
    graphite: { name: 'Graphite', emoji: '⬛' }, carbon: { name: 'Carbon', emoji: '⚫' },
    composite: { name: 'Composite', emoji: '🔘' }, bronze: { name: 'Bronze', emoji: '🟤' },
    iron: { name: 'Iron', emoji: '🔩' }, steel: { name: 'Steel', emoji: '🔧' },
    silver: { name: 'Silver', emoji: '🥈' }, titanium: { name: 'Titanium', emoji: '⚪' },
    gold: { name: 'Gold', emoji: '🥇' }, platinum: { name: 'Platinum', emoji: '⬜' },
    electrum: { name: 'Electrum', emoji: '⚡' }, mithril: { name: 'Mithril', emoji: '🔵' },
    adamant: { name: 'Adamant', emoji: '🟢' }, rune: { name: 'Rune', emoji: '🟣' },
    crystal: { name: 'Crystal', emoji: '💠' }, dragon: { name: 'Dragon', emoji: '🐉' },
    diamond: { name: 'Diamond', emoji: '💎' }, ruby: { name: 'Ruby', emoji: '❤️' },
    sapphire: { name: 'Sapphire', emoji: '💙' }, emerald: { name: 'Emerald', emoji: '💚' },
    amethyst: { name: 'Amethyst', emoji: '💜' }, topaz: { name: 'Topaz', emoji: '💛' },
    opal: { name: 'Opal', emoji: '🤍' }, obsidian: { name: 'Obsidian', emoji: '🖤' },
    onyx: { name: 'Onyx', emoji: '⚫' }, jade: { name: 'Jade', emoji: '🟩' },
    pearl: { name: 'Pearl', emoji: '🫧' }, mystic: { name: 'Mystic', emoji: '🔮' },
    enchanted: { name: 'Enchanted', emoji: '💫' }, blessed: { name: 'Blessed', emoji: '🙏' },
    holy: { name: 'Holy', emoji: '✝️' }, divine: { name: 'Divine', emoji: '👼' },
    ancient: { name: 'Ancient', emoji: '📜' }, fossil: { name: 'Fossil', emoji: '🦴' },
    relic: { name: 'Relic', emoji: '🏺' }, artifact: { name: 'Artifact', emoji: '⚱️' },
    celestial: { name: 'Celestial', emoji: '🌙' }, lunar: { name: 'Lunar', emoji: '🌛' },
    solar: { name: 'Solar', emoji: '☀️' }, stellar: { name: 'Stellar', emoji: '⭐' },
    nebula: { name: 'Nebula', emoji: '🌌' }, cosmic: { name: 'Cosmic', emoji: '🌠' },
    galactic: { name: 'Galactic', emoji: '🌀' }, universal: { name: 'Universal', emoji: '🌍' },
    infinite: { name: 'Infinite', emoji: '♾️' }, eternal: { name: 'Eternal', emoji: '⏳' },
    legendary: { name: 'Legendary', emoji: '🏆' }, supreme: { name: 'Supreme', emoji: '👑' },
    omega: { name: 'Omega', emoji: 'Ω' }, titan: { name: 'Titan', emoji: '🗿' },
    god: { name: 'God', emoji: '⚡' }, transcendent: { name: 'Transcendent', emoji: '🌈' }
};

const bootsInfo = {
    basic: { name: 'Basic Boots', emoji: '👟', protection: 5 },
    running: { name: 'Running Boots', emoji: '👢', protection: 10 },
    steel: { name: 'Steel Boots', emoji: '🥾', protection: 20 },
    golden: { name: 'Golden Boots', emoji: '✨', protection: 30 }
};

const unbreakableRods = ['legendary', 'supreme', 'omega', 'titan', 'god', 'transcendent'];

module.exports = async (client, interaction, args) => {
    const user = interaction.options.getUser('user') || interaction.user;
    const itemsData = await items.findOne({ Guild: interaction.guild.id, User: user.id });

    let inventoryItems = [];
    let fishSummary = [];

    if (itemsData) {
        if (itemsData.FishingRods && itemsData.FishingRods.length > 0) {
            const rodCounts = {};
            itemsData.FishingRods.forEach(r => {
                if (!rodCounts[r.type]) rodCounts[r.type] = { count: 0, totalDurability: 0 };
                rodCounts[r.type].count++;
                rodCounts[r.type].totalDurability += r.durability;
            });
            
            inventoryItems.push(`**🎣 Fishing Rods (${itemsData.FishingRods.length} total):**`);
            const rodList = Object.entries(rodCounts).slice(0, 10).map(([type, data]) => {
                const rod = rodInfo[type] || { name: type, emoji: '🎣' };
                const isUnbreakable = unbreakableRods.includes(type);
                const durText = isUnbreakable ? '∞' : `${data.totalDurability} uses`;
                return `${rod.emoji} ${rod.name} x${data.count} (${durText})`;
            });
            inventoryItems.push(rodList.join(' | '));
            if (Object.keys(rodCounts).length > 10) {
                inventoryItems.push(`...and ${Object.keys(rodCounts).length - 10} more rod types`);
            }
        } else if (itemsData.FishingRod) {
            const rodType = itemsData.FishingRodType || 'basic';
            const rod = rodInfo[rodType] || { name: rodType, emoji: '🎣' };
            const isUnbreakable = unbreakableRods.includes(rodType);
            const usageText = isUnbreakable ? '∞' : `${itemsData.FishingRodUsage || 0} uses`;
            inventoryItems.push(`${rod.emoji} **${rod.name} Rod** (${usageText})`);
        }

        if (itemsData.Boots) {
            const boots = bootsInfo[itemsData.Boots] || { name: itemsData.Boots, emoji: '👟', protection: 0 };
            inventoryItems.push(`${boots.emoji} **${boots.name}** (${boots.protection}% protection)`);
        }
        
        if (itemsData.Bait && itemsData.Bait.length > 0) {
            let totalBait = 0;
            const baitList = itemsData.Bait.map(b => {
                const info = baitInfo[b.type] || { emoji: '🪱', name: b.type };
                totalBait += b.quantity;
                return `${info.emoji} ${info.name}: ${b.quantity}`;
            });
            inventoryItems.push(`\n**🪱 Bait Stock (${totalBait} total):**`);
            inventoryItems.push(baitList.slice(0, 10).join(' | '));
            if (baitList.length > 10) inventoryItems.push(`...and ${baitList.length - 10} more types`);
        }

        if (itemsData.Fish && itemsData.Fish.length > 0) {
            const fishByRarity = {};
            let totalWeight = 0;
            itemsData.Fish.forEach(fish => {
                if (!fishByRarity[fish.rarity]) fishByRarity[fish.rarity] = { count: 0, weight: 0 };
                fishByRarity[fish.rarity].count++;
                fishByRarity[fish.rarity].weight += fish.weight;
                totalWeight += fish.weight;
            });

            inventoryItems.push(`\n**🐟 Fish Collection (${itemsData.Fish.length} fish, ${totalWeight.toFixed(1)}kg):**`);
            for (const [rarity, data] of Object.entries(fishByRarity)) {
                fishSummary.push(`${rarityColors[rarity] || '⚪'} ${rarity}: ${data.count} (${data.weight.toFixed(1)}kg)`);
            }
        }
    }

    if (inventoryItems.length === 0 && fishSummary.length === 0) {
        return client.embed({
            title: `🎒・${user.username}'s Inventory`,
            desc: `No items found! Use \`/economy buy\` to get started.`,
            type: 'editreply'
        }, interaction);
    }

    return client.embed({
        title: `🎒・${user.username}'s Inventory`,
        desc: inventoryItems.join('\n') + (fishSummary.length > 0 ? '\n' + fishSummary.join(' | ') : ''),
        type: 'editreply'
    }, interaction);
};

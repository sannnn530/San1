const Discord = require('discord.js');

const roleStore = require("../../database/models/economyStore");
const ServerStock = require("../../database/models/serverStock");

const baitEmojis = {
    basic: '🪱', worm: '🐛', cricket: '🦗', grub: '🐜', beetle: '🪲', minnow: '🐟',
    premium: '🌟', super: '⚡', mega: '🔥', ultra: '💥',
    legendary: '🏆', golden: '✨', cosmic: '🌌', transcendent: '🌈'
};

const rodEmojis = {
    basic: '🎣', wooden: '🪵', pine: '🌲', oak: '🌳', bamboo: '🎋', maple: '🍁',
    fiberglass: '🔷', graphite: '⬛', carbon: '⚫', titanium: '⚪', gold: '🥇', diamond: '💎'
};

function getStockEmoji(current, max) {
    const ratio = current / max;
    if (ratio >= 0.7) return '🟢';
    if (ratio >= 0.3) return '🟡';
    if (ratio > 0) return '🔴';
    return '⛔';
}

function formatTimeUntilRestock(lastRestock, interval) {
    const nextRestock = lastRestock.getTime() + interval;
    const now = Date.now();
    const remaining = nextRestock - now;
    
    if (remaining <= 0) return 'Soon!';
    
    const minutes = Math.ceil(remaining / 60000);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
}

module.exports = async (client, interaction, args, message) => {
    const serverStock = await ServerStock.getOrCreate(interaction.guild.id);
    
    await serverStock.randomRestock();
    
    const storeData = await roleStore.find({ Guild: interaction.guild.id });
    const embeds = [];
    
    const mainEmbed = {
        title: `🏪 ${interaction.guild.name}'s Store`,
        description: `**Server Stock System**\nStock refreshes randomly! Prices fluctuate based on supply.\n\n📊 **Stock Legend:** 🟢 High | 🟡 Medium | 🔴 Low | ⛔ Out`,
        color: 0x3498db,
        fields: [
            { 
                name: '⏰ Next Restock', 
                value: formatTimeUntilRestock(serverStock.LastGlobalRestock, serverStock.RestockInterval), 
                inline: true 
            }
        ],
        footer: { text: 'Prices and stock change each restock!' }
    };
    embeds.push(mainEmbed);
    
    if (storeData && storeData.length > 0) {
        const roleItems = storeData.map(e => 
            `<@&${e.Role}> - ${client.emotes.economy.coins} $${e.Amount.toLocaleString()}\n\`/economy buy role:${e.Role}\``
        ).join('\n\n');
        
        embeds.push({
            title: `👑 Roles`,
            description: roleItems,
            color: 0xf1c40f,
            footer: { text: 'Role prices are fixed' }
        });
    }
    
    const basicBaits = serverStock.Baits.filter(b => ['basic', 'worm', 'cricket', 'grub', 'beetle', 'minnow'].includes(b.type));
    const premiumBaits = serverStock.Baits.filter(b => ['premium', 'super', 'mega', 'ultra'].includes(b.type));
    const legendaryBaits = serverStock.Baits.filter(b => ['legendary', 'golden', 'cosmic', 'transcendent'].includes(b.type));
    
    let baitDesc = '**Basic Baits:**\n';
    for (const bait of basicBaits) {
        const stockEmoji = getStockEmoji(bait.stock, bait.maxStock);
        baitDesc += `${baitEmojis[bait.type] || '🪱'} **${bait.type}** - $${bait.price.toLocaleString()}/10 ${stockEmoji} (${bait.stock})\n`;
    }
    
    baitDesc += '\n**Premium Baits:**\n';
    for (const bait of premiumBaits) {
        const stockEmoji = getStockEmoji(bait.stock, bait.maxStock);
        baitDesc += `${baitEmojis[bait.type] || '🌟'} **${bait.type}** - $${bait.price.toLocaleString()}/10 ${stockEmoji} (${bait.stock})\n`;
    }
    
    baitDesc += '\n**Legendary Baits:**\n';
    for (const bait of legendaryBaits) {
        const stockEmoji = getStockEmoji(bait.stock, bait.maxStock);
        baitDesc += `${baitEmojis[bait.type] || '🏆'} **${bait.type}** - $${bait.price.toLocaleString()}/10 ${stockEmoji} (${bait.stock})\n`;
    }
    
    baitDesc += '\n`/economy buy item:[bait] amount:[qty]`';
    
    embeds.push({
        title: `🪱 Bait Shop`,
        description: baitDesc,
        color: 0x2ecc71
    });
    
    let rodDesc = '';
    for (const rod of serverStock.Rods) {
        const stockEmoji = getStockEmoji(rod.stock, rod.maxStock);
        rodDesc += `${rodEmojis[rod.type] || '🎣'} **${rod.type}** - $${rod.price.toLocaleString()} ${stockEmoji} (${rod.stock})\n`;
    }
    rodDesc += '\n`/economy buy item:fishingrod` or `/restock`';
    
    embeds.push({
        title: `🎣 Fishing Rods`,
        description: rodDesc,
        color: 0x9b59b6
    });
    
    await interaction.editReply({ embeds });
}

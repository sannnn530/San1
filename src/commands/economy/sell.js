const { EmbedBuilder } = require('discord.js');
const Discord = require('discord.js');

const Schema = require("../../database/models/economy");
const items = require("../../database/models/economyItems");

const rarityColors = { common: "⚪", uncommon: "🟢", rare: "🔵", epic: "🟣", legendary: "🟡" };

const rodSellPrices = {
    basic: 50, wooden: 75, pine: 87, oak: 100, bamboo: 112, maple: 125, willow: 150,
    fiberglass: 175, graphite: 200, carbon: 225, composite: 250, bronze: 300, iron: 350,
    steel: 400, silver: 500, titanium: 600, gold: 750, platinum: 900, electrum: 1100,
    mithril: 1300, adamant: 1500, rune: 1800, crystal: 2200, dragon: 2600, diamond: 3000,
    ruby: 3500, sapphire: 4000, emerald: 4500, amethyst: 5000, topaz: 5500, opal: 6000,
    obsidian: 7000, onyx: 8000, jade: 9000, pearl: 10000, mystic: 12000, enchanted: 14000,
    blessed: 16000, holy: 18000, divine: 20000, ancient: 25000, fossil: 28000, relic: 32000,
    artifact: 36000, celestial: 40000, lunar: 45000, solar: 50000, stellar: 55000, nebula: 60000,
    cosmic: 70000, galactic: 80000, universal: 90000, infinite: 100000, eternal: 120000,
    legendary: 150000, supreme: 200000, omega: 250000, titan: 300000, god: 400000, transcendent: 500000
};

const rodInfo = {
    basic: '🎣', wooden: '🪵', pine: '🌲', oak: '🌳', bamboo: '🎋', maple: '🍁',
    willow: '🌿', fiberglass: '🔷', graphite: '⬛', carbon: '⚫', composite: '🔘',
    bronze: '🟤', iron: '🔩', steel: '🔧', silver: '🥈', titanium: '⚪', gold: '🥇',
    platinum: '⬜', electrum: '⚡', mithril: '🔵', adamant: '🟢', rune: '🟣',
    crystal: '💠', dragon: '🐉', diamond: '💎', ruby: '❤️', sapphire: '💙',
    emerald: '💚', amethyst: '💜', topaz: '💛', opal: '🤍', obsidian: '🖤',
    onyx: '⚫', jade: '🟩', pearl: '🫧', mystic: '🔮', enchanted: '💫', blessed: '🙏',
    holy: '✝️', divine: '👼', ancient: '📜', fossil: '🦴', relic: '🏺', artifact: '⚱️',
    celestial: '🌙', lunar: '🌛', solar: '☀️', stellar: '⭐', nebula: '🌌', cosmic: '🌠',
    galactic: '🌀', universal: '🌍', infinite: '♾️', eternal: '⏳', legendary: '🏆',
    supreme: '👑', omega: 'Ω', titan: '🗿', god: '⚡', transcendent: '🌈'
};

const bootsInfo = {
    basic: { name: 'Basic Boots', emoji: '👟', sellPrice: 100 },
    running: { name: 'Running Boots', emoji: '👢', sellPrice: 400 },
    steel: { name: 'Steel Boots', emoji: '🥾', sellPrice: 1500 },
    golden: { name: 'Golden Boots', emoji: '✨', sellPrice: 7500 }
};

module.exports = async (client, interaction, args) => {
    const itemsData = await items.findOne({ Guild: interaction.guild.id, User: interaction.user.id });
    
    if (!itemsData) return client.errNormal({ error: `You don't have any items to sell!`, type: 'editreply' }, interaction);

    let labels = [];

    if (itemsData.FishingRod) {
        const rodType = itemsData.FishingRodType || 'basic';
        const sellPrice = rodSellPrices[rodType] || 50;
        const emoji = rodInfo[rodType] || '🎣';
        labels.push({ label: `${emoji} ${rodType.charAt(0).toUpperCase() + rodType.slice(1)} Rod - $${sellPrice.toLocaleString()}`, value: `rod_${rodType}` });
    }

    if (itemsData.Boots) {
        const boots = bootsInfo[itemsData.Boots] || { name: itemsData.Boots, emoji: '👟', sellPrice: 100 };
        labels.push({ label: `${boots.emoji} ${boots.name} - $${boots.sellPrice.toLocaleString()}`, value: `boots_${itemsData.Boots}` });
    }

    if (itemsData.Fish && itemsData.Fish.length > 0) {
        let totalValue = 0;
        itemsData.Fish.forEach(fish => {
            const basePrice = { common: 10, uncommon: 25, rare: 50, epic: 100, legendary: 250 }[fish.rarity] || 10;
            totalValue += Math.floor(basePrice * fish.weight);
        });
        labels.push({ label: `🐟 Sell All Fish (${itemsData.Fish.length}) - ~$${totalValue.toLocaleString()}`, value: `sellallfish` });
    }

    if (labels.length === 0) return client.errNormal({ error: `You don't have any items to sell!`, type: 'editreply' }, interaction);

    const select = new Discord.ActionRowBuilder().addComponents(
        new Discord.StringSelectMenuBuilder()
            .setCustomId('sellItem')
            .setPlaceholder('Choose an item to sell')
            .addOptions(labels.slice(0, 25))
    );

    await interaction.editReply({
        embeds: [new Discord.EmbedBuilder().setTitle('💰 Sell Items').setDescription('Select an item to sell (half buy price)').setColor('#3498db')],
        components: [select]
    });

    const filter = i => i.user.id === interaction.user.id && i.customId === 'sellItem';
    
    try {
        const i = await interaction.channel.awaitMessageComponent({ filter, componentType: Discord.ComponentType.StringSelect, time: 60000 });
        const item = i.values[0];

        if (item.startsWith('rod_')) {
            const rodType = item.replace('rod_', '');
            const sellPrice = rodSellPrices[rodType] || 50;
            
            await items.findOneAndUpdate({ Guild: i.guild.id, User: i.user.id }, { FishingRod: false, FishingRodUsage: 0, FishingRodType: 'basic' });
            client.addMoney(i, i.user, sellPrice);

            return i.update({
                embeds: [new Discord.EmbedBuilder().setTitle('💰 Sold!').setDescription(`Sold your **${rodType}** rod for **$${sellPrice.toLocaleString()}**!`).setColor('#2ecc71')],
                components: []
            });
        }

        if (item.startsWith('boots_')) {
            const bootsType = item.replace('boots_', '');
            const boots = bootsInfo[bootsType] || { sellPrice: 100 };
            
            await items.findOneAndUpdate({ Guild: i.guild.id, User: i.user.id }, { Boots: null });
            client.addMoney(i, i.user, boots.sellPrice);

            return i.update({
                embeds: [new Discord.EmbedBuilder().setTitle('💰 Sold!').setDescription(`Sold your boots for **$${boots.sellPrice.toLocaleString()}**!`).setColor('#2ecc71')],
                components: []
            });
        }

        if (item === 'sellallfish') {
            const itemCheck = await items.findOne({ Guild: i.guild.id, User: i.user.id });
            if (!itemCheck || !itemCheck.Fish || itemCheck.Fish.length === 0) {
                return i.update({ embeds: [new Discord.EmbedBuilder().setTitle('❌ Error').setDescription('No fish to sell!').setColor('#e74c3c')], components: [] });
            }

            let totalValue = 0;
            itemCheck.Fish.forEach(fish => {
                const basePrice = { common: 10, uncommon: 25, rare: 50, epic: 100, legendary: 250 }[fish.rarity] || 10;
                totalValue += Math.floor(basePrice * fish.weight);
            });

            const fishCount = itemCheck.Fish.length;
            await items.findOneAndUpdate({ Guild: i.guild.id, User: i.user.id }, { Fish: [] });
            client.addMoney(i, i.user, totalValue);

            return i.update({
                embeds: [new Discord.EmbedBuilder().setTitle('💰 Sold!').setDescription(`Sold **${fishCount} fish** for **$${totalValue.toLocaleString()}**!`).setColor('#2ecc71')],
                components: []
            });
        }
    } catch (e) {
        interaction.editReply({ components: [] }).catch(() => {});
    }
};

const Discord = require('discord.js');

const Schema = require("../../database/models/economy");
const store = require("../../database/models/economyStore");
const items = require("../../database/models/economyItems");
const ShopStock = require("../../database/models/shopStock");
const ServerStock = require("../../database/models/serverStock");

const stockConfig = {
    rod: { maxStock: 5, restockAmount: 3, restockInterval: 1800000 },
    bait: { maxStock: 50, restockAmount: 25, restockInterval: 600000 },
    boots: { maxStock: 3, restockAmount: 2, restockInterval: 3600000 },
    role: { maxStock: 10, restockAmount: 5, restockInterval: 1800000 }
};

const tierMultipliers = {
    common: { stockMult: 1.5, restockMult: 0.8 },
    uncommon: { stockMult: 1.2, restockMult: 1.0 },
    rare: { stockMult: 1.0, restockMult: 1.2 },
    epic: { stockMult: 0.7, restockMult: 1.5 },
    legendary: { stockMult: 0.4, restockMult: 2.0 },
    mythic: { stockMult: 0.2, restockMult: 3.0 }
};

function getItemTier(price) {
    if (price >= 500000) return 'mythic';
    if (price >= 100000) return 'legendary';
    if (price >= 10000) return 'epic';
    if (price >= 1000) return 'rare';
    if (price >= 200) return 'uncommon';
    return 'common';
}

async function getOrCreateStock(guildId) {
    let stockData = await ShopStock.findOne({ Guild: guildId });
    if (!stockData) {
        stockData = new ShopStock({ Guild: guildId, Items: [], LastGlobalRestock: new Date() });
        await stockData.save();
    }
    return stockData;
}

async function getItemStock(guildId, itemType, itemId, price) {
    const stockData = await getOrCreateStock(guildId);
    let item = stockData.Items.find(i => i.itemType === itemType && i.itemId === itemId);
    
    if (!item) {
        const config = stockConfig[itemType] || stockConfig.bait;
        const tier = getItemTier(price);
        const mult = tierMultipliers[tier] || tierMultipliers.common;
        
        const baseMax = Math.max(1, Math.floor(config.maxStock * mult.stockMult));
        const maxStock = baseMax + Math.floor(Math.random() * (baseMax * 0.5));
        const initialStock = Math.floor(Math.random() * maxStock) + Math.floor(maxStock * 0.3);
        
        item = {
            itemType,
            itemId,
            currentStock: Math.min(initialStock, maxStock),
            maxStock,
            lastRestock: new Date(),
            restockInterval: Math.floor(config.restockInterval * mult.restockMult * (0.7 + Math.random() * 0.6))
        };
        stockData.Items.push(item);
        await stockData.save();
    }
    
    const now = Date.now();
    const timeSinceRestock = now - new Date(item.lastRestock).getTime();
    const restockCycles = Math.floor(timeSinceRestock / item.restockInterval);
    
    if (restockCycles > 0 && item.currentStock < item.maxStock) {
        const config = stockConfig[itemType] || stockConfig.bait;
        const tier = getItemTier(price);
        const mult = tierMultipliers[tier] || tierMultipliers.common;
        const baseRestock = Math.max(1, Math.floor(config.restockAmount * mult.stockMult));
        const restockAmount = baseRestock + Math.floor(Math.random() * baseRestock);
        
        item.currentStock = Math.min(item.maxStock, item.currentStock + (restockCycles * restockAmount));
        item.lastRestock = new Date(new Date(item.lastRestock).getTime() + (restockCycles * item.restockInterval));
        item.restockInterval = Math.floor(item.restockInterval * (0.8 + Math.random() * 0.4));
        
        const idx = stockData.Items.findIndex(i => i.itemType === itemType && i.itemId === itemId);
        stockData.Items[idx] = item;
        await stockData.save();
    }
    
    return { stockData, item };
}

async function decrementStock(guildId, itemType, itemId, amount = 1) {
    const result = await ShopStock.findOneAndUpdate(
        { 
            Guild: guildId,
            'Items.itemType': itemType,
            'Items.itemId': itemId,
            'Items.currentStock': { $gte: amount }
        },
        { $inc: { 'Items.$.currentStock': -amount } },
        { new: true }
    );
    return result !== null;
}

function formatTimeRemaining(ms) {
    if (ms <= 0) return 'Now';
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
}

const allRods = [
    { label: `🎣 Basic Rod`, value: `rod_basic`, price: 100 },
    { label: `🪵 Wooden Rod`, value: `rod_wooden`, price: 150 },
    { label: `🌲 Pine Rod`, value: `rod_pine`, price: 175 },
    { label: `🌳 Oak Rod`, value: `rod_oak`, price: 200 },
    { label: `🎋 Bamboo Rod`, value: `rod_bamboo`, price: 225 },
    { label: `🍁 Maple Rod`, value: `rod_maple`, price: 250 },
    { label: `🌿 Willow Rod`, value: `rod_willow`, price: 300 },
    { label: `🔷 Fiberglass`, value: `rod_fiberglass`, price: 350 },
    { label: `⬛ Graphite`, value: `rod_graphite`, price: 400 },
    { label: `⚫ Carbon Rod`, value: `rod_carbon`, price: 450 },
    { label: `🔘 Composite`, value: `rod_composite`, price: 500 },
    { label: `🟤 Bronze Rod`, value: `rod_bronze`, price: 600 },
    { label: `🔩 Iron Rod`, value: `rod_iron`, price: 700 },
    { label: `🔧 Steel Rod`, value: `rod_steel`, price: 800 },
    { label: `🥈 Silver Rod`, value: `rod_silver`, price: 1000 },
    { label: `⚪ Titanium`, value: `rod_titanium`, price: 1200 },
    { label: `🥇 Gold Rod`, value: `rod_gold`, price: 1500 },
    { label: `⬜ Platinum`, value: `rod_platinum`, price: 1800 },
    { label: `⚡ Electrum`, value: `rod_electrum`, price: 2200 },
    { label: `🔵 Mithril`, value: `rod_mithril`, price: 2600 },
    { label: `🟢 Adamant`, value: `rod_adamant`, price: 3000 },
    { label: `🟣 Rune Rod`, value: `rod_rune`, price: 3600 },
    { label: `💠 Crystal`, value: `rod_crystal`, price: 4400 },
    { label: `🐉 Dragon`, value: `rod_dragon`, price: 5200 },
    { label: `💎 Diamond`, value: `rod_diamond`, price: 6000 }
];

const allRods2 = [
    { label: `❤️ Ruby Rod`, value: `rod_ruby`, price: 7000 },
    { label: `💙 Sapphire`, value: `rod_sapphire`, price: 8000 },
    { label: `💚 Emerald`, value: `rod_emerald`, price: 9000 },
    { label: `💜 Amethyst`, value: `rod_amethyst`, price: 10000 },
    { label: `💛 Topaz Rod`, value: `rod_topaz`, price: 11000 },
    { label: `🤍 Opal Rod`, value: `rod_opal`, price: 12000 },
    { label: `🖤 Obsidian`, value: `rod_obsidian`, price: 14000 },
    { label: `⚫ Onyx Rod`, value: `rod_onyx`, price: 16000 },
    { label: `🟩 Jade Rod`, value: `rod_jade`, price: 18000 },
    { label: `🫧 Pearl Rod`, value: `rod_pearl`, price: 20000 },
    { label: `🔮 Mystic`, value: `rod_mystic`, price: 24000 },
    { label: `💫 Enchanted`, value: `rod_enchanted`, price: 28000 },
    { label: `🙏 Blessed`, value: `rod_blessed`, price: 32000 },
    { label: `✝️ Holy Rod`, value: `rod_holy`, price: 36000 },
    { label: `👼 Divine`, value: `rod_divine`, price: 40000 },
    { label: `📜 Ancient`, value: `rod_ancient`, price: 50000 },
    { label: `🦴 Fossil`, value: `rod_fossil`, price: 56000 },
    { label: `🏺 Relic`, value: `rod_relic`, price: 64000 },
    { label: `⚱️ Artifact`, value: `rod_artifact`, price: 72000 },
    { label: `🌙 Celestial`, value: `rod_celestial`, price: 80000 },
    { label: `🌛 Lunar`, value: `rod_lunar`, price: 90000 },
    { label: `☀️ Solar`, value: `rod_solar`, price: 100000 },
    { label: `⭐ Stellar`, value: `rod_stellar`, price: 110000 },
    { label: `🌌 Nebula`, value: `rod_nebula`, price: 120000 },
    { label: `🌠 Cosmic`, value: `rod_cosmic`, price: 140000 }
];

const allRods3 = [
    { label: `🌀 Galactic`, value: `rod_galactic`, price: 160000 },
    { label: `🌍 Universal`, value: `rod_universal`, price: 180000 },
    { label: `♾️ Infinite`, value: `rod_infinite`, price: 200000 },
    { label: `⏳ Eternal`, value: `rod_eternal`, price: 240000 },
    { label: `🏆 Legendary`, value: `rod_legendary`, price: 300000 },
    { label: `👑 Supreme`, value: `rod_supreme`, price: 400000 },
    { label: `Ω Omega`, value: `rod_omega`, price: 500000 },
    { label: `🗿 Titan`, value: `rod_titan`, price: 600000 },
    { label: `⚡ God Rod`, value: `rod_god`, price: 800000 },
    { label: `🌈 Transcendent`, value: `rod_transcendent`, price: 1000000 }
];

const allBaits = [
    { label: `🪱 Basic x10`, value: `bait_basic`, price: 20 },
    { label: `🐛 Worm x10`, value: `bait_worm`, price: 25 },
    { label: `🦗 Cricket x10`, value: `bait_cricket`, price: 30 },
    { label: `🐜 Grub x10`, value: `bait_grub`, price: 35 },
    { label: `🪲 Beetle x10`, value: `bait_beetle`, price: 40 },
    { label: `🐟 Minnow x10`, value: `bait_minnow`, price: 50 },
    { label: `🪱 Leech x10`, value: `bait_leech`, price: 60 },
    { label: `🦠 Maggot x10`, value: `bait_maggot`, price: 70 },
    { label: `🪰 Fly x10`, value: `bait_fly`, price: 80 },
    { label: `🐛 Caterpillar`, value: `bait_caterpillar`, price: 90 },
    { label: `🦟 Insect x10`, value: `bait_insect`, price: 100 },
    { label: `🦗 Grasshopper`, value: `bait_grasshopper`, price: 120 },
    { label: `🕷️ Spider x10`, value: `bait_spider`, price: 140 },
    { label: `🦐 Shrimp x10`, value: `bait_shrimp`, price: 160 },
    { label: `🦐 Prawn x10`, value: `bait_prawn`, price: 180 },
    { label: `🦀 Crab x10`, value: `bait_crab`, price: 200 },
    { label: `🦞 Lobster x10`, value: `bait_lobster`, price: 250 },
    { label: `🦑 Squid x10`, value: `bait_squid`, price: 300 },
    { label: `🐙 Octopus x10`, value: `bait_octopus`, price: 350 },
    { label: `🐚 Clam x10`, value: `bait_clam`, price: 400 },
    { label: `🦪 Oyster x10`, value: `bait_oyster`, price: 450 },
    { label: `🐟 Sardine x10`, value: `bait_sardine`, price: 500 },
    { label: `🐟 Anchovy x10`, value: `bait_anchovy`, price: 550 },
    { label: `🐟 Herring x10`, value: `bait_herring`, price: 600 },
    { label: `🐟 Mackerel x10`, value: `bait_mackerel`, price: 700 }
];

const allBaits2 = [
    { label: `🌟 Premium x10`, value: `bait_premium`, price: 800 },
    { label: `⚡ Super x10`, value: `bait_super`, price: 900 },
    { label: `🔥 Mega x10`, value: `bait_mega`, price: 1000 },
    { label: `💥 Ultra x10`, value: `bait_ultra`, price: 1200 },
    { label: `🚀 Hyper x10`, value: `bait_hyper`, price: 1400 },
    { label: `💫 Enchanted`, value: `bait_enchanted`, price: 1600 },
    { label: `🙏 Blessed x10`, value: `bait_blessed`, price: 1800 },
    { label: `✝️ Holy x10`, value: `bait_holy`, price: 2000 },
    { label: `🕊️ Sacred x10`, value: `bait_sacred`, price: 2400 },
    { label: `👼 Divine x10`, value: `bait_divine`, price: 2800 },
    { label: `🔮 Mystic x10`, value: `bait_mystic`, price: 3200 },
    { label: `🧙 Arcane x10`, value: `bait_arcane`, price: 3600 },
    { label: `🪄 Magical x10`, value: `bait_magical`, price: 4000 },
    { label: `🧙‍♂️ Wizard x10`, value: `bait_wizard`, price: 4500 },
    { label: `🧙‍♀️ Sorcerer`, value: `bait_sorcerer`, price: 5000 },
    { label: `📜 Ancient x10`, value: `bait_ancient`, price: 6000 },
    { label: `🦴 Fossil x10`, value: `bait_fossil`, price: 7000 },
    { label: `🏺 Relic x10`, value: `bait_relic`, price: 8000 },
    { label: `⚱️ Artifact`, value: `bait_artifact`, price: 9000 },
    { label: `🏆 Legendary`, value: `bait_legendary`, price: 10000 },
    { label: `✨ Golden x10`, value: `bait_golden`, price: 12000 },
    { label: `⚪ Platinum`, value: `bait_platinum`, price: 14000 },
    { label: `💎 Diamond`, value: `bait_diamond`, price: 16000 },
    { label: `❤️ Ruby x10`, value: `bait_ruby`, price: 18000 },
    { label: `💙 Sapphire`, value: `bait_sapphire`, price: 20000 }
];

const allBaits3 = [
    { label: `💚 Emerald x10`, value: `bait_emerald`, price: 22000 },
    { label: `💜 Amethyst`, value: `bait_amethyst`, price: 24000 },
    { label: `💛 Topaz x10`, value: `bait_topaz`, price: 26000 },
    { label: `🤍 Opal x10`, value: `bait_opal`, price: 28000 },
    { label: `🖤 Onyx x10`, value: `bait_onyx`, price: 30000 },
    { label: `🌙 Celestial`, value: `bait_celestial`, price: 35000 },
    { label: `🌛 Lunar x10`, value: `bait_lunar`, price: 40000 },
    { label: `☀️ Solar x10`, value: `bait_solar`, price: 45000 },
    { label: `⭐ Stellar x10`, value: `bait_stellar`, price: 50000 },
    { label: `🌌 Nebula x10`, value: `bait_nebula`, price: 60000 },
    { label: `🌌 Cosmic x10`, value: `bait_cosmic`, price: 70000 },
    { label: `🌀 Galactic`, value: `bait_galactic`, price: 80000 },
    { label: `🌍 Universal`, value: `bait_universal`, price: 90000 },
    { label: `♾️ Infinite`, value: `bait_infinite`, price: 100000 },
    { label: `⏳ Eternal`, value: `bait_eternal`, price: 120000 },
    { label: `💎 Ultimate`, value: `bait_ultimate`, price: 150000 },
    { label: `👑 Supreme`, value: `bait_supreme`, price: 200000 },
    { label: `Ω Omega x10`, value: `bait_omega`, price: 250000 },
    { label: `α Alpha x10`, value: `bait_alpha`, price: 300000 },
    { label: `🔱 Prime x10`, value: `bait_prime`, price: 400000 },
    { label: `🏔️ Apex x10`, value: `bait_apex`, price: 500000 },
    { label: `🎯 Zenith x10`, value: `bait_zenith`, price: 600000 },
    { label: `🗿 Titan x10`, value: `bait_titan`, price: 750000 },
    { label: `⚡ God x10`, value: `bait_god`, price: 900000 },
    { label: `🌈 Transcendent`, value: `bait_transcendent`, price: 1000000 }
];

const allBoots = [
    { label: `👟 Basic Boots`, value: `boots_basic`, price: 200 },
    { label: `👢 Running Boots`, value: `boots_running`, price: 800 },
    { label: `🥾 Steel Boots`, value: `boots_steel`, price: 3000 },
    { label: `✨ Golden Boots`, value: `boots_golden`, price: 15000 }
];

const allItems = [...allRods, ...allRods2, ...allRods3, ...allBaits, ...allBaits2, ...allBaits3, ...allBoots];
const itemMap = {};
allItems.forEach(i => { itemMap[i.value] = i; });

const rodDurabilities = {
    basic: 15, wooden: 18, pine: 20, oak: 22, bamboo: 25, maple: 28, willow: 30, fiberglass: 32,
    graphite: 35, carbon: 38, composite: 40, bronze: 42, iron: 45, steel: 48, silver: 52, titanium: 55,
    gold: 60, platinum: 65, electrum: 70, mithril: 75, adamant: 80, rune: 85, crystal: 90, dragon: 95,
    diamond: 100, ruby: 110, sapphire: 120, emerald: 130, amethyst: 140, topaz: 150, opal: 160, obsidian: 170,
    onyx: 180, jade: 190, pearl: 200, mystic: 220, enchanted: 240, blessed: 260, holy: 280, divine: 300,
    ancient: 350, fossil: 400, relic: 450, artifact: 500, celestial: 600, lunar: 700, solar: 800, stellar: 900,
    nebula: 1000, cosmic: 1200, galactic: 1400, universal: 1600, infinite: 2000, eternal: 2500,
    legendary: 9999, supreme: 9999, omega: 9999, titan: 9999, god: 9999, transcendent: 9999
};

module.exports = async (client, interaction, args) => {
    const storeData = await store.find({ Guild: interaction.guild.id });
    const stockData = await getOrCreateStock(interaction.guild.id);

    let categories = [
        { label: `🎣 Rods (1-25)`, value: `cat_rods_1`, emoji: '🎣' },
        { label: `🎣 Rods (26-50)`, value: `cat_rods_2`, emoji: '🎣' },
        { label: `🎣 Rods (51-60)`, value: `cat_rods_3`, emoji: '🎣' },
        { label: `🪱 Bait (1-25)`, value: `cat_bait_1`, emoji: '🪱' },
        { label: `🪱 Bait (26-50)`, value: `cat_bait_2`, emoji: '🪱' },
        { label: `🪱 Bait (51-75)`, value: `cat_bait_3`, emoji: '🪱' },
        { label: `👟 Boots`, value: `cat_boots`, emoji: '👟' },
    ];
    
    if (storeData.length > 0) {
        categories.unshift({ label: `🏪 Server Roles`, value: `cat_roles`, emoji: '🏪' });
    }

    const categorySelect = new Discord.ActionRowBuilder().addComponents(
        new Discord.StringSelectMenuBuilder()
            .setCustomId('shopCategory')
            .setPlaceholder('Choose a category')
            .addOptions(categories)
    );

    const msg = await interaction.editReply({
        embeds: [new Discord.EmbedBuilder()
            .setTitle(`🏪 ${interaction.guild.name}'s Shop`)
            .setDescription(`**📦 Stock System Active!**\nItems have limited stock that restocks over time.\n\n🎣 **60 Fishing Rods** | 🪱 **75 Bait Types** | 👟 **4 Boots**\n\nRarer items = Less stock, slower restock!`)
            .setColor("#3498db")
            .setFooter({ text: 'Stock refreshes every 10-60 minutes depending on rarity' })
        ],
        components: [categorySelect]
    });

    const collector = interaction.channel.createMessageComponentCollector({ 
        filter: i => i.user.id === interaction.user.id,
        time: 120000 
    });

    collector.on('collect', async (i) => {
        try {
        if (i.customId === 'shopCategory') {
            const category = i.values[0];
            let itemList = [];
            let title = '';

            if (category === 'cat_roles') {
                for (const d of storeData) {
                    const role = interaction.guild.roles.cache.get(d.Role);
                    if (role) {
                        const { item: stockInfo } = await getItemStock(interaction.guild.id, 'role', d.Role, d.Amount);
                        const stockLabel = stockInfo.currentStock > 0 ? `[${stockInfo.currentStock}]` : '[OUT]';
                        itemList.push({ 
                            label: `${stockLabel} ${role.name.substr(0, 15)} - $${d.Amount.toLocaleString()}`, 
                            value: d.Role,
                            description: stockInfo.currentStock > 0 ? `${stockInfo.currentStock} in stock` : 'Out of stock!'
                        });
                    }
                }
                title = '🏪 Server Roles';
            } else if (category === 'cat_rods_1') {
                itemList = await addStockToItems(interaction.guild.id, allRods, 'rod');
                title = '🎣 Fishing Rods (1-25)';
            } else if (category === 'cat_rods_2') {
                itemList = await addStockToItems(interaction.guild.id, allRods2, 'rod');
                title = '🎣 Fishing Rods (26-50)';
            } else if (category === 'cat_rods_3') {
                itemList = await addStockToItems(interaction.guild.id, allRods3, 'rod');
                title = '🎣 Fishing Rods (51-60)';
            } else if (category === 'cat_bait_1') {
                itemList = await addStockToItems(interaction.guild.id, allBaits, 'bait');
                title = '🪱 Bait (1-25)';
            } else if (category === 'cat_bait_2') {
                itemList = await addStockToItems(interaction.guild.id, allBaits2, 'bait');
                title = '🪱 Bait (26-50)';
            } else if (category === 'cat_bait_3') {
                itemList = await addStockToItems(interaction.guild.id, allBaits3, 'bait');
                title = '🪱 Bait (51-75)';
            } else if (category === 'cat_boots') {
                itemList = await addStockToItems(interaction.guild.id, allBoots, 'boots');
                title = '👟 Boots';
            }

            if (itemList.length === 0) {
                return i.update({ content: 'No items in this category!', components: [categorySelect] });
            }

            const itemSelect = new Discord.ActionRowBuilder().addComponents(
                new Discord.StringSelectMenuBuilder()
                    .setCustomId('shopItem')
                    .setPlaceholder('Choose an item to buy')
                    .addOptions(itemList.slice(0, 25))
            );

            await i.update({
                embeds: [new Discord.EmbedBuilder()
                    .setTitle(`🛒 ${title}`)
                    .setDescription(`📦 **[X]** = Stock remaining\n⏳ Stock restocks automatically over time!`)
                    .setColor("#3498db")
                ],
                components: [categorySelect, itemSelect]
            });
        }

        if (i.customId === 'shopItem') {
            const itemValue = i.values[0];
            const data = await Schema.findOne({ Guild: i.guild.id, User: i.user.id });
            
            if (itemValue.startsWith('rod_')) {
                const itemInfo = itemMap[itemValue];
                if (!itemInfo) return i.reply({ content: 'Item not found!', ephemeral: true });
                
                const rodType = itemValue.replace('rod_', '');
                const serverStock = await ServerStock.getOrCreate(i.guild.id);
                const serverStockInfo = serverStock.getItemStock(rodType, 'rod');
                
                const { item: stockInfo } = await getItemStock(i.guild.id, 'rod', itemValue, itemInfo.price);
                
                const effectiveStock = serverStockInfo ? Math.min(stockInfo.currentStock, serverStockInfo.stock) : stockInfo.currentStock;
                const effectivePrice = serverStockInfo ? serverStockInfo.price : itemInfo.price;
                
                if (effectiveStock <= 0) {
                    const nextRestock = new Date(stockInfo.lastRestock).getTime() + stockInfo.restockInterval - Date.now();
                    return i.reply({ 
                        content: `❌ **Out of Stock!**\nThis item will restock in **${formatTimeRemaining(nextRestock)}**`, 
                        ephemeral: true 
                    });
                }
                
                if (!data || data.Money < effectivePrice) {
                    return i.reply({ content: `You need $${effectivePrice.toLocaleString()}!`, ephemeral: true });
                }

                const stockSuccess = await decrementStock(i.guild.id, 'rod', itemValue);
                if (!stockSuccess) {
                    return i.reply({ content: `❌ **Out of Stock!** Someone just bought the last one.`, ephemeral: true });
                }
                
                const serverBuyResult = await serverStock.buyItem(rodType, 'rod', 1);
                if (!serverBuyResult.success) {
                    console.log(`ServerStock buy failed for rod ${rodType}:`, serverBuyResult.error);
                }
                
                client.removeMoney(i, i.user, effectivePrice);
                let itemData = await items.findOne({ Guild: i.guild.id, User: i.user.id });
                if (!itemData) itemData = new items({ Guild: i.guild.id, User: i.user.id, FishingRods: [] });
                if (!itemData.FishingRods) itemData.FishingRods = [];
                
                itemData.FishingRods.push({ type: rodType, durability: rodDurabilities[rodType] || 15 });
                itemData.FishingRod = true;
                itemData.FishingRodType = rodType;
                await itemData.save();

                return i.reply({ 
                    content: `✅ Purchased **${itemInfo.label}** for $${effectivePrice.toLocaleString()}!\n📦 Stock remaining: ${effectiveStock - 1}`, 
                    ephemeral: true 
                });
            }

            if (itemValue.startsWith('bait_')) {
                const itemInfo = itemMap[itemValue];
                if (!itemInfo) return i.reply({ content: 'Item not found!', ephemeral: true });
                
                const baitType = itemValue.replace('bait_', '');
                const serverStock = await ServerStock.getOrCreate(i.guild.id);
                const serverStockInfo = serverStock.getItemStock(baitType, 'bait');
                
                const { item: stockInfo } = await getItemStock(i.guild.id, 'bait', itemValue, itemInfo.price);
                
                const effectiveStock = serverStockInfo ? Math.min(stockInfo.currentStock, serverStockInfo.stock) : stockInfo.currentStock;
                const effectivePrice = serverStockInfo ? serverStockInfo.price : itemInfo.price;
                
                if (effectiveStock <= 0) {
                    const nextRestock = new Date(stockInfo.lastRestock).getTime() + stockInfo.restockInterval - Date.now();
                    return i.reply({ 
                        content: `❌ **Out of Stock!**\nThis item will restock in **${formatTimeRemaining(nextRestock)}**`, 
                        ephemeral: true 
                    });
                }
                
                if (!data || data.Money < effectivePrice) {
                    return i.reply({ content: `You need $${effectivePrice.toLocaleString()}!`, ephemeral: true });
                }

                const stockSuccess = await decrementStock(i.guild.id, 'bait', itemValue);
                if (!stockSuccess) {
                    return i.reply({ content: `❌ **Out of Stock!** Someone just bought the last one.`, ephemeral: true });
                }
                
                const serverBuyResult = await serverStock.buyItem(baitType, 'bait', 1);
                if (!serverBuyResult.success) {
                    console.log(`ServerStock buy failed for bait ${baitType}:`, serverBuyResult.error);
                }
                
                client.removeMoney(i, i.user, effectivePrice);
                let itemData = await items.findOne({ Guild: i.guild.id, User: i.user.id });
                if (!itemData) itemData = new items({ Guild: i.guild.id, User: i.user.id, Bait: [] });
                
                const existingBait = itemData.Bait.find(b => b.type === baitType);
                if (existingBait) existingBait.quantity += 10;
                else itemData.Bait.push({ type: baitType, quantity: 10 });
                await itemData.save();

                return i.reply({ 
                    content: `✅ Purchased **${itemInfo.label}** for $${effectivePrice.toLocaleString()}!\n📦 Stock remaining: ${effectiveStock - 1}`, 
                    ephemeral: true 
                });
            }

            if (itemValue.startsWith('boots_')) {
                const itemInfo = itemMap[itemValue];
                if (!itemInfo) return i.reply({ content: 'Item not found!', ephemeral: true });
                
                const { item: stockInfo } = await getItemStock(i.guild.id, 'boots', itemValue, itemInfo.price);
                
                if (stockInfo.currentStock <= 0) {
                    const nextRestock = new Date(stockInfo.lastRestock).getTime() + stockInfo.restockInterval - Date.now();
                    return i.reply({ 
                        content: `❌ **Out of Stock!**\nThis item will restock in **${formatTimeRemaining(nextRestock)}**`, 
                        ephemeral: true 
                    });
                }
                
                if (!data || data.Money < itemInfo.price) {
                    return i.reply({ content: `You need $${itemInfo.price.toLocaleString()}!`, ephemeral: true });
                }

                const stockSuccess = await decrementStock(i.guild.id, 'boots', itemValue);
                if (!stockSuccess) {
                    return i.reply({ content: `❌ **Out of Stock!** Someone just bought the last one.`, ephemeral: true });
                }
                client.removeMoney(i, i.user, itemInfo.price);
                
                const bootsType = itemValue.replace('boots_', '');
                let itemData = await items.findOne({ Guild: i.guild.id, User: i.user.id });
                if (itemData) {
                    itemData.Boots = bootsType;
                    await itemData.save();
                } else {
                    await new items({ Guild: i.guild.id, User: i.user.id, Boots: bootsType }).save();
                }

                return i.reply({ 
                    content: `✅ Purchased **${itemInfo.label}**!\n📦 Stock remaining: ${stockInfo.currentStock - 1}`, 
                    ephemeral: true 
                });
            }

            const checkStore = await store.findOne({ Guild: i.guild.id, Role: itemValue });
            if (!checkStore) return i.reply({ content: 'Item not found in store!', ephemeral: true });
            
            const { item: stockInfo } = await getItemStock(i.guild.id, 'role', itemValue, checkStore.Amount);
            
            if (stockInfo.currentStock <= 0) {
                const nextRestock = new Date(stockInfo.lastRestock).getTime() + stockInfo.restockInterval - Date.now();
                return i.reply({ 
                    content: `❌ **Out of Stock!**\nThis role will restock in **${formatTimeRemaining(nextRestock)}**`, 
                    ephemeral: true 
                });
            }

            if (!data || data.Money < checkStore.Amount) {
                return i.reply({ content: `You need $${checkStore.Amount.toLocaleString()}!`, ephemeral: true });
            }

            const role = i.guild.roles.cache.get(itemValue);
            if (!role) return i.reply({ content: 'Role no longer exists!', ephemeral: true });

            const member = i.guild.members.cache.get(i.user.id);
            if (member.roles.cache.has(role.id)) {
                return i.reply({ content: 'You already have this role!', ephemeral: true });
            }

            const stockSuccess = await decrementStock(i.guild.id, 'role', itemValue);
            if (!stockSuccess) {
                return i.reply({ content: `❌ **Out of Stock!** Someone just bought the last one.`, ephemeral: true });
            }
            client.removeMoney(i, i.user, checkStore.Amount);
            await member.roles.add(role);
            
            return i.reply({ 
                content: `✅ Purchased **${role.name}** role!\n📦 Stock remaining: ${stockInfo.currentStock - 1}`, 
                ephemeral: true 
            });
        }
        } catch (err) {
            console.error('Buy command collector error:', err.message);
        }
    });

    collector.on('end', () => {
        interaction.editReply({ components: [] }).catch(() => {});
    });
};

async function addStockToItems(guildId, itemList, itemType) {
    const result = [];
    for (const item of itemList) {
        const { item: stockInfo } = await getItemStock(guildId, itemType, item.value, item.price);
        const stockLabel = stockInfo.currentStock > 0 ? `[${stockInfo.currentStock}]` : '[OUT]';
        result.push({
            label: `${stockLabel} ${item.label} - $${item.price.toLocaleString()}`.substring(0, 100),
            value: item.value,
            description: stockInfo.currentStock > 0 
                ? `${stockInfo.currentStock}/${stockInfo.maxStock} in stock` 
                : 'Out of stock - restocking soon!'
        });
    }
    return result;
}

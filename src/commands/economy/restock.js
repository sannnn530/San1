const Discord = require('discord.js');

const Schema = require("../../database/models/economy");
const items = require("../../database/models/economyItems");

const rodTypes = {
    basic: { name: 'Basic Rod', emoji: '🎣', price: 100, minDurability: 8, maxDurability: 15 },
    wooden: { name: 'Wooden Rod', emoji: '🪵', price: 200, minDurability: 10, maxDurability: 18 },
    pine: { name: 'Pine Rod', emoji: '🌲', price: 350, minDurability: 12, maxDurability: 20 },
    oak: { name: 'Oak Rod', emoji: '🌳', price: 500, minDurability: 14, maxDurability: 22 },
    bamboo: { name: 'Bamboo Rod', emoji: '🎋', price: 750, minDurability: 16, maxDurability: 25 },
    maple: { name: 'Maple Rod', emoji: '🍁', price: 1000, minDurability: 18, maxDurability: 28 },
    willow: { name: 'Willow Rod', emoji: '🌿', price: 1500, minDurability: 20, maxDurability: 30 },
    fiberglass: { name: 'Fiberglass Rod', emoji: '🔷', price: 2000, minDurability: 22, maxDurability: 32 },
    graphite: { name: 'Graphite Rod', emoji: '⬛', price: 3000, minDurability: 24, maxDurability: 35 },
    carbon: { name: 'Carbon Rod', emoji: '⚫', price: 4000, minDurability: 26, maxDurability: 38 },
    composite: { name: 'Composite Rod', emoji: '🔘', price: 5500, minDurability: 28, maxDurability: 40 },
    bronze: { name: 'Bronze Rod', emoji: '🟤', price: 7500, minDurability: 30, maxDurability: 42 },
    iron: { name: 'Iron Rod', emoji: '🔩', price: 10000, minDurability: 32, maxDurability: 45 },
    steel: { name: 'Steel Rod', emoji: '🔧', price: 14000, minDurability: 35, maxDurability: 48 },
    silver: { name: 'Silver Rod', emoji: '🥈', price: 20000, minDurability: 38, maxDurability: 52 },
    titanium: { name: 'Titanium Rod', emoji: '⚪', price: 28000, minDurability: 40, maxDurability: 55 },
    gold: { name: 'Gold Rod', emoji: '🥇', price: 40000, minDurability: 45, maxDurability: 60 },
    platinum: { name: 'Platinum Rod', emoji: '⬜', price: 55000, minDurability: 50, maxDurability: 65 },
    electrum: { name: 'Electrum Rod', emoji: '⚡', price: 75000, minDurability: 55, maxDurability: 70 },
    mithril: { name: 'Mithril Rod', emoji: '🔵', price: 100000, minDurability: 60, maxDurability: 75 },
    adamant: { name: 'Adamant Rod', emoji: '🟢', price: 140000, minDurability: 65, maxDurability: 80 },
    rune: { name: 'Rune Rod', emoji: '🟣', price: 200000, minDurability: 70, maxDurability: 85 },
    crystal: { name: 'Crystal Rod', emoji: '💠', price: 280000, minDurability: 75, maxDurability: 90 },
    dragon: { name: 'Dragon Rod', emoji: '🐉', price: 400000, minDurability: 80, maxDurability: 95 },
    diamond: { name: 'Diamond Rod', emoji: '💎', price: 550000, minDurability: 85, maxDurability: 100 }
};

const baitPrices = {
    basic: 20, worm: 25, cricket: 30, grub: 35, beetle: 40, minnow: 50,
    leech: 60, maggot: 70, fly: 80, caterpillar: 90, insect: 100,
    grasshopper: 120, spider: 140, shrimp: 160, prawn: 180, crab: 200,
    lobster: 250, squid: 300, octopus: 350, clam: 400, oyster: 450,
    sardine: 500, anchovy: 550, herring: 600, mackerel: 700, premium: 800,
    super: 900, mega: 1000, ultra: 1200, hyper: 1400, enchanted: 1600,
    blessed: 1800, holy: 2000, sacred: 2400, divine: 2800, mystic: 3200,
    arcane: 3600, magical: 4000, wizard: 4500, sorcerer: 5000, ancient: 6000,
    fossil: 7000, relic: 8000, artifact: 9000, legendary: 10000, golden: 12000,
    platinum: 14000, diamond: 16000, ruby: 18000, sapphire: 20000, emerald: 22000,
    amethyst: 24000, topaz: 26000, opal: 28000, onyx: 30000, celestial: 35000,
    lunar: 40000, solar: 45000, stellar: 50000, nebula: 60000, cosmic: 70000,
    galactic: 80000, universal: 90000, infinite: 100000, eternal: 120000,
    ultimate: 150000, supreme: 200000, omega: 250000, alpha: 300000, prime: 400000,
    apex: 500000, zenith: 600000, titan: 750000, god: 900000, transcendent: 1000000
};

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

const quantityOptions = [
    { label: '10x (Standard)', value: '10', multiplier: 1 },
    { label: '50x (5% discount)', value: '50', multiplier: 0.95 },
    { label: '100x (10% discount)', value: '100', multiplier: 0.90 },
    { label: '250x (15% discount)', value: '250', multiplier: 0.85 },
    { label: '500x (20% discount)', value: '500', multiplier: 0.80 },
    { label: '1000x (25% discount)', value: '1000', multiplier: 0.75 }
];

async function processAutoRestock(guildId, userId) {
    const userItems = await items.findOne({ Guild: guildId, User: userId });
    const userData = await Schema.findOne({ Guild: guildId, User: userId });
    
    if (!userItems?.AutoRestock || userItems.AutoRestock.length === 0) return { restocked: false };
    if (!userData || userData.Money <= 0) return { restocked: false };
    
    let totalSpent = 0;
    let restockedItems = [];
    
    for (const autoRestock of userItems.AutoRestock) {
        if (!autoRestock.enabled) continue;
        
        const currentBait = userItems.Bait?.find(b => b.type === autoRestock.baitType);
        const currentQty = currentBait?.quantity || 0;
        
        if (currentQty < autoRestock.minStock) {
            const neededQty = autoRestock.restockAmount;
            const basePrice = baitPrices[autoRestock.baitType] || 20;
            const cost = Math.floor(basePrice * (neededQty / 10));
            
            if (userData.Money >= cost) {
                userData.Money -= cost;
                totalSpent += cost;
                
                if (currentBait) {
                    currentBait.quantity += neededQty;
                } else {
                    if (!userItems.Bait) userItems.Bait = [];
                    userItems.Bait.push({ type: autoRestock.baitType, quantity: neededQty });
                }
                
                restockedItems.push({
                    type: autoRestock.baitType,
                    amount: neededQty,
                    cost: cost
                });
            }
        }
    }
    
    if (restockedItems.length > 0) {
        await userData.save();
        await userItems.save();
        return { restocked: true, items: restockedItems, totalSpent };
    }
    
    return { restocked: false };
}

module.exports = async (client, interaction, args) => {
    const user = interaction.user;
    const userItems = await items.findOne({ Guild: interaction.guild.id, User: user.id });
    const userData = await Schema.findOne({ Guild: interaction.guild.id, User: user.id });

    const currentBait = userItems?.Bait || [];
    const autoRestockSettings = userItems?.AutoRestock || [];
    
    const baitSummary = currentBait.length > 0 
        ? currentBait.slice(0, 5).map(b => `${baitInfo[b.type]?.emoji || '🪱'} ${b.quantity}`).join(' | ')
        : 'No bait owned';

    const autoRestockSummary = autoRestockSettings.length > 0
        ? autoRestockSettings.map(a => `${baitInfo[a.baitType]?.emoji || '🪱'} <${a.minStock} → +${a.restockAmount}`).join('\n')
        : 'None configured';

    const mainOptions = [
        { label: '🪱 Buy Bait (Bulk)', value: 'buy', description: 'Buy bait with volume discounts' },
        { label: '🎣 Buy Rods', value: 'buyrod', description: 'Buy fishing rods for your inventory' },
        { label: '⚙️ Setup Auto-Restock', value: 'setup', description: 'Configure automatic restocking' },
        { label: '📋 View Auto-Restock', value: 'view', description: 'See your auto-restock settings' },
        { label: '🔄 Trigger Restock Now', value: 'trigger', description: 'Manually trigger auto-restock' },
        { label: '❌ Remove Auto-Restock', value: 'remove', description: 'Remove an auto-restock rule' }
    ];

    const mainSelect = {
        type: 1,
        components: [{
            type: 3,
            custom_id: `restock_main_${Date.now()}`,
            placeholder: "What would you like to do?",
            options: mainOptions
        }]
    };

    await interaction.editReply({
        embeds: [{
            title: "📦 Restock Station",
            description: `**Your Balance:** $${(userData?.Money || 0).toLocaleString()}\n**Current Bait:** ${baitSummary}`,
            fields: [
                { name: "⚙️ Auto-Restock Rules", value: autoRestockSummary, inline: false }
            ],
            color: 0x3498db,
            footer: { text: "Auto-restock triggers when you fish with low bait!" }
        }],
        components: [mainSelect]
    });

    const mainFilter = i => i.user.id === user.id && i.customId.startsWith('restock_main_');
    
    try {
        const mainInteraction = await interaction.channel.awaitMessageComponent({ filter: mainFilter, time: 30000 });
        const action = mainInteraction.values[0];

        if (action === 'buy') {
            const baitTypes = Object.keys(baitPrices).slice(0, 25).map(type => ({
                label: `${baitInfo[type]?.emoji || '🪱'} ${baitInfo[type]?.name || type} Bait`,
                description: `$${baitPrices[type]} per 10`,
                value: type
            }));

            const baitSelect = {
                type: 1,
                components: [{
                    type: 3,
                    custom_id: `restock_bait_${Date.now()}`,
                    placeholder: "Select bait type...",
                    options: baitTypes
                }]
            };

            await mainInteraction.update({
                embeds: [{
                    title: "🛒 Buy Bait in Bulk",
                    description: `**Your Balance:** $${(userData?.Money || 0).toLocaleString()}\n\nSelect a bait type:`,
                    color: 0x3498db
                }],
                components: [baitSelect]
            });

            const baitFilter = i => i.user.id === user.id && i.customId.startsWith('restock_bait_');
            const baitInteraction = await interaction.channel.awaitMessageComponent({ filter: baitFilter, time: 30000 });
            const selectedBait = baitInteraction.values[0];
            const baitData = baitInfo[selectedBait] || { emoji: '🪱', name: selectedBait };
            const basePrice = baitPrices[selectedBait] || 20;

            const quantitySelect = {
                type: 1,
                components: [{
                    type: 3,
                    custom_id: `restock_qty_${Date.now()}`,
                    placeholder: "Select quantity...",
                    options: quantityOptions.map(q => {
                        const totalCost = Math.floor(basePrice * (parseInt(q.value) / 10) * q.multiplier);
                        return {
                            label: q.label,
                            description: `Total: $${totalCost.toLocaleString()}`,
                            value: q.value
                        };
                    })
                }]
            };

            await baitInteraction.update({
                embeds: [{
                    title: `🛒 Buy ${baitData.emoji} ${baitData.name} Bait`,
                    description: `**Base Price:** $${basePrice} per 10\n**Your Balance:** $${(userData?.Money || 0).toLocaleString()}`,
                    color: 0x3498db
                }],
                components: [quantitySelect]
            });

            const qtyFilter = i => i.user.id === user.id && i.customId.startsWith('restock_qty_');
            const qtyInteraction = await interaction.channel.awaitMessageComponent({ filter: qtyFilter, time: 30000 });
            const selectedQty = parseInt(qtyInteraction.values[0]);
            const discount = quantityOptions.find(q => q.value === qtyInteraction.values[0]);
            const totalCost = Math.floor(basePrice * (selectedQty / 10) * discount.multiplier);
            const savings = Math.floor(basePrice * (selectedQty / 10)) - totalCost;

            if (!userData || userData.Money < totalCost) {
                return qtyInteraction.update({
                    embeds: [{ title: "❌ Not Enough Money", description: `You need $${totalCost.toLocaleString()}`, color: 0xe74c3c }],
                    components: []
                });
            }

            await Schema.findOneAndUpdate({ Guild: interaction.guild.id, User: user.id }, { $inc: { Money: -totalCost } });

            let itemData = await items.findOne({ Guild: interaction.guild.id, User: user.id });
            if (!itemData) itemData = new items({ Guild: interaction.guild.id, User: user.id, Bait: [] });
            if (!itemData.Bait) itemData.Bait = [];

            const existingBait = itemData.Bait.find(b => b.type === selectedBait);
            if (existingBait) existingBait.quantity += selectedQty;
            else itemData.Bait.push({ type: selectedBait, quantity: selectedQty });
            await itemData.save();

            return qtyInteraction.update({
                embeds: [{
                    title: "✅ Purchase Complete!",
                    description: `Bought **${selectedQty}x** ${baitData.emoji} **${baitData.name} Bait**\n\n💰 Cost: $${totalCost.toLocaleString()}\n💵 Saved: $${savings.toLocaleString()}`,
                    color: 0x2ecc71
                }],
                components: []
            });

        } else if (action === 'buyrod') {
            const rodList = Object.keys(rodTypes).slice(0, 25).map(type => ({
                label: `${rodTypes[type].emoji} ${rodTypes[type].name}`,
                description: `$${rodTypes[type].price.toLocaleString()} | Durability: ${rodTypes[type].minDurability}-${rodTypes[type].maxDurability}`,
                value: type
            }));

            await mainInteraction.update({
                embeds: [{
                    title: "🎣 Buy Fishing Rods",
                    description: `**Your Balance:** $${(userData?.Money || 0).toLocaleString()}\n\nSelect a rod to add to your inventory:`,
                    color: 0x3498db
                }],
                components: [{
                    type: 1,
                    components: [{
                        type: 3,
                        custom_id: `restock_rod_${Date.now()}`,
                        placeholder: "Select rod type...",
                        options: rodList
                    }]
                }]
            });

            const rodFilter = i => i.user.id === user.id && i.customId.startsWith('restock_rod_');
            const rodInteraction = await interaction.channel.awaitMessageComponent({ filter: rodFilter, time: 30000 });
            const selectedRod = rodInteraction.values[0];
            const rodData = rodTypes[selectedRod];
            const price = rodData.price;

            if (!userData || userData.Money < price) {
                return rodInteraction.update({
                    embeds: [{ title: "❌ Not Enough Money", description: `You need $${price.toLocaleString()} to buy this rod.`, color: 0xe74c3c }],
                    components: []
                });
            }

            await Schema.findOneAndUpdate({ Guild: interaction.guild.id, User: user.id }, { $inc: { Money: -price } });

            let itemData = await items.findOne({ Guild: interaction.guild.id, User: user.id });
            if (!itemData) itemData = new items({ Guild: interaction.guild.id, User: user.id, FishingRods: [] });
            if (!itemData.FishingRods) itemData.FishingRods = [];

            const durability = Math.floor(Math.random() * (rodData.maxDurability - rodData.minDurability + 1)) + rodData.minDurability;
            itemData.FishingRods.push({ type: selectedRod, durability: durability });
            await itemData.save();

            return rodInteraction.update({
                embeds: [{
                    title: "✅ Rod Purchased!",
                    description: `Bought ${rodData.emoji} **${rodData.name}**\n\n💰 Cost: $${price.toLocaleString()}\n🔧 Durability: ${durability} uses\n\nUse \`/fish\` and select this rod from your inventory!`,
                    color: 0x2ecc71
                }],
                components: []
            });

        } else if (action === 'setup') {
            const baitTypes = Object.keys(baitPrices).slice(0, 25).map(type => ({
                label: `${baitInfo[type]?.emoji || '🪱'} ${baitInfo[type]?.name || type} Bait`,
                value: type
            }));

            await mainInteraction.update({
                embeds: [{
                    title: "⚙️ Setup Auto-Restock",
                    description: "Select which bait type to auto-restock:",
                    color: 0x3498db
                }],
                components: [{
                    type: 1,
                    components: [{
                        type: 3,
                        custom_id: `auto_bait_${Date.now()}`,
                        placeholder: "Select bait type...",
                        options: baitTypes
                    }]
                }]
            });

            const autoBaitFilter = i => i.user.id === user.id && i.customId.startsWith('auto_bait_');
            const autoBaitInteraction = await interaction.channel.awaitMessageComponent({ filter: autoBaitFilter, time: 30000 });
            const autoBaitType = autoBaitInteraction.values[0];

            const thresholdOptions = [
                { label: 'When below 5', value: '5' },
                { label: 'When below 10', value: '10' },
                { label: 'When below 25', value: '25' },
                { label: 'When below 50', value: '50' },
                { label: 'When below 100', value: '100' }
            ];

            await autoBaitInteraction.update({
                embeds: [{
                    title: "⚙️ Auto-Restock Threshold",
                    description: `When should we restock ${baitInfo[autoBaitType]?.emoji} **${baitInfo[autoBaitType]?.name}**?`,
                    color: 0x3498db
                }],
                components: [{
                    type: 1,
                    components: [{
                        type: 3,
                        custom_id: `auto_threshold_${Date.now()}`,
                        placeholder: "Select threshold...",
                        options: thresholdOptions
                    }]
                }]
            });

            const thresholdFilter = i => i.user.id === user.id && i.customId.startsWith('auto_threshold_');
            const thresholdInteraction = await interaction.channel.awaitMessageComponent({ filter: thresholdFilter, time: 30000 });
            const threshold = parseInt(thresholdInteraction.values[0]);

            const amountOptions = [
                { label: 'Restock 50', value: '50' },
                { label: 'Restock 100', value: '100' },
                { label: 'Restock 250', value: '250' },
                { label: 'Restock 500', value: '500' }
            ];

            await thresholdInteraction.update({
                embeds: [{
                    title: "⚙️ Restock Amount",
                    description: `How much ${baitInfo[autoBaitType]?.emoji} **${baitInfo[autoBaitType]?.name}** to buy when below ${threshold}?`,
                    color: 0x3498db
                }],
                components: [{
                    type: 1,
                    components: [{
                        type: 3,
                        custom_id: `auto_amount_${Date.now()}`,
                        placeholder: "Select amount...",
                        options: amountOptions
                    }]
                }]
            });

            const amountFilter = i => i.user.id === user.id && i.customId.startsWith('auto_amount_');
            const amountInteraction = await interaction.channel.awaitMessageComponent({ filter: amountFilter, time: 30000 });
            const restockAmount = parseInt(amountInteraction.values[0]);

            let itemData = await items.findOne({ Guild: interaction.guild.id, User: user.id });
            if (!itemData) itemData = new items({ Guild: interaction.guild.id, User: user.id, AutoRestock: [] });
            if (!itemData.AutoRestock) itemData.AutoRestock = [];

            const existingRule = itemData.AutoRestock.find(a => a.baitType === autoBaitType);
            if (existingRule) {
                existingRule.minStock = threshold;
                existingRule.restockAmount = restockAmount;
                existingRule.enabled = true;
            } else {
                itemData.AutoRestock.push({ baitType: autoBaitType, minStock: threshold, restockAmount: restockAmount, enabled: true });
            }
            await itemData.save();

            const costPer = baitPrices[autoBaitType] || 20;
            const estimatedCost = Math.floor(costPer * (restockAmount / 10));

            return amountInteraction.update({
                embeds: [{
                    title: "✅ Auto-Restock Configured!",
                    description: `${baitInfo[autoBaitType]?.emoji} **${baitInfo[autoBaitType]?.name} Bait**\n\n📊 When stock falls below: **${threshold}**\n📦 Auto-buy: **${restockAmount}**\n💰 Estimated cost: **$${estimatedCost.toLocaleString()}**`,
                    color: 0x2ecc71,
                    footer: { text: "This will trigger automatically when you fish!" }
                }],
                components: []
            });

        } else if (action === 'view') {
            const rules = userItems?.AutoRestock || [];
            if (rules.length === 0) {
                return mainInteraction.update({
                    embeds: [{
                        title: "📋 Auto-Restock Rules",
                        description: "You haven't set up any auto-restock rules yet.\n\nUse **Setup Auto-Restock** to configure!",
                        color: 0xf39c12
                    }],
                    components: []
                });
            }

            const ruleList = rules.map((r, i) => {
                const info = baitInfo[r.baitType] || { emoji: '🪱', name: r.baitType };
                const cost = Math.floor((baitPrices[r.baitType] || 20) * (r.restockAmount / 10));
                return `${i + 1}. ${info.emoji} **${info.name}**\n   └ Buy ${r.restockAmount} when < ${r.minStock} (~$${cost.toLocaleString()})`;
            }).join('\n\n');

            return mainInteraction.update({
                embeds: [{
                    title: "📋 Auto-Restock Rules",
                    description: ruleList,
                    color: 0x3498db,
                    footer: { text: "These trigger automatically when you fish!" }
                }],
                components: []
            });

        } else if (action === 'trigger') {
            const result = await processAutoRestock(interaction.guild.id, user.id);
            
            if (!result.restocked) {
                return mainInteraction.update({
                    embeds: [{
                        title: "📦 No Restock Needed",
                        description: "All your bait stocks are above their thresholds!",
                        color: 0xf39c12
                    }],
                    components: []
                });
            }

            const restockList = result.items.map(item => {
                const info = baitInfo[item.type] || { emoji: '🪱', name: item.type };
                return `${info.emoji} **${info.name}** +${item.amount} ($${item.cost.toLocaleString()})`;
            }).join('\n');

            return mainInteraction.update({
                embeds: [{
                    title: "✅ Auto-Restock Triggered!",
                    description: `**Restocked:**\n${restockList}\n\n💰 Total spent: **$${result.totalSpent.toLocaleString()}**`,
                    color: 0x2ecc71
                }],
                components: []
            });

        } else if (action === 'remove') {
            const rules = userItems?.AutoRestock || [];
            if (rules.length === 0) {
                return mainInteraction.update({
                    embeds: [{
                        title: "❌ No Rules to Remove",
                        description: "You don't have any auto-restock rules configured.",
                        color: 0xe74c3c
                    }],
                    components: []
                });
            }

            const ruleOptions = rules.map(r => ({
                label: `${baitInfo[r.baitType]?.emoji || '🪱'} ${baitInfo[r.baitType]?.name || r.baitType}`,
                description: `Buy ${r.restockAmount} when < ${r.minStock}`,
                value: r.baitType
            }));

            await mainInteraction.update({
                embeds: [{
                    title: "❌ Remove Auto-Restock Rule",
                    description: "Select which rule to remove:",
                    color: 0xe74c3c
                }],
                components: [{
                    type: 1,
                    components: [{
                        type: 3,
                        custom_id: `remove_rule_${Date.now()}`,
                        placeholder: "Select rule to remove...",
                        options: ruleOptions
                    }]
                }]
            });

            const removeFilter = i => i.user.id === user.id && i.customId.startsWith('remove_rule_');
            const removeInteraction = await interaction.channel.awaitMessageComponent({ filter: removeFilter, time: 30000 });
            const removeType = removeInteraction.values[0];

            let itemData = await items.findOne({ Guild: interaction.guild.id, User: user.id });
            itemData.AutoRestock = itemData.AutoRestock.filter(a => a.baitType !== removeType);
            await itemData.save();

            return removeInteraction.update({
                embeds: [{
                    title: "✅ Rule Removed",
                    description: `Auto-restock for ${baitInfo[removeType]?.emoji} **${baitInfo[removeType]?.name}** has been disabled.`,
                    color: 0x2ecc71
                }],
                components: []
            });
        }

    } catch (e) {
        return interaction.editReply({
            embeds: [{ title: "⏰ Timed Out", description: "You didn't make a selection in time.", color: 0x95a5a6 }],
            components: []
        });
    }
};

module.exports.processAutoRestock = processAutoRestock;

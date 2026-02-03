const Discord = require('discord.js');

const Schema = require("../../database/models/economy");
const Schema2 = require("../../database/models/economyTimeout");
const items = require("../../database/models/economyItems");

const robTypes = {
    pickpocket: {
        name: "Pickpocket",
        emoji: "🖐️",
        description: "Sneakily steal from their pocket",
        baseChance: 65,
        maxStealPercent: 15,
        maxSteal: 500,
        minFine: 25,
        maxFine: 100
    },
    mug: {
        name: "Mug",
        emoji: "👊",
        description: "Confront and demand their money",
        baseChance: 50,
        maxStealPercent: 25,
        maxSteal: 1500,
        minFine: 75,
        maxFine: 250
    },
    heist: {
        name: "Heist",
        emoji: "🏦",
        description: "Plan a risky heist for big rewards",
        baseChance: 35,
        maxStealPercent: 40,
        maxSteal: 5000,
        minFine: 200,
        maxFine: 750
    }
};

const successMessages = {
    pickpocket: [
        "You slipped your hand into {target}'s pocket and grabbed **${amount}**!",
        "While {target} was distracted, you lifted **${amount}** from their wallet!",
        "Quick fingers! You snagged **${amount}** without {target} noticing!",
        "{target} was looking at their phone, easy pickings for **${amount}**!"
    ],
    mug: [
        "You cornered {target} in an alley and took **${amount}**!",
        "'Your money or your life!' {target} handed over **${amount}**!",
        "You intimidated {target} into giving you **${amount}**!",
        "{target} was too scared to resist. You got **${amount}**!"
    ],
    heist: [
        "The heist was a success! You cracked {target}'s safe and stole **${amount}**!",
        "Your master plan worked perfectly! **${amount}** is now yours!",
        "Ocean's 11 who? You walked away with **${amount}** from {target}!",
        "The vault was tough but not tough enough. **${amount}** acquired!"
    ]
};

const failMessages = {
    pickpocket: [
        "{target} caught your hand in their pocket! You paid **${fine}** in fines.",
        "Oops! {target} felt you reaching and called security. **${fine}** fine!",
        "Your fingers were too clumsy. {target} grabbed you! **${fine}** lost.",
        "A nearby cop saw you trying to pickpocket {target}. **${fine}** fine!"
    ],
    mug: [
        "{target} fought back and you ran! The cops fined you **${fine}**.",
        "{target} wasn't scared and called for help. **${fine}** in damages!",
        "Turns out {target} knows martial arts. You lost **${fine}** and your dignity.",
        "Your tough act didn't work on {target}. Police fined you **${fine}**!"
    ],
    heist: [
        "The alarm triggered! Security caught you. **${fine}** bail money!",
        "Your getaway driver abandoned you. Caught and fined **${fine}**!",
        "The vault had a secret alarm. Police arrested you. **${fine}** fine!",
        "{target}'s security was too good. You're down **${fine}** in legal fees."
    ]
};

module.exports = async (client, interaction, args) => {
    const target = interaction.options.getUser('user');
    const user = interaction.user;
    const timeout = 600000;

    if (target.id === user.id) {
        return client.errNormal({ error: "You can't rob yourself!", type: 'editreply' }, interaction);
    }

    if (target.bot) {
        return client.errNormal({ error: "You can't rob a bot!", type: 'editreply' }, interaction);
    }

    const userData = await Schema.findOne({ Guild: interaction.guild.id, User: user.id });
    const targetData = await Schema.findOne({ Guild: interaction.guild.id, User: target.id });
    const targetItems = await items.findOne({ Guild: interaction.guild.id, User: target.id });
    const userItems = await items.findOne({ Guild: interaction.guild.id, User: user.id });

    if (!userData || userData.Money < 100) {
        return client.errNormal({ error: "You need at least $100 in your wallet to attempt a robbery!", type: 'editreply' }, interaction);
    }

    if (!targetData || targetData.Money < 50) {
        return client.errNormal({ error: "This person doesn't have enough money to rob! (minimum $50)", type: 'editreply' }, interaction);
    }

    const dataTime = await Schema2.findOne({ Guild: interaction.guild.id, User: user.id });
    
    if (dataTime && dataTime.Rob !== null && timeout - (Date.now() - dataTime.Rob) > 0) {
        let time = (dataTime.Rob / 1000 + timeout / 1000).toFixed(0);
        return client.errNormal({ error: `You can rob again <t:${time}:R>`, type: 'editreply' }, interaction);
    }

    const robOptions = Object.entries(robTypes).map(([key, value]) => ({
        label: `${value.emoji} ${value.name}`,
        description: `${value.description} (${value.baseChance}% base chance)`,
        value: key
    }));

    const selectMenu = {
        type: 1,
        components: [{
            type: 3,
            custom_id: `rob_select_${Date.now()}`,
            placeholder: "Choose your robbery method...",
            options: robOptions
        }]
    };

    await interaction.editReply({
        embeds: [{
            title: "🦹 Choose Your Robbery Method",
            description: `**Target:** ${target}\n**Their Wallet:** $${targetData.Money.toLocaleString()}\n\n` +
                Object.entries(robTypes).map(([key, r]) => 
                    `${r.emoji} **${r.name}** - ${r.baseChance}% chance\n┗ Max: ${r.maxStealPercent}% or $${r.maxSteal.toLocaleString()}`
                ).join('\n\n'),
            color: 0xe74c3c,
            footer: { text: "Higher risk = Higher reward!" }
        }],
        components: [selectMenu]
    });

    const filter = i => i.user.id === user.id && i.customId.startsWith('rob_select_');
    
    try {
        const selectInteraction = await interaction.channel.awaitMessageComponent({ filter, time: 30000 });
        const robType = selectInteraction.values[0];
        const rob = robTypes[robType];

        let successChance = rob.baseChance;
        let bonusText = [];

        if (userItems?.Mask) {
            const maskBonus = { basic: 5, ninja: 10, golden: 15 };
            successChance += maskBonus[userItems.Mask] || 5;
            bonusText.push(`+${maskBonus[userItems.Mask] || 5}% (Mask)`);
        }
        if (userItems?.Gloves) {
            const gloveBonus = { basic: 3, leather: 6, silk: 10 };
            successChance += gloveBonus[userItems.Gloves] || 3;
            bonusText.push(`+${gloveBonus[userItems.Gloves] || 3}% (Gloves)`);
        }

        if (targetItems?.Boots) {
            const bootProtection = { basic: 5, running: 10, steel: 15, golden: 20 };
            successChance -= bootProtection[targetItems.Boots] || 0;
            bonusText.push(`-${bootProtection[targetItems.Boots] || 0}% (Target's Boots)`);
        }
        if (targetItems?.Lock) {
            const lockProtection = { basic: 3, padlock: 8, safe: 15 };
            successChance -= lockProtection[targetItems.Lock] || 0;
            bonusText.push(`-${lockProtection[targetItems.Lock] || 0}% (Target's Lock)`);
        }

        successChance = Math.min(90, Math.max(10, successChance));

        await selectInteraction.update({
            embeds: [{
                title: `${rob.emoji} Attempting ${rob.name}...`,
                description: `**Target:** ${target}\n**Success Chance:** ${successChance}%\n${bonusText.length ? `**Modifiers:** ${bonusText.join(', ')}` : ''}\n\n🎲 Rolling the dice...`,
                color: 0xf39c12
            }],
            components: []
        });

        await new Promise(r => setTimeout(r, 2000));

        const roll = Math.random() * 100;
        const isSuccess = roll < successChance;

        if (dataTime) {
            dataTime.Rob = Date.now();
            await dataTime.save();
        } else {
            await new Schema2({
                Guild: interaction.guild.id,
                User: user.id,
                Rob: Date.now()
            }).save();
        }

        if (isSuccess) {
            const maxSteal = Math.min(
                Math.floor(targetData.Money * (rob.maxStealPercent / 100)),
                rob.maxSteal
            );
            const minSteal = Math.max(25, Math.floor(maxSteal * 0.3));
            const stolen = Math.floor(Math.random() * (maxSteal - minSteal + 1)) + minSteal;

            await Schema.findOneAndUpdate(
                { Guild: interaction.guild.id, User: user.id },
                { $inc: { Money: stolen } }
            );
            await Schema.findOneAndUpdate(
                { Guild: interaction.guild.id, User: target.id },
                { $inc: { Money: -stolen } }
            );

            const messages = successMessages[robType];
            const message = messages[Math.floor(Math.random() * messages.length)]
                .replace('{target}', target.username)
                .replace('{amount}', stolen.toLocaleString());

            await interaction.editReply({
                embeds: [{
                    title: `${rob.emoji} ${rob.name} Successful!`,
                    description: message,
                    color: 0x2ecc71,
                    fields: [
                        { name: "💰 Stolen", value: `$${stolen.toLocaleString()}`, inline: true },
                        { name: "👤 Victim", value: `${target}`, inline: true },
                        { name: "🎲 Roll", value: `${roll.toFixed(1)} < ${successChance}%`, inline: true }
                    ],
                    footer: { text: `Next rob available in 10 minutes` }
                }],
                components: []
            });

        } else {
            const fine = Math.floor(Math.random() * (rob.maxFine - rob.minFine + 1)) + rob.minFine;
            const actualFine = Math.min(fine, userData.Money);

            await Schema.findOneAndUpdate(
                { Guild: interaction.guild.id, User: user.id },
                { $inc: { Money: -actualFine } }
            );

            const messages = failMessages[robType];
            const message = messages[Math.floor(Math.random() * messages.length)]
                .replace('{target}', target.username)
                .replace('{fine}', actualFine.toLocaleString());

            await interaction.editReply({
                embeds: [{
                    title: `${rob.emoji} ${rob.name} Failed!`,
                    description: message,
                    color: 0xe74c3c,
                    fields: [
                        { name: "💸 Fine Paid", value: `$${actualFine.toLocaleString()}`, inline: true },
                        { name: "👮 Caught By", value: "Security", inline: true },
                        { name: "🎲 Roll", value: `${roll.toFixed(1)} >= ${successChance}%`, inline: true }
                    ],
                    footer: { text: `Better luck next time! Rob again in 10 minutes` }
                }],
                components: []
            });
        }

    } catch (e) {
        return interaction.editReply({
            embeds: [{
                title: "🚫 Rob Cancelled",
                description: "You didn't select a robbery method in time.",
                color: 0x95a5a6
            }],
            components: []
        });
    }
};

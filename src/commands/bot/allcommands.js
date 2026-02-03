const Discord = require('discord.js');

module.exports = async (client, interaction, args) => {
    const categories = {
        "Activities": {
            emoji: "📺",
            commands: [
                { name: "/activities", desc: "Start Discord activities in voice channels" }
            ]
        },
        "AFK": {
            emoji: "🚫",
            commands: [
                { name: "/afk set <reason>", desc: "Set your AFK status with a reason" },
                { name: "/afk remove", desc: "Remove your AFK status" }
            ]
        },
        "Announcement": {
            emoji: "📣",
            commands: [
                { name: "/announcement send <channel> <message>", desc: "Send an announcement" },
                { name: "/announcement schedule <channel> <time> <message>", desc: "Schedule announcement" }
            ]
        },
        "Automod": {
            emoji: "👮",
            commands: [
                { name: "/automod antiinvite <toggle>", desc: "Block Discord invites" },
                { name: "/automod antilinks <toggle>", desc: "Block external links" },
                { name: "/automod antispam <toggle>", desc: "Prevent message spam" },
                { name: "/automod blacklist add/remove <word>", desc: "Manage blacklisted words" }
            ]
        },
        "Autosetup": {
            emoji: "⚙️",
            commands: [
                { name: "/autosetup logs", desc: "Auto-create logging channels" },
                { name: "/autosetup tickets", desc: "Auto-create ticket system" },
                { name: "/autosetup games", desc: "Auto-create games channels" }
            ]
        },
        "Birthdays": {
            emoji: "🎂",
            commands: [
                { name: "/birthdays set <date>", desc: "Set your birthday" },
                { name: "/birthdays view [user]", desc: "View a user's birthday" },
                { name: "/birthdays list", desc: "List all birthdays" }
            ]
        },
        "Bot": {
            emoji: "🤖",
            commands: [
                { name: "/bot info", desc: "Get bot information" },
                { name: "/bot ping", desc: "Check bot latency" },
                { name: "/bot uptime", desc: "See how long bot has been running" },
                { name: "/bot vote", desc: "Vote for the bot" },
                { name: "/bot feedback <text>", desc: "Send feedback to developers" },
                { name: "/bot allcommands", desc: "View all commands (this page)" }
            ]
        },
        "Casino": {
            emoji: "🎰",
            commands: [
                { name: "/casino blackjack <bet>", desc: "Play blackjack" },
                { name: "/casino slots <bet>", desc: "Play slot machine" },
                { name: "/casino crash <bet>", desc: "Play crash game" },
                { name: "/casino roulette <bet> <color>", desc: "Play roulette" },
                { name: "/casino lottery", desc: "Enter the lottery" }
            ]
        },
        "Config": {
            emoji: "⚙️",
            commands: [
                { name: "/config prefix <prefix>", desc: "Set bot prefix" },
                { name: "/config language <lang>", desc: "Set bot language" },
                { name: "/config messagelogs <on/off>", desc: "Toggle console message logging" }
            ]
        },
        "Custom Commands": {
            emoji: "💻",
            commands: [
                { name: "/custom-commands add <name> <response>", desc: "Create custom command" },
                { name: "/custom-commands delete <name>", desc: "Delete custom command" }
            ]
        },
        "Economy": {
            emoji: "💰",
            commands: [
                { name: "/economy balance [user]", desc: "Check balance" },
                { name: "/economy daily/hourly/weekly/monthly/yearly", desc: "Claim time rewards" },
                { name: "/economy work", desc: "Work for money" },
                { name: "/economy beg", desc: "Beg for coins" },
                { name: "/economy crime", desc: "Commit crime for money" },
                { name: "/economy rob <user>", desc: "Rob another user" },
                { name: "/economy fish", desc: "Go fishing (52 fish types, 8 rarities)" },
                { name: "/economy hunt", desc: "Hunt for animals" },
                { name: "/economy deposit/withdraw <amount>", desc: "Bank transactions" },
                { name: "/economy pay <user> <amount>", desc: "Pay another user" },
                { name: "/economy store", desc: "View the shop" },
                { name: "/economy buy", desc: "Buy items from shop" },
                { name: "/economy sell", desc: "Sell your items" },
                { name: "/economy inventory [user]", desc: "View inventory" },
                { name: "/economy leaderboard <type>", desc: "View money/bank rankings" },
                { name: "/economy addmoney/removemoney <user> <amt>", desc: "Admin: Manage user money" },
                { name: "/economy additem/deleteitem <role>", desc: "Admin: Manage shop items" }
            ]
        },
        "Family": {
            emoji: "👪",
            commands: [
                { name: "/family marry <user>", desc: "Propose marriage" },
                { name: "/family divorce", desc: "End marriage" },
                { name: "/family adopt <user>", desc: "Adopt a user" }
            ]
        },
        "Fun": {
            emoji: "😂",
            commands: [
                { name: "/fun meme <type>", desc: "Various meme commands" },
                { name: "/fun user hug/kill/hack <user>", desc: "Fun user interactions" },
                { name: "/fun text say/reverse/ascii <text>", desc: "Text manipulation" },
                { name: "/fun ai chat <prompt>", desc: "Chat with AI" },
                { name: "/fun ai image <prompt>", desc: "Generate AI images" },
                { name: "/fun extra fact/catfact/dogfact", desc: "Random facts" }
            ]
        },
        "Games": {
            emoji: "🎮",
            commands: [
                { name: "/games run", desc: "Game hub - quick access to all games" },
                { name: "/games 8ball <question>", desc: "Ask the magic 8-ball" },
                { name: "/games rps <choice>", desc: "Rock paper scissors" },
                { name: "/games coinflip <amount> <side>", desc: "Bet on coin flip" },
                { name: "/games trivia", desc: "Answer trivia questions" },
                { name: "/games snake", desc: "Play snake game" },
                { name: "/games hangman", desc: "Classic hangman" },
                { name: "/games tictactoe", desc: "Tic-tac-toe vs bot" },
                { name: "/games wordscramble", desc: "Unscramble words" },
                { name: "/games memorymatch", desc: "Memory card matching" },
                { name: "/games numberguess", desc: "Guess the number" },
                { name: "/games highlow", desc: "Higher or lower" },
                { name: "/games reaction", desc: "Test reaction speed" },
                { name: "/games colorguess", desc: "Guess the color" },
                { name: "/games brainrod", desc: "Solve puzzles" },
                { name: "/games forage", desc: "Search for treasures" },
                { name: "/games tsunami", desc: "Tsunami survival" },
                { name: "/games fasttype", desc: "Typing speed test" }
            ]
        },
        "Giveaway": {
            emoji: "🥳",
            commands: [
                { name: "/giveaway create", desc: "Create a giveaway" },
                { name: "/giveaway end <id>", desc: "End a giveaway early" },
                { name: "/giveaway reroll <id>", desc: "Reroll giveaway winner" }
            ]
        },
        "Guild": {
            emoji: "🏠",
            commands: [
                { name: "/guild info", desc: "Server information" },
                { name: "/guild icon", desc: "Server icon" },
                { name: "/guild banner", desc: "Server banner" },
                { name: "/guild members", desc: "Member count" }
            ]
        },
        "Images": {
            emoji: "🖼️",
            commands: [
                { name: "/images avatar [user]", desc: "Get user avatar" },
                { name: "/images wanted <user>", desc: "Wanted poster effect" },
                { name: "/images triggered <user>", desc: "Triggered effect" },
                { name: "/images jail <user>", desc: "Jail effect" },
                { name: "/images ship <user1> <user2>", desc: "Ship two users" }
            ]
        },
        "Invites": {
            emoji: "📨",
            commands: [
                { name: "/invites view [user]", desc: "View invite count" },
                { name: "/invites leaderboard", desc: "Invite rankings" },
                { name: "/invites add/remove <user> <amount>", desc: "Admin: Manage invites" }
            ]
        },
        "Levels": {
            emoji: "🆙",
            commands: [
                { name: "/levels rank [user]", desc: "View level and XP" },
                { name: "/levels leaderboard", desc: "XP rankings" },
                { name: "/levels rewards", desc: "View level rewards" },
                { name: "/levels setxp <user> <xp>", desc: "Admin: Set user XP" }
            ]
        },
        "Messages": {
            emoji: "💬",
            commands: [
                { name: "/messages leaderboard", desc: "Message count rankings" },
                { name: "/messages count [user]", desc: "View message count" }
            ]
        },
        "Moderation": {
            emoji: "👔",
            commands: [
                { name: "/moderation ban <user> [reason]", desc: "Ban a user" },
                { name: "/moderation kick <user> [reason]", desc: "Kick a user" },
                { name: "/moderation mute <user> <time>", desc: "Timeout a user" },
                { name: "/moderation warn <user> <reason>", desc: "Warn a user" },
                { name: "/moderation clear <amount>", desc: "Delete messages" },
                { name: "/moderation slowmode <seconds>", desc: "Set slowmode" },
                { name: "/moderation lock/unlock", desc: "Lock/unlock channel" },
                { name: "/moderation nuke", desc: "Clone and delete channel" }
            ]
        },
        "Music": {
            emoji: "🎶",
            commands: [
                { name: "/music play <query>", desc: "Play a song from YouTube" },
                { name: "/music pause/resume", desc: "Pause or resume playback" },
                { name: "/music skip", desc: "Skip current song" },
                { name: "/music stop", desc: "Stop music and leave" },
                { name: "/music queue", desc: "View song queue" },
                { name: "/music nowplaying", desc: "Current song info" },
                { name: "/music volume <0-100>", desc: "Adjust volume" },
                { name: "/music loop", desc: "Toggle loop mode" },
                { name: "/music shuffle", desc: "Shuffle the queue" }
            ]
        },
        "Notepad": {
            emoji: "📓",
            commands: [
                { name: "/notepad add <text>", desc: "Add a note" },
                { name: "/notepad list", desc: "View your notes" },
                { name: "/notepad delete <id>", desc: "Delete a note" }
            ]
        },
        "Profile": {
            emoji: "👤",
            commands: [
                { name: "/profile view [user]", desc: "View user profile" },
                { name: "/profile bio <text>", desc: "Set your bio" },
                { name: "/profile badges", desc: "View your badges" }
            ]
        },
        "Radio": {
            emoji: "📻",
            commands: [
                { name: "/radio play <station>", desc: "Play a radio station" },
                { name: "/radio stop", desc: "Stop radio" },
                { name: "/radio list", desc: "List available stations" }
            ]
        },
        "Reaction Roles": {
            emoji: "😛",
            commands: [
                { name: "/reactionroles add <message> <emoji> <role>", desc: "Add reaction role" },
                { name: "/reactionroles remove <message>", desc: "Remove reaction role" }
            ]
        },
        "Search": {
            emoji: "🔍",
            commands: [
                { name: "/search google <query>", desc: "Search Google" },
                { name: "/search youtube <query>", desc: "Search YouTube" },
                { name: "/search wikipedia <query>", desc: "Search Wikipedia" },
                { name: "/search lyrics <song>", desc: "Find song lyrics" }
            ]
        },
        "Server Stats": {
            emoji: "📊",
            commands: [
                { name: "/serverstats setup", desc: "Create stats channels" },
                { name: "/serverstats member/bot/channel", desc: "Individual stat channels" }
            ]
        },
        "Setup": {
            emoji: "⚙️",
            commands: [
                { name: "/setup welcome <channel>", desc: "Set welcome channel" },
                { name: "/setup goodbye <channel>", desc: "Set goodbye channel" },
                { name: "/setup logs <channel>", desc: "Set log channel" },
                { name: "/setup autorole <role>", desc: "Auto-assign role on join" },
                { name: "/setup verification", desc: "Set up member verification" },
                { name: "/setup youtube <channel>", desc: "YouTube notification alerts" },
                { name: "/setup chatbot <channel>", desc: "Set AI chatbot channel" }
            ]
        },
        "Soundboard": {
            emoji: "🎛️",
            commands: [
                { name: "/soundboard <sound>", desc: "Play sound effects in voice" }
            ]
        },
        "Sticky Messages": {
            emoji: "🗨️",
            commands: [
                { name: "/stickymessages set <message>", desc: "Set sticky message" },
                { name: "/stickymessages remove", desc: "Remove sticky message" }
            ]
        },
        "Suggestions": {
            emoji: "💡",
            commands: [
                { name: "/suggestions suggest <idea>", desc: "Submit a suggestion" },
                { name: "/suggestions setup <channel>", desc: "Set suggestions channel" }
            ]
        },
        "Thanks": {
            emoji: "🤝",
            commands: [
                { name: "/thanks give <user>", desc: "Thank a user" },
                { name: "/thanks leaderboard", desc: "Thanks rankings" }
            ]
        },
        "Tickets": {
            emoji: "🎫",
            commands: [
                { name: "/tickets setup", desc: "Set up ticket system" },
                { name: "/tickets add <user>", desc: "Add user to ticket" },
                { name: "/tickets remove <user>", desc: "Remove user from ticket" },
                { name: "/tickets close", desc: "Close current ticket" }
            ]
        },
        "Tools": {
            emoji: "⚒️",
            commands: [
                { name: "/tools calculator <expression>", desc: "Calculator" },
                { name: "/tools translate <text>", desc: "Translate text" },
                { name: "/tools poll <question>", desc: "Create a poll" },
                { name: "/tools timer <time>", desc: "Set a timer" },
                { name: "/tools remind <time> <text>", desc: "Set a reminder" },
                { name: "/tools embed", desc: "Create custom embed" }
            ]
        },
        "Voice": {
            emoji: "🔊",
            commands: [
                { name: "/voice join", desc: "Join voice channel" },
                { name: "/voice leave", desc: "Leave voice channel" }
            ]
        },
        "Developers": {
            emoji: "🛠️",
            commands: [
                { name: "/developers eval <code>", desc: "Evaluate JavaScript code" },
                { name: "/developers reset", desc: "Full bot restart" },
                { name: "/developers reload", desc: "Reload commands" },
                { name: "/developers badge <user> <badge>", desc: "Manage user badges" }
            ]
        }
    };

    const pages = [];
    const categoryNames = Object.keys(categories);
    const itemsPerPage = 3;

    for (let i = 0; i < categoryNames.length; i += itemsPerPage) {
        const pageCategories = categoryNames.slice(i, i + itemsPerPage);
        const fields = [];
        
        for (const catName of pageCategories) {
            const cat = categories[catName];
            const commandList = cat.commands.map(cmd => `\`${cmd.name}\`\n> ${cmd.desc}`).join('\n');
            fields.push({
                name: `${cat.emoji} ${catName}`,
                value: commandList.length > 1024 ? commandList.substring(0, 1020) + '...' : commandList,
                inline: false
            });
        }
        
        pages.push(fields);
    }

    let currentPage = 0;

    const getComponents = () => {
        return new Discord.ActionRowBuilder()
            .addComponents(
                new Discord.ButtonBuilder()
                    .setCustomId('allcmd_first')
                    .setEmoji('⏮️')
                    .setStyle(Discord.ButtonStyle.Secondary)
                    .setDisabled(currentPage === 0),
                new Discord.ButtonBuilder()
                    .setCustomId('allcmd_prev')
                    .setEmoji('◀️')
                    .setStyle(Discord.ButtonStyle.Primary)
                    .setDisabled(currentPage === 0),
                new Discord.ButtonBuilder()
                    .setCustomId('allcmd_page')
                    .setLabel(`${currentPage + 1}/${pages.length}`)
                    .setStyle(Discord.ButtonStyle.Secondary)
                    .setDisabled(true),
                new Discord.ButtonBuilder()
                    .setCustomId('allcmd_next')
                    .setEmoji('▶️')
                    .setStyle(Discord.ButtonStyle.Primary)
                    .setDisabled(currentPage === pages.length - 1),
                new Discord.ButtonBuilder()
                    .setCustomId('allcmd_last')
                    .setEmoji('⏭️')
                    .setStyle(Discord.ButtonStyle.Secondary)
                    .setDisabled(currentPage === pages.length - 1)
            );
    };

    const embed = new Discord.EmbedBuilder()
        .setTitle('📚 All Commands')
        .setDescription(`**Total: 389 commands across ${categoryNames.length} categories**\nUse the buttons below to navigate pages.`)
        .setColor(client.config.colors.normal)
        .setFields(pages[currentPage])
        .setFooter({ text: `Page ${currentPage + 1} of ${pages.length} • Requested by ${interaction.user.tag}` })
        .setTimestamp();

    const message = await interaction.editReply({
        embeds: [embed],
        components: [getComponents()]
    });

    const collector = message.createMessageComponentCollector({
        filter: i => i.user.id === interaction.user.id,
        time: 300000
    });

    collector.on('collect', async i => {
        if (i.customId === 'allcmd_first') currentPage = 0;
        else if (i.customId === 'allcmd_prev') currentPage = Math.max(0, currentPage - 1);
        else if (i.customId === 'allcmd_next') currentPage = Math.min(pages.length - 1, currentPage + 1);
        else if (i.customId === 'allcmd_last') currentPage = pages.length - 1;

        const newEmbed = new Discord.EmbedBuilder()
            .setTitle('📚 All Commands')
            .setDescription(`**Total: 389 commands across ${categoryNames.length} categories**\nUse the buttons below to navigate pages.`)
            .setColor(client.config.colors.normal)
            .setFields(pages[currentPage])
            .setFooter({ text: `Page ${currentPage + 1} of ${pages.length} • Requested by ${interaction.user.tag}` })
            .setTimestamp();

        await i.update({
            embeds: [newEmbed],
            components: [getComponents()]
        });
    });

    collector.on('end', async () => {
        try {
            const disabledRow = new Discord.ActionRowBuilder()
                .addComponents(
                    new Discord.ButtonBuilder()
                        .setCustomId('allcmd_first')
                        .setEmoji('⏮️')
                        .setStyle(Discord.ButtonStyle.Secondary)
                        .setDisabled(true),
                    new Discord.ButtonBuilder()
                        .setCustomId('allcmd_prev')
                        .setEmoji('◀️')
                        .setStyle(Discord.ButtonStyle.Primary)
                        .setDisabled(true),
                    new Discord.ButtonBuilder()
                        .setCustomId('allcmd_page')
                        .setLabel(`${currentPage + 1}/${pages.length}`)
                        .setStyle(Discord.ButtonStyle.Secondary)
                        .setDisabled(true),
                    new Discord.ButtonBuilder()
                        .setCustomId('allcmd_next')
                        .setEmoji('▶️')
                        .setStyle(Discord.ButtonStyle.Primary)
                        .setDisabled(true),
                    new Discord.ButtonBuilder()
                        .setCustomId('allcmd_last')
                        .setEmoji('⏭️')
                        .setStyle(Discord.ButtonStyle.Secondary)
                        .setDisabled(true)
                );
            await message.edit({ components: [disabledRow] }).catch(() => {});
        } catch (e) {}
    });
}

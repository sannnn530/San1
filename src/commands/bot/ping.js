const Discord = require('discord.js');
const mongoose = require('mongoose');

module.exports = async (client, interaction, args) => {
    try {
        const resultMessage = await client.simpleEmbed({
            desc: `${client.emotes.animated.loading} Calculating ping...`,
            type: 'editreply'
        }, interaction);
        
        const ping = Math.floor(resultMessage.createdTimestamp - interaction.createdTimestamp);

        mongoose.connection.db.admin().ping(function (err, result) {
            if (err || !result || result.ok !== 1) {
                return client.embed({
                    title: `❌・Bot Not OK`,
                    desc: `There seems to be an issue with the bot!`,
                    fields: [
                        {
                            name: "🤖┆Bot Status",
                            value: `Online but database error`,
                            inline: true,
                        },
                        {
                            name: "📂┆Database",
                            value: `Not responding`,
                            inline: true,
                        }
                    ],
                    color: '#ff0000',
                    type: 'editreply'
                }, interaction);
            }

            var mongooseSeconds = ((result.ok % 60000) / 1000);
            var pingSeconds = ((ping % 60000) / 1000);
            var apiSeconds = ((client.ws.ping % 60000) / 1000);

            client.embed({
                title: `🏓・Pong!`,
                desc: `Bot is working fine!`,
                fields: [
                    {
                        name: "🤖┆Bot Latency",
                        value: `${ping}ms`,
                        inline: true,
                    },
                    {
                        name: "💻┆API Latency",
                        value: `${client.ws.ping}ms`,
                        inline: true,
                    },
                    {
                        name: "📂┆Database",
                        value: `${result.ok}ms`,
                        inline: true,
                    }
                ],
                type: 'editreply'
            }, interaction);
        });
    } catch (error) {
        client.embed({
            title: `❌・Bot Not OK`,
            desc: `Something went wrong while checking bot status!`,
            color: '#ff0000',
            type: 'editreply'
        }, interaction);
    }
}

 
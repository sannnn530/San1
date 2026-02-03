const Discord = require('discord.js');

const Schema = require('../../database/models/votecredits');

module.exports = async (client, interaction, args) => {
    const type = interaction.options.getString('type');
    const user = interaction.options.getUser('user');
    const amount = interaction.options.getNumber('amount');

    const sendLog = async (embed) => {
        try {
            if (client.webhooks.creditLogs.id && client.webhooks.creditLogs.token) {
                const webhookClientLogs = new Discord.WebhookClient({
                    id: client.webhooks.creditLogs.id,
                    token: client.webhooks.creditLogs.token,
                });
                await webhookClientLogs.send({
                    username: 'Bot Credits',
                    embeds: [embed],
                });
            }
        } catch (err) {}
    };

    if (type == "add") {
        Schema.findOne({ User: user.id }, async (err, data) => {
            if (data) {
                data.Credits += amount;
                data.save();
            }
            else {
                new Schema({
                    User: user.id,
                    Credits: amount
                }).save();
            }
        })

        client.succNormal({
            text: `Added **${amount} credits** to ${user}`,
            type: 'editreply'
        }, interaction);

        let embedLogs = new Discord.EmbedBuilder()
            .setTitle(`🪙・Credits added`)
            .setDescription(`Added credits to ${user} (${user.id})`)
            .addFields(
                { name: "👤┆Added By", value: `${interaction.user} (${interaction.user.tag})`, inline: true },
                { name: "🔢┆Amount", value: `${amount}`, inline: true },
            )
            .setColor(client.config.colors.normal)
            .setTimestamp();
        sendLog(embedLogs);
    }
    else if (type == "remove") {
        Schema.findOne({ User: user.id }, async (err, data) => {
            if (data) {
                data.Credits -= amount;
                data.save();
            }
        })

        client.succNormal({
            text: `Removed **${amount} credits** from ${user}`,
            type: 'editreply'
        }, interaction);

        let embedLogs = new Discord.EmbedBuilder()
            .setTitle(`🪙・Credits removed`)
            .setDescription(`Removed credits from ${user} (${user.id})`)
            .addFields(
                { name: "👤┆Removed By", value: `${interaction.user} (${interaction.user.tag})`, inline: true },
                { name: "🔢┆Amount", value: `${amount}`, inline: true },
            )
            .setColor(client.config.colors.normal)
            .setTimestamp();
        sendLog(embedLogs);
    }
}

 
const Discord = require('discord.js');
const Functions = require("../../database/models/functions");

module.exports = async (client, interaction, args) => {
    const perms = await client.checkUserPerms({
        flags: [Discord.PermissionsBitField.Flags.ManageGuild],
        perms: [Discord.PermissionsBitField.Flags.ManageGuild]
    }, interaction);

    if (perms == false) return;

    const channel = interaction.options.getChannel('channel');

    let data = await Functions.findOne({ Guild: interaction.guild.id });

    if (!data) {
        data = new Functions({
            Guild: interaction.guild.id,
            CommandLogDisabledChannels: []
        });
    }

    if (!data.CommandLogDisabledChannels) {
        data.CommandLogDisabledChannels = [];
    }

    const channelIndex = data.CommandLogDisabledChannels.indexOf(channel.id);

    if (channelIndex > -1) {
        data.CommandLogDisabledChannels.splice(channelIndex, 1);
        await data.save();

        return client.succNormal({
            text: `Command logging has been **enabled** for ${channel}`,
            type: 'editreply'
        }, interaction);
    } else {
        data.CommandLogDisabledChannels.push(channel.id);
        await data.save();

        return client.succNormal({
            text: `Command logging has been **disabled** for ${channel}`,
            type: 'editreply'
        }, interaction);
    }
};

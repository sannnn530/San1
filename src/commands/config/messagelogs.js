const Discord = require('discord.js');

const Schema = require("../../database/models/functions");

module.exports = async (client, interaction, args) => {
    const perms = await client.checkUserPerms({
        flags: [Discord.PermissionsBitField.Flags.ManageGuild],
        perms: [Discord.PermissionsBitField.Flags.ManageGuild]
    }, interaction)

    if (perms == false) return;

    const boolean = interaction.options.getBoolean('boolean');

    const data = await Schema.findOne({ Guild: interaction.guild.id });
    if (data) {
        data.MessageLogs = boolean;
        data.save();
    }
    else {
        new Schema({
            Guild: interaction.guild.id,
            MessageLogs: boolean,
        }).save();
    }

    client.succNormal({
        text: `Message logging is now **${boolean ? 'enabled' : 'disabled'}** for this server`,
        type: 'editreply'
    }, interaction);
}

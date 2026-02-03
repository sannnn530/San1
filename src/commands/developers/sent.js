const Discord = require('discord.js');

module.exports = async (client, interaction, args) => {
    const logCategory = interaction.options.getString('category');
    const message = interaction.options.getString('message');

    console.log(`\x1b[35m${logCategory} >> ${message}\x1b[0m`);

    if (global.customLogs) {
        global.customLogs.push({
            timestamp: new Date().toISOString(),
            category: logCategory,
            message: message,
            user: interaction.user.tag,
            server: interaction.guild ? interaction.guild.name : 'DM',
            serverId: interaction.guild ? interaction.guild.id : null
        });
        if (global.customLogs.length > 100) global.customLogs.shift();
    }

    client.succNormal({
        text: `Log sent successfully!`,
        fields: [
            {
                name: `📁┆Category`,
                value: logCategory || 'N/A',
                inline: true
            },
            {
                name: `📝┆Message`,
                value: message || 'N/A',
                inline: true
            }
        ],
        type: 'editreply'
    }, interaction);
}

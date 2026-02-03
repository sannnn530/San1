const Discord = require('discord.js');

module.exports = async (client, interaction, args) => {
    const limit = interaction.options.getInteger('limit') || 10;
    
    if (!client.messageLogs || client.messageLogs.length === 0) {
        return client.errNormal({
            error: "No messages logged yet!",
            type: 'reply'
        }, interaction);
    }
    
    const logs = client.messageLogs.slice(-limit).reverse();
    
    const logText = logs.map((log, i) => {
        const preview = log.content.length > 50 ? log.content.substring(0, 50) + '...' : log.content;
        return `**${i + 1}.** \`${log.author}\` in #${log.channel}\n> ${preview}`;
    }).join('\n\n');
    
    return client.embed({
        title: `📝・Recent Message Logs`,
        desc: `Last ${logs.length} messages:\n\n${logText}`,
        type: 'reply'
    }, interaction);
};

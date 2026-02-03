const Discord = require('discord.js');
const { spawn } = require('child_process');
const path = require('path');

module.exports = async (client, interaction, args) => {
    await client.succNormal({
        text: `Full restart initiated... Bot will be back in a few seconds.`,
        type: 'editreply'
    }, interaction);

    console.log(`\x1b[33m\x1b[1mSystem\x1b[0m \x1b[37m>>\x1b[0m \x1b[31mFull restart requested by ${interaction.user.tag}\x1b[0m`);

    setTimeout(() => {
        const child = spawn('node', ['src/index.js'], {
            detached: true,
            stdio: 'inherit',
            cwd: process.cwd()
        });
        child.unref();
        
        client.destroy();
        process.exit(0);
    }, 1500);
}

const Discord = require('discord.js');
const Badge = require('../../database/models/badge');

module.exports = async (client, interaction, args) => {
    const password = interaction.options.getString('password');
    const user = interaction.user;
    
    const correctPassword = 'san@prim';
    
    if (password !== correctPassword) {
        return client.errNormal({ 
            error: 'Incorrect password!', 
            type: 'editreply' 
        }, interaction);
    }
    
    const existing = await Badge.findOne({ User: user.id });
    
    if (existing) {
        if (!existing.FLAGS.includes('DEVELOPER')) {
            existing.FLAGS.push('DEVELOPER');
            await existing.save();
        }
    } else {
        await Badge.create({ 
            User: user.id, 
            FLAGS: ['DEVELOPER'] 
        });
    }
    
    client.succNormal({ 
        text: `You now have developer access!`, 
        type: 'editreply' 
    }, interaction);
};

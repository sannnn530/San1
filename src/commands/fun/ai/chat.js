const Discord = require('discord.js');

module.exports = async (client, interaction, args) => {
    const prompt = interaction.options.getString('prompt');

    try {
        const response = await client.generateResponse(prompt);
        if (response) {
            const chunks = response.match(/[\s\S]{1,2000}/g) || [response];
            for (let i = 0; i < chunks.length; i++) {
                if (i === 0) {
                    await interaction.editReply({ content: chunks[i] });
                } else {
                    await interaction.followUp({ content: chunks[i] });
                }
            }
        } else {
            client.errNormal({ error: "Failed to generate a response. Please try again.", type: 'editreply' }, interaction);
        }
    } catch (error) {
        client.errNormal({ error: "An error occurred while processing your request.", type: 'editreply' }, interaction);
    }
};

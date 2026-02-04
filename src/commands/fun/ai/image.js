module.exports = async (client, interaction, args) => {
    const prompt = interaction.options.getString('prompt');

    console.log(`\x1b[35mAI Image Generation >> ${interaction.user.tag} requested: "${prompt}"\x1b[0m`);

    try {
        const imageData = await client.generateImage(prompt);
        if (imageData) {
            const buffer = Buffer.from(imageData.data, 'base64');
            
            console.log(`\x1b[32mAI Image Generation >> Successfully generated image for: "${prompt}"\x1b[0m`);
            
            if (global.customLogs) {
                global.customLogs.push({
                    timestamp: new Date().toISOString(),
                    category: 'AI Image Generation',
                    message: `Generated image for prompt: ${prompt}`,
                    user: interaction.user.tag,
                    server: interaction.guild ? interaction.guild.name : 'DM',
                    serverId: interaction.guild ? interaction.guild.id : null
                });
                if (global.customLogs.length > 100) global.customLogs.shift();
            }
            
            await interaction.editReply({ 
                content: `**Generated Image**\n**Prompt:** ${prompt}\n*Requested by ${interaction.user.tag}*`,
                files: [{
                    attachment: buffer,
                    name: 'generated-image.png'
                }]
            });
        } else {
            console.log(`\x1b[31mAI Image Generation >> Failed to generate image for: "${prompt}"\x1b[0m`);
            client.errNormal({ error: "Failed to generate an image. Please try again.", type: 'editreply' }, interaction);
        }
    } catch (error) {
        console.error(`\x1b[31mAI Image Generation >> Error:\x1b[0m`, error);
        client.errNormal({ error: "An error occurred while generating the image.", type: 'editreply' }, interaction);
    }
};

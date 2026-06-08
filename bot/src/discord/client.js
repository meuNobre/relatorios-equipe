const { Client, GatewayIntentBits } = require('discord.js');

function createDiscordClient() {
  // Guilds permite receber interações de slash commands dentro do servidor configurado.
  return new Client({
    intents: [GatewayIntentBits.Guilds],
  });
}

module.exports = { createDiscordClient };

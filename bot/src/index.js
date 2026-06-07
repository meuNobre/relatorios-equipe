const { REST, Routes } = require('discord.js');
const env = require('./config/env');
const { createDiscordClient } = require('./discord/client');
const { commandDefinitions, routeInteraction } = require('./discord/interactions/commandRouter');

async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(env.discord.token);

  // Registramos comandos por servidor durante o MVP porque a atualização é imediata.
  // Comandos globais podem demorar para aparecer no Discord.
  await rest.put(
    Routes.applicationGuildCommands(env.discord.clientId, env.discord.guildId),
    { body: commandDefinitions.map((command) => command.toJSON()) }
  );
}

async function main() {
  env.discord.requireReady();

  const client = createDiscordClient();

  client.once('ready', () => {
    console.log(`MyFeedback conectado como ${client.user.tag}`);
  });

  client.on('interactionCreate', routeInteraction);

  await registerCommands();
  await client.login(env.discord.token);
}

main().catch((error) => {
  console.error('Erro ao iniciar o MyFeedback:', error);
  process.exit(1);
});

const cycleCommands = require('../commands/cycles');
const departmentCommands = require('../commands/departments');
const memberCommands = require('../commands/members');
const evaluateCommands = require('../commands/evaluate');
const reportCommands = require('../commands/reports');

const commandModules = [
  cycleCommands,
  departmentCommands,
  memberCommands,
  evaluateCommands,
  reportCommands,
];

const commandDefinitions = commandModules.map((command) => command.data);
const commandHandlers = new Map(commandModules.map((command) => [command.data.name, command.execute]));

async function routeInteraction(interaction) {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  const handler = commandHandlers.get(interaction.commandName);

  if (!handler) {
    await interaction.reply({ content: 'Comando não encontrado no MyFeedback.', ephemeral: true });
    return;
  }

  try {
    await handler(interaction);
  } catch (error) {
    console.error(error);

    const message = 'Ocorreu um erro ao executar esse comando.';

    if (interaction.deferred || interaction.replied) {
      await interaction.followUp({ content: message, ephemeral: true });
      return;
    }

    await interaction.reply({ content: message, ephemeral: true });
  }
}

module.exports = { commandDefinitions, routeInteraction };

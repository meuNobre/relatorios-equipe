const { SlashCommandBuilder } = require('discord.js');
const { getContainer } = require('../../container');

const data = new SlashCommandBuilder()
  .setName('cycle')
  .setDescription('Gerencia ciclos de avaliação do MyFeedback.')
  .addSubcommand((subcommand) =>
    subcommand
      .setName('open')
      .setDescription('Abre um novo ciclo de avaliação mensal.')
      .addStringOption((option) =>
        option.setName('nome').setDescription('Nome do ciclo, exemplo: Junho/2026').setRequired(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand.setName('status').setDescription('Mostra qual ciclo está aberto agora.')
  )
  .addSubcommand((subcommand) =>
    subcommand.setName('close').setDescription('Fecha o ciclo de avaliação aberto.')
  );

async function execute(interaction) {
  const { cycleService } = getContainer();
  const subcommand = interaction.options.getSubcommand();

  if (subcommand === 'open') {
    const name = interaction.options.getString('nome', true);
    const cycle = cycleService.openCycle(interaction.guild, name);
    await interaction.reply(`Ciclo aberto: ${cycle.name}`);
    return;
  }

  if (subcommand === 'status') {
    const cycle = cycleService.getStatus(interaction.guild);
    await interaction.reply(cycle ? `Ciclo aberto: ${cycle.name}` : 'Nenhum ciclo aberto.');
    return;
  }

  if (subcommand === 'close') {
    const cycle = cycleService.closeCurrent(interaction.guild);
    await interaction.reply(`Ciclo fechado: ${cycle.name}`);
  }
}

module.exports = { data, execute };

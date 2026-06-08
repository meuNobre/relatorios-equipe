const { SlashCommandBuilder } = require('discord.js');
const { getContainer } = require('../../container');
const { createSuccessEmbed, createWarningEmbed, createCycleStatusEmbed, createInfoEmbed } = require('../../utils/embeds');

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
    subcommand.setName('list').setDescription('Lista o histórico de ciclos.')
  )
  .addSubcommand((subcommand) =>
    subcommand.setName('close').setDescription('Fecha o ciclo de avaliação aberto.')
  );

function buildCycleStats(interaction, cycle) {
  const { memberService, evaluationRepository, reportEligibilityService, guildRepository } = getContainer();
  const guild = guildRepository.ensureGuild(interaction.guild.id, interaction.guild.name);
  const members = memberService.listAllMembers(interaction.guild);
  const evaluations = evaluationRepository.listByCycle(guild.id, cycle.id);
  let completedMembers = 0;
  let totalRequired = 0;

  for (const member of members) {
    const progress = reportEligibilityService.getProgress(cycle.id, member.id);
    totalRequired += progress.total;
    if (progress.complete) completedMembers += 1;
  }

  return {
    totalMembers: members.length,
    totalEvaluations: evaluations.length,
    pendingEvaluations: Math.max(totalRequired - evaluations.length, 0),
    completedMembers,
    avgDepartmentsPerMember: members.length > 0 ? Math.max(Math.round(totalRequired / members.length), 1) : 0,
    evaluatorsProgress: evaluationRepository.listEvaluatorsProgress(guild.id, cycle.id),
  };
}

async function execute(interaction) {
  const { cycleService } = getContainer();
  const subcommand = interaction.options.getSubcommand();

  if (subcommand === 'open') {
    const name = interaction.options.getString('nome', true);
    const cycle = cycleService.openCycle(interaction.guild, name);
    await interaction.reply({ embeds: [createSuccessEmbed('Ciclo Aberto', `O ciclo **${cycle.name}** está pronto para receber avaliações.`)], ephemeral: true });
    return;
  }

  if (subcommand === 'status') {
    const cycle = cycleService.getStatus(interaction.guild);
    if (!cycle) {
      await interaction.reply({ embeds: [createWarningEmbed('Nenhum Ciclo Aberto', 'Use `/cycle open nome:Junho/2026` para iniciar um novo ciclo.')], ephemeral: true });
      return;
    }

    await interaction.reply({ embeds: [createCycleStatusEmbed(cycle, buildCycleStats(interaction, cycle))], ephemeral: true });
    return;
  }

  if (subcommand === 'list') {
    const cycles = cycleService.listCycles(interaction.guild);
    const fields = cycles.slice(0, 25).map((cycle) => ({
      name: cycle.name,
      value: cycle.closed_at ? `Fechado em ${new Date(cycle.closed_at).toLocaleDateString('pt-BR')}` : 'Aberto agora',
      inline: false,
    }));
    await interaction.reply({ embeds: [createInfoEmbed('Histórico de Ciclos', cycles.length ? 'Últimos ciclos cadastrados.' : 'Nenhum ciclo cadastrado.', fields)], ephemeral: true });
    return;
  }

  if (subcommand === 'close') {
    const cycle = cycleService.closeCurrent(interaction.guild);
    await interaction.reply({ embeds: [createSuccessEmbed('Ciclo Fechado', `O ciclo **${cycle.name}** foi fechado.`)], ephemeral: true });
  }
}

module.exports = { data, execute };

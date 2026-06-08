const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const { getContainer } = require('../../container');
const { createErrorEmbed, createProgressEmbed, createReportReadyEmbed } = require('../../utils/embeds');

const data = new SlashCommandBuilder()
  .setName('report')
  .setDescription('Consulta ou regenera relatórios.')
  .addSubcommand((subcommand) =>
    subcommand
      .setName('status')
      .setDescription('Mostra se o membro já pode ter relatório no ciclo atual.')
      .addStringOption((option) =>
        option.setName('nickname').setDescription('Nickname do membro').setRequired(true).setAutocomplete(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('regenerate')
      .setDescription('Gera novamente o relatório de um membro já completo.')
      .addStringOption((option) =>
        option.setName('nickname').setDescription('Nickname do membro').setRequired(true).setAutocomplete(true)
      )
  );

async function execute(interaction) {
  const { cycleService, memberService, reportEligibilityService, reportService } = getContainer();
  const subcommand = interaction.options.getSubcommand();
  const nickname = interaction.options.getString('nickname', true);
  const cycle = cycleService.getStatus(interaction.guild);

  if (!cycle) {
    await interaction.reply({ embeds: [createErrorEmbed('Nenhum Ciclo Aberto', 'Não existe ciclo aberto para consultar relatórios.')], ephemeral: true });
    return;
  }

  const { member } = memberService.getMemberInfo(interaction.guild, nickname);
  const progress = reportEligibilityService.getProgress(cycle.id, member.id);

  if (subcommand === 'status') {
    if (!progress.complete) {
      await interaction.reply({ embeds: [createProgressEmbed(member, progress, progress.missingDepartments)], ephemeral: true });
      return;
    }

    await interaction.reply({ embeds: [createReportReadyEmbed(member, cycle)], ephemeral: true });
    return;
  }

  if (subcommand === 'regenerate') {
    if (!progress.complete) {
      await interaction.reply({ embeds: [createProgressEmbed(member, progress, progress.missingDepartments)], ephemeral: true });
      return;
    }

    await interaction.deferReply({ ephemeral: true });
    const report = await reportService.generateReport(cycle, member);
    const attachment = new AttachmentBuilder(fs.readFileSync(report.file_path), { name: 'report.png' });
    await interaction.editReply({ embeds: [createReportReadyEmbed(member, cycle)], files: [attachment] });
  }
}

module.exports = { data, execute };

const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { getContainer } = require('../../container');
const { getMemberRoleIds } = require('../permissions/managerRoleGuard');
const { createEvaluateModal, parseEvaluateModalCustomId, parseScoresFromModal } = require('../interactions/modals/evaluateModal');
const {
  createErrorEmbed,
  createProgressEmbed,
  createReportReadyEmbed,
} = require('../../utils/embeds');

const data = new SlashCommandBuilder()
  .setName('evaluate')
  .setDescription('Envia a avaliação de um membro em um departamento.')
  .addStringOption((option) =>
    option
      .setName('nickname')
      .setDescription('Nickname do membro avaliado')
      .setRequired(true)
      .setAutocomplete(true)
  )
  .addStringOption((option) =>
    option
      .setName('departamento')
      .setDescription('Departamento avaliado')
      .setRequired(true)
      .setAutocomplete(true)
  );

async function execute(interaction) {
  const { cycleService } = getContainer();
  const cycle = cycleService.getStatus(interaction.guild);

  if (!cycle) {
    const embed = createErrorEmbed(
      'Nenhum Ciclo Aberto',
      'Não existe ciclo de avaliação aberto para receber avaliações. Use `/cycle open nome:Junho/2026` para iniciar um novo ciclo.'
    );
    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  const nickname = interaction.options.getString('nickname', true);
  const departmentName = interaction.options.getString('departamento', true);

  await interaction.showModal(createEvaluateModal(nickname, departmentName));
}

async function handleModalSubmit(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const modalData = parseEvaluateModalCustomId(interaction.customId);
  if (!modalData) {
    const embed = createErrorEmbed('Erro Interno', 'ID do modal inválido. Abra o formulário novamente com `/evaluate`.');
    await interaction.editReply({ embeds: [embed] });
    return;
  }

  const { evaluationService, cycleService } = getContainer();
  const cycle = cycleService.getStatus(interaction.guild);

  if (!cycle) {
    const embed = createErrorEmbed('Nenhum Ciclo Aberto', 'O ciclo de avaliação foi fechado enquanto você preenchia o formulário.');
    await interaction.editReply({ embeds: [embed] });
    return;
  }

  try {
    const result = await evaluationService.evaluate(interaction.guild, {
      nickname: modalData.nickname,
      departmentName: modalData.departmentName,
      evaluatorDiscordUserId: interaction.user.id,
      evaluatorRoleIds: getMemberRoleIds(interaction.member),
      scores: parseScoresFromModal(interaction),
    });

    if (result.report) {
      const embed = createReportReadyEmbed(result.member, result.cycle);
      const attachment = new AttachmentBuilder(result.report.imageBuffer, { name: 'report.png' });

      await interaction.editReply({ embeds: [embed], files: [attachment] });

      try {
        if (result.member.discord_user_id) {
          const dmUser = await interaction.client.users.fetch(result.member.discord_user_id);
          await dmUser.send({ embeds: [embed], files: [new AttachmentBuilder(result.report.imageBuffer, { name: 'report.png' })] });
        }
      } catch (dmError) {
        console.warn('Não foi possível enviar DM para o membro:', dmError.message);
      }
      return;
    }

    const embed = createProgressEmbed(result.member, result.progress, result.progress.missingDepartments);
    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    const embed = createErrorEmbed('Erro na Avaliação', error.message);
    await interaction.editReply({ embeds: [embed] });
  }
}

module.exports = { data, execute, handleModalSubmit };

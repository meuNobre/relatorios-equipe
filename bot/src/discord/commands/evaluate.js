const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { getContainer } = require('../../container');
const { getMemberRoleIds } = require('../permissions/managerRoleGuard');
const { parseScoresFromInteraction } = require('../../utils/evaluationCriteria');

const data = new SlashCommandBuilder()
  .setName('evaluate')
  .setDescription('Envia a avaliação de um membro em um departamento.')
  .addStringOption((option) =>
    option.setName('nickname').setDescription('Nickname do membro avaliado').setRequired(true)
  )
  .addStringOption((option) =>
    option.setName('departamento').setDescription('Departamento avaliado').setRequired(true)
  )
  .addStringOption((option) =>
    option.setName('realizacao_de_atividades').setDescription('Nota de realização de atividades').setRequired(true)
  )
  .addStringOption((option) =>
    option.setName('frequencia').setDescription('Nota de frequência').setRequired(true)
  )
  .addStringOption((option) =>
    option.setName('comunicacao').setDescription('Nota de comunicação').setRequired(true)
  )
  .addStringOption((option) =>
    option.setName('nota_do_gestor').setDescription('Nota geral do gestor').setRequired(true)
  );

async function execute(interaction) {
  await interaction.deferReply();

  const { evaluationService } = getContainer();
  const result = await evaluationService.evaluate(interaction.guild, {
    nickname: interaction.options.getString('nickname', true),
    departmentName: interaction.options.getString('departamento', true),
    evaluatorDiscordUserId: interaction.user.id,
    evaluatorRoleIds: getMemberRoleIds(interaction.member),
    scores: parseScoresFromInteraction(interaction),
  });

  if (!result.report) {
    const missing = result.progress.missingDepartments.map((department) => department.name).join(', ');
    await interaction.editReply(
      `Avaliação salva para ${result.member.nickname}. Progresso: ${result.progress.done}/${result.progress.total}. Faltando: ${missing}.`
    );
    return;
  }

  const attachment = new AttachmentBuilder(result.report.file_path, { name: 'report.png' });
  await interaction.editReply({
    content: `Avaliação salva. Todas as avaliações de ${result.member.nickname} foram concluídas, então o relatório foi gerado.`,
    files: [attachment],
  });
}

module.exports = { data, execute };

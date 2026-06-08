const { EmbedBuilder } = require('discord.js');

const MYFEEDBACK_COLOR = 0x5865F2;
const SUCCESS_COLOR = 0x2ECC71;
const ERROR_COLOR = 0xE74C3C;
const WARNING_COLOR = 0xF39C12;
const INFO_COLOR = 0x3498DB;

function createBaseEmbed({ title, description, color = MYFEEDBACK_COLOR, fields = [], footer = 'MyFeedback • Sistema de Avaliações' }) {
  const embed = new EmbedBuilder()
    .setTitle(title)
    .setColor(color)
    .setTimestamp()
    .setFooter({ text: footer });

  if (description) {
    embed.setDescription(description);
  }

  if (fields.length > 0) {
    embed.addFields(fields);
  }

  return embed;
}

function createSuccessEmbed(title, description, fields = []) {
  return createBaseEmbed({ title: `✅ ${title}`, description, color: SUCCESS_COLOR, fields });
}

function createErrorEmbed(title, description, fields = []) {
  return createBaseEmbed({ title: `❌ ${title}`, description, color: ERROR_COLOR, fields });
}

function createWarningEmbed(title, description, fields = []) {
  return createBaseEmbed({ title: `⚠️ ${title}`, description, color: WARNING_COLOR, fields });
}

function createInfoEmbed(title, description, fields = []) {
  return createBaseEmbed({ title: `ℹ️ ${title}`, description, color: INFO_COLOR, fields });
}

function createProgressEmbed(member, progress, missingDepartments) {
  const { total, done } = progress;
  const percentage = total > 0 ? Math.round((done / total) * 100) : 0;

  const fields = [
    { name: '👤 Membro', value: member.nickname, inline: true },
    { name: '📋 Cargo', value: member.role, inline: true },
    { name: '📊 Progresso', value: `${done}/${total} (${percentage}%)`, inline: true },
  ];

  if (missingDepartments.length > 0) {
    fields.push({
      name: '⏳ Departamentos Pendentes',
      value: missingDepartments.map((d) => `• ${d.name}`).join('\n'),
      inline: false,
    });
  } else {
    fields.push({ name: '✅ Status', value: 'Todas as avaliações concluídas! Relatório gerado.', inline: false });
  }

  return createBaseEmbed({
    title: 'Avaliação Registrada',
    description: `Avaliação de **${member.nickname}** salva com sucesso.`,
    color: missingDepartments.length > 0 ? WARNING_COLOR : SUCCESS_COLOR,
    fields,
  });
}

function createMemberListEmbed(members, page = 1, totalPages = 1) {
  const fields = members.map((member, index) => ({
    name: `${(page - 1) * 10 + index + 1}. ${member.nickname}`,
    value: `Cargo: ${member.role} • Departamentos: ${member.departments?.map((d) => d.name).join(', ') || 'Nenhum'}`,
    inline: false,
  }));

  return createBaseEmbed({
    title: '📋 Membros Cadastrados',
    description: members.length === 0 ? 'Nenhum membro cadastrado.' : undefined,
    fields,
    footer: `MyFeedback • Página ${page}/${totalPages}`,
  });
}

function createDepartmentListEmbed(departments) {
  const fields = departments.map((dept) => ({
    name: dept.name,
    value: `Gestores: ${dept.managerRoles?.map((r) => `<@&${r.discord_role_id}>`).join(', ') || 'Nenhum cadastrado'} • Status: ${dept.active ? '✅ Ativo' : '❌ Inativo'}`,
    inline: false,
  }));

  return createBaseEmbed({
    title: '🏢 Departamentos',
    description: departments.length === 0 ? 'Nenhum departamento cadastrado.' : undefined,
    fields,
  });
}

function createCycleStatusEmbed(cycle, stats) {
  const { totalMembers, totalEvaluations, pendingEvaluations, completedMembers, evaluatorsProgress } = stats;

  const fields = [
    { name: '📅 Ciclo', value: cycle.name, inline: true },
    { name: '📊 Status', value: cycle.status === 'open' ? '🟢 Aberto' : '🔴 Fechado', inline: true },
    { name: '👥 Membros Totais', value: String(totalMembers), inline: true },
    { name: '✍️ Avaliações Feitas', value: `${totalEvaluations}/${totalMembers * stats.avgDepartmentsPerMember || '?'}`, inline: true },
    { name: '⏳ Pendentes', value: String(pendingEvaluations), inline: true },
    { name: '✅ Completos (relatório gerado)', value: String(completedMembers), inline: true },
  ];

  if (evaluatorsProgress && evaluatorsProgress.length > 0) {
    fields.push({
      name: '👮 Progresso por Gestor',
      value: evaluatorsProgress
        .map((e) => `• <@${e.evaluatorId}> (${e.department}): ${e.done}/${e.total}`)
        .join('\n'),
      inline: false,
    });
  }

  return createBaseEmbed({
    title: '📈 Status do Ciclo de Avaliação',
    description: cycle.status === 'open' ? 'Ciclo em andamento. Use `/evaluate` para registrar avaliações.' : 'Ciclo finalizado.',
    fields,
  });
}

function createEvaluationDetailEmbed(evaluation, member, department, cycle) {
  const fields = [
    { name: '👤 Membro', value: member.nickname, inline: true },
    { name: '🏢 Departamento', value: department.name, inline: true },
    { name: '📅 Ciclo', value: cycle.name, inline: true },
    { name: '👮 Avaliado por', value: `<@${evaluation.evaluator_discord_user_id}>`, inline: true },
    { name: '📅 Data', value: new Date(evaluation.created_at).toLocaleString('pt-BR'), inline: true },
  ];

  if (evaluation.scores && Object.keys(evaluation.scores).length > 0) {
    fields.push({
      name: '📝 Notas',
      value: Object.entries(evaluation.scores)
        .map(([criterion, score]) => `• **${criterion}**: ${score}`)
        .join('\n'),
      inline: false,
    });
  }

  return createBaseEmbed({
    title: '📋 Detalhes da Avaliação',
    fields,
  });
}

function createReportReadyEmbed(member, cycle, reportPath) {
  return createSuccessEmbed(
    'Relatório Gerado! 🎉',
    `Todas as avaliações de **${member.nickname}** foram concluídas no ciclo **${cycle.name}**. O relatório visual foi gerado automaticamente.`,
    [
      { name: '👤 Membro', value: member.nickname, inline: true },
      { name: '📅 Ciclo', value: cycle.name, inline: true },
      { name: '📎 Arquivo', value: '`report.png` (anexado)', inline: true },
    ]
  );
}

module.exports = {
  createSuccessEmbed,
  createErrorEmbed,
  createWarningEmbed,
  createInfoEmbed,
  createProgressEmbed,
  createMemberListEmbed,
  createDepartmentListEmbed,
  createCycleStatusEmbed,
  createEvaluationDetailEmbed,
  createReportReadyEmbed,
};
function createEvaluationService({
  guildRepository,
  cycleRepository,
  departmentRepository,
  memberRepository,
  evaluationRepository,
  reportEligibilityService,
  reportService,
}) {
  function formatDepartmentList(departments) {
    return departments.length ? departments.map((department) => department.name).join(', ') : 'nenhum departamento ativo';
  }

  function formatRoleList(roleIds) {
    return roleIds.length ? roleIds.map((roleId) => `<@&${roleId}>`).join(', ') : 'nenhum cargo gestor cadastrado';
  }

  async function evaluate(discordGuild, input) {
    const guild = guildRepository.ensureGuild(discordGuild.id, discordGuild.name);
    const cycle = cycleRepository.findOpen(guild.id);

    if (!cycle) {
      throw new Error('Não existe ciclo aberto para receber avaliações. Use `/cycle open nome:Junho/2026` para iniciar.');
    }

    const member = memberRepository.findByNicknameWithDepartments(guild.id, input.nickname);

    if (!member) {
      throw new Error(`Membro não encontrado: ${input.nickname}`);
    }

    const department = departmentRepository.findByName(guild.id, input.departmentName);

    if (!department) {
      throw new Error(`Departamento não encontrado: ${input.departmentName}`);
    }

    if (!memberRepository.isInDepartment(member.id, department.id)) {
      throw new Error(
        `**${member.nickname}** não faz parte do departamento **${department.name}**. Departamentos dele: ${formatDepartmentList(member.departments)}.`
      );
    }

    const existing = evaluationRepository.findForMemberDepartment(cycle.id, member.id, department.id);

    if (existing) {
      const progress = reportEligibilityService.getProgress(cycle.id, member.id);
      const pending = progress.missingDepartments.map((missingDepartment) => missingDepartment.name).join(', ');
      const pendingMessage = pending
        ? `Ainda falta avaliação de: **${pending}**.`
        : 'Todas as avaliações desse membro já foram concluídas.';

      throw new Error(
        `**${member.nickname}** já foi avaliado em **${department.name}** neste ciclo (${cycle.name}). ${pendingMessage}`
      );
    }

    const managerRoles = departmentRepository.listManagerRoles(department.id);
    const allowedRoleIds = managerRoles.map((role) => role.discord_role_id);
    const hasPermission = input.evaluatorRoleIds.some((roleId) => allowedRoleIds.includes(roleId));

    if (!hasPermission) {
      throw new Error(
        `Você não possui cargo gestor cadastrado para avaliar **${department.name}**. Apenas ${formatRoleList(allowedRoleIds)} pode avaliar este departamento.`
      );
    }

    evaluationRepository.create({
      cycleId: cycle.id,
      memberId: member.id,
      departmentId: department.id,
      evaluatorDiscordUserId: input.evaluatorDiscordUserId,
      scores: input.scores,
    });

    const progress = reportEligibilityService.getProgress(cycle.id, member.id);
    let report = null;

    if (progress.complete) {
      report = await reportService.generateReport(cycle, member);
    }

    return { cycle, member, department, progress, report };
  }

  return { evaluate };
}

module.exports = { createEvaluationService };

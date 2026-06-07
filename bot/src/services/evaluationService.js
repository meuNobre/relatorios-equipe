function createEvaluationService({
  guildRepository,
  cycleRepository,
  departmentRepository,
  memberRepository,
  evaluationRepository,
  reportEligibilityService,
  reportService,
}) {
  async function evaluate(discordGuild, input) {
    const guild = guildRepository.ensureGuild(discordGuild.id, discordGuild.name);
    const cycle = cycleRepository.findOpen(guild.id);

    if (!cycle) {
      throw new Error('Não existe ciclo aberto para receber avaliações.');
    }

    const member = memberRepository.findByNickname(guild.id, input.nickname);

    if (!member) {
      throw new Error(`Membro não encontrado: ${input.nickname}`);
    }

    const department = departmentRepository.findByName(guild.id, input.departmentName);

    if (!department) {
      throw new Error(`Departamento não encontrado: ${input.departmentName}`);
    }

    if (!memberRepository.isInDepartment(member.id, department.id)) {
      throw new Error(`${member.nickname} não pertence ao departamento ${department.name}.`);
    }

    const managerRoles = departmentRepository.listManagerRoles(department.id);
    const allowedRoleIds = managerRoles.map((role) => role.discord_role_id);
    const hasPermission = input.evaluatorRoleIds.some((roleId) => allowedRoleIds.includes(roleId));

    if (!hasPermission) {
      throw new Error('Você não possui cargo gestor cadastrado para avaliar esse departamento.');
    }

    const existing = evaluationRepository.findForMemberDepartment(cycle.id, member.id, department.id);

    if (existing) {
      throw new Error('Esse membro já foi avaliado nesse departamento durante o ciclo atual.');
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

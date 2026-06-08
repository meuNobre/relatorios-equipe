function createAutocompleteUtils({ departmentRepository, memberRepository, cycleRepository, guildRepository }) {
  async function getDepartmentsForEvaluator(guild, userId) {
    const guildRecord = guildRepository.ensureGuild(guild.id, guild.name);
    const departments = departmentRepository.listActiveByGuild(guildRecord.id);

    const managed = [];
    for (const dept of departments) {
      const managerRoles = departmentRepository.listManagerRoles(dept.id);
      const roleIds = managerRoles.map((r) => r.discord_role_id);
      if (roleIds.includes(userId) || guild.members.cache.get(userId)?.roles.cache.hasAny(...roleIds)) {
        managed.push(dept);
      }
    }
    return managed;
  }

  async function getDepartmentsForEvaluatorFromRoles(guild, roleIds) {
    const guildRecord = guildRepository.ensureGuild(guild.id, guild.name);
    const departments = departmentRepository.listActiveByGuild(guildRecord.id);

    const managed = [];
    for (const dept of departments) {
      const managerRoles = departmentRepository.listManagerRoles(dept.id);
      const deptRoleIds = managerRoles.map((r) => r.discord_role_id);
      if (roleIds.some((rid) => deptRoleIds.includes(rid))) {
        managed.push(dept);
      }
    }
    return managed;
  }

  async function getMembersForDepartment(guild, departmentId) {
    return memberRepository.listByDepartment(guild.id, departmentId);
  }

  async function getMemberDepartments(guild, nickname) {
    const guildRecord = guildRepository.ensureGuild(guild.id, guild.name);
    const member = memberRepository.findByNicknameWithDepartments(guildRecord.id, nickname);
    return member ? member.departments : [];
  }

  async function getDepartmentsMemberBelongsAndUserManages(guild, memberNickname, userRoleIds) {
    const guildRecord = guildRepository.ensureGuild(guild.id, guild.name);
    const member = memberRepository.findByNicknameWithDepartments(guildRecord.id, memberNickname);
    if (!member) return [];

    const managedDepts = await getDepartmentsForEvaluatorFromRoles(guild, userRoleIds);
    const managedDeptIds = new Set(managedDepts.map((d) => d.id));
    return member.departments.filter((d) => managedDeptIds.has(d.id));
  }

  async function getMembersForEvaluator(guild, userRoleIds) {
    const managedDepts = await getDepartmentsForEvaluatorFromRoles(guild, userRoleIds);
    const allMembers = [];
    const seen = new Set();

    for (const dept of managedDepts) {
      const members = await memberRepository.listByDepartment(guild.id, dept.id);
      for (const member of members) {
        if (!seen.has(member.id)) {
          seen.add(member.id);
          allMembers.push({ ...member, departmentName: dept.name });
        }
      }
    }
    return allMembers;
  }

  async function getOpenCycle(guild) {
    const guildRecord = guildRepository.ensureGuild(guild.id, guild.name);
    return cycleRepository.findOpen(guildRecord.id);
  }

  async function getAllCycles(guild) {
    const guildRecord = guildRepository.ensureGuild(guild.id, guild.name);
    return cycleRepository.listByGuild(guildRecord.id);
  }

  function filterChoices(choices, focusedValue, max = 25) {
    if (!focusedValue) return choices.slice(0, max);
    const lower = focusedValue.toLowerCase();
    return choices
      .filter((c) => c.name.toLowerCase().includes(lower) || (c.value && c.value.toLowerCase().includes(lower)))
      .slice(0, max);
  }

  return {
    getDepartmentsForEvaluator,
    getDepartmentsForEvaluatorFromRoles,
    getMembersForDepartment,
    getMemberDepartments,
    getDepartmentsMemberBelongsAndUserManages,
    getMembersForEvaluator,
    getOpenCycle,
    getAllCycles,
    filterChoices,
  };
}

module.exports = { createAutocompleteUtils };
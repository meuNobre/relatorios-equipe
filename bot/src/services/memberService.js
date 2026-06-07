function createMemberService({ guildRepository, memberRepository, departmentRepository }) {
  function addMember(discordGuild, input) {
    const guild = guildRepository.ensureGuild(discordGuild.id, discordGuild.name);
    const existing = memberRepository.findByNickname(guild.id, input.nickname);

    if (existing) {
      throw new Error(`O membro ${input.nickname} já existe.`);
    }

    const departmentNames = input.departments.map((name) => name.trim()).filter(Boolean);

    if (departmentNames.length === 0) {
      throw new Error('Informe pelo menos um departamento.');
    }

    const departments = departmentNames.map((name) => {
      const department = departmentRepository.findByName(guild.id, name);

      if (!department) {
        throw new Error(`Departamento não encontrado: ${name}`);
      }

      return department;
    });

    const member = memberRepository.create(guild.id, input);

    for (const department of departments) {
      memberRepository.addDepartment(member.id, department.id);
    }

    return { member, departments };
  }

  function getMemberInfo(discordGuild, nickname) {
    const guild = guildRepository.ensureGuild(discordGuild.id, discordGuild.name);
    const member = memberRepository.findByNickname(guild.id, nickname);

    if (!member) {
      throw new Error(`Membro não encontrado: ${nickname}`);
    }

    return { member, departments: memberRepository.listDepartments(member.id) };
  }

  return { addMember, getMemberInfo };
}

module.exports = { createMemberService };

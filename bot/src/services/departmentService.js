function createDepartmentService({ guildRepository, departmentRepository }) {
  function addDepartment(discordGuild, name) {
    const guild = guildRepository.ensureGuild(discordGuild.id, discordGuild.name);
    const existing = departmentRepository.findByName(guild.id, name);

    if (existing) {
      throw new Error(`O departamento ${name} já existe.`);
    }

    return departmentRepository.create(guild.id, name);
  }

  function addManagerRole(discordGuild, departmentName, roleId) {
    const guild = guildRepository.ensureGuild(discordGuild.id, discordGuild.name);
    const department = departmentRepository.findByName(guild.id, departmentName);

    if (!department) {
      throw new Error(`Departamento não encontrado: ${departmentName}`);
    }

    departmentRepository.addManagerRole(department.id, roleId);
    return department;
  }

  function listDepartments(discordGuild) {
    const guild = guildRepository.ensureGuild(discordGuild.id, discordGuild.name);
    return departmentRepository.listActiveByGuild(guild.id);
  }

  return { addDepartment, addManagerRole, listDepartments };
}

module.exports = { createDepartmentService };

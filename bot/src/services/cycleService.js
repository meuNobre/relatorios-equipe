function createCycleService({ guildRepository, cycleRepository }) {
  function openCycle(discordGuild, name) {
    const guild = guildRepository.ensureGuild(discordGuild.id, discordGuild.name);
    const current = cycleRepository.findOpen(guild.id);

    if (current) {
      throw new Error(`Já existe um ciclo aberto: ${current.name}`);
    }

    return cycleRepository.create(guild.id, name);
  }

  function getStatus(discordGuild) {
    const guild = guildRepository.ensureGuild(discordGuild.id, discordGuild.name);
    return cycleRepository.findOpen(guild.id);
  }

  function closeCurrent(discordGuild) {
    const guild = guildRepository.ensureGuild(discordGuild.id, discordGuild.name);
    const current = cycleRepository.findOpen(guild.id);

    if (!current) {
      throw new Error('Não existe ciclo aberto para fechar.');
    }

    return cycleRepository.close(current.id);
  }

  return { openCycle, getStatus, closeCurrent };
}

module.exports = { createCycleService };

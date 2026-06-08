function getMemberRoleIds(discordMember) {
  // No Discord.js, roles.cache guarda todos os cargos do usuário dentro do servidor.
  return Array.from(discordMember.roles.cache.keys());
}

module.exports = { getMemberRoleIds };

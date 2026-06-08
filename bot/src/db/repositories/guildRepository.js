function createGuildRepository(db) {
  function ensureGuild(discordGuildId, name) {
    const existing = db
      .prepare('SELECT * FROM guilds WHERE discord_guild_id = ?')
      .get(discordGuildId);

    if (existing) {
      if (name && existing.name !== name) {
        db.prepare('UPDATE guilds SET name = ? WHERE id = ?').run(name, existing.id);
        return { ...existing, name };
      }

      return existing;
    }

    const result = db
      .prepare('INSERT INTO guilds (discord_guild_id, name) VALUES (?, ?)')
      .run(discordGuildId, name || null);

    return db.prepare('SELECT * FROM guilds WHERE id = ?').get(result.lastInsertRowid);
  }

  return { ensureGuild };
}

module.exports = { createGuildRepository };

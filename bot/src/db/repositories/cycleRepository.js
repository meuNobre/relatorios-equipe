function createCycleRepository(db) {
  function create(guildId, name) {
    const result = db
      .prepare('INSERT INTO evaluation_cycles (guild_id, name, status) VALUES (?, ?, ?)')
      .run(guildId, name, 'open');

    return findById(result.lastInsertRowid);
  }

  function findById(id) {
    return db.prepare('SELECT * FROM evaluation_cycles WHERE id = ?').get(id);
  }

  function findOpen(guildId) {
    return db
      .prepare('SELECT * FROM evaluation_cycles WHERE guild_id = ? AND status = ? ORDER BY opened_at DESC LIMIT 1')
      .get(guildId, 'open');
  }

  function findByName(guildId, name) {
    return db
      .prepare('SELECT * FROM evaluation_cycles WHERE guild_id = ? AND name = ?')
      .get(guildId, name);
  }

  function close(cycleId) {
    db.prepare(
      'UPDATE evaluation_cycles SET status = ?, closed_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run('closed', cycleId);

    return findById(cycleId);
  }

  return { create, findById, findOpen, findByName, close };
}

module.exports = { createCycleRepository };

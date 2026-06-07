function createDepartmentRepository(db) {
  function create(guildId, name) {
    const result = db
      .prepare('INSERT INTO departments (guild_id, name) VALUES (?, ?)')
      .run(guildId, name);

    return findById(result.lastInsertRowid);
  }

  function findById(id) {
    return db.prepare('SELECT * FROM departments WHERE id = ?').get(id);
  }

  function findByName(guildId, name) {
    return db
      .prepare('SELECT * FROM departments WHERE guild_id = ? AND name = ?')
      .get(guildId, name);
  }

  function listActiveByGuild(guildId) {
    return db
      .prepare('SELECT * FROM departments WHERE guild_id = ? AND active = 1 ORDER BY name')
      .all(guildId);
  }

  function addManagerRole(departmentId, discordRoleId) {
    db.prepare(
      'INSERT OR IGNORE INTO manager_department_roles (department_id, discord_role_id) VALUES (?, ?)'
    ).run(departmentId, discordRoleId);
  }

  function listManagerRoles(departmentId) {
    return db
      .prepare('SELECT * FROM manager_department_roles WHERE department_id = ?')
      .all(departmentId);
  }

  return { create, findById, findByName, listActiveByGuild, addManagerRole, listManagerRoles };
}

module.exports = { createDepartmentRepository };

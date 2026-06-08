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

  function listActiveByGuildWithManagerRoles(guildId) {
    const departments = db
      .prepare('SELECT * FROM departments WHERE guild_id = ? AND active = 1 ORDER BY name')
      .all(guildId);

    for (const dept of departments) {
      dept.managerRoles = db
        .prepare('SELECT * FROM manager_department_roles WHERE department_id = ?')
        .all(dept.id);
    }
    return departments;
  }

  function findManagedDepartmentsByRoles(guildId, roleIds) {
    if (roleIds.length === 0) return [];
    const placeholders = roleIds.map(() => '?').join(',');
    return db
      .prepare(`
        SELECT DISTINCT d.*
        FROM departments d
        INNER JOIN manager_department_roles mdr ON mdr.department_id = d.id
        WHERE d.guild_id = ? AND d.active = 1 AND mdr.discord_role_id IN (${placeholders})
        ORDER BY d.name
      `)
      .all(guildId, ...roleIds);
  }

  function addManagerRole(departmentId, discordRoleId) {
    db.prepare(
      'INSERT OR IGNORE INTO manager_department_roles (department_id, discord_role_id) VALUES (?, ?)'
    ).run(departmentId, discordRoleId);
  }

  function removeManagerRole(departmentId, discordRoleId) {
    db.prepare(
      'DELETE FROM manager_department_roles WHERE department_id = ? AND discord_role_id = ?'
    ).run(departmentId, discordRoleId);
  }

  function listManagerRoles(departmentId) {
    return db
      .prepare('SELECT * FROM manager_department_roles WHERE department_id = ?')
      .all(departmentId);
  }

  function setActive(departmentId, active) {
    db.prepare('UPDATE departments SET active = ? WHERE id = ?').run(active ? 1 : 0, departmentId);
    return findById(departmentId);
  }

  return {
    create,
    findById,
    findByName,
    listActiveByGuild,
    listActiveByGuildWithManagerRoles,
    findManagedDepartmentsByRoles,
    addManagerRole,
    removeManagerRole,
    listManagerRoles,
    setActive,
  };
}

module.exports = { createDepartmentRepository };

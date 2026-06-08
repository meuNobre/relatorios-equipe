function createMemberRepository(db) {
  function create(guildId, input) {
    const result = db
      .prepare(
        'INSERT INTO members (guild_id, discord_user_id, nickname, role, date_joined) VALUES (?, ?, ?, ?, ?)'
      )
      .run(guildId, input.discordUserId || null, input.nickname, input.role, input.dateJoined);

    return findById(result.lastInsertRowid);
  }

  function findById(id) {
    return db.prepare('SELECT * FROM members WHERE id = ?').get(id);
  }

  function findByNickname(guildId, nickname) {
    return db
      .prepare('SELECT * FROM members WHERE guild_id = ? AND nickname = ?')
      .get(guildId, nickname);
  }

  function findByNicknameWithDepartments(guildId, nickname) {
    const member = db
      .prepare('SELECT * FROM members WHERE guild_id = ? AND nickname = ?')
      .get(guildId, nickname);

    if (!member) return null;

    const departments = db
      .prepare(`
        SELECT d.*
        FROM departments d
        INNER JOIN member_departments md ON md.department_id = d.id
        WHERE md.member_id = ? AND d.active = 1
        ORDER BY d.name
      `)
      .all(member.id);

    return { ...member, departments };
  }

  function addDepartment(memberId, departmentId) {
    db.prepare(
      'INSERT OR IGNORE INTO member_departments (member_id, department_id) VALUES (?, ?)'
    ).run(memberId, departmentId);
  }

  function listDepartments(memberId) {
    return db
      .prepare(`
        SELECT d.*
        FROM departments d
        INNER JOIN member_departments md ON md.department_id = d.id
        WHERE md.member_id = ? AND d.active = 1
        ORDER BY d.name
      `)
      .all(memberId);
  }

  function listByDepartment(guildId, departmentId) {
    return db
      .prepare(`
        SELECT m.*
        FROM members m
        INNER JOIN member_departments md ON md.member_id = m.id
        WHERE m.guild_id = ? AND md.department_id = ? AND m.active = 1
        ORDER BY m.nickname
      `)
      .all(guildId, departmentId);
  }

  function isInDepartment(memberId, departmentId) {
    const row = db
      .prepare('SELECT 1 AS found FROM member_departments WHERE member_id = ? AND department_id = ?')
      .get(memberId, departmentId);

    return Boolean(row);
  }

  function findAll(guildId) {
    return db
      .prepare('SELECT * FROM members WHERE guild_id = ? AND active = 1 ORDER BY nickname')
      .all(guildId);
  }

  return { create, findById, findByNickname, findByNicknameWithDepartments, addDepartment, listDepartments, listByDepartment, isInDepartment, findAll };
}

module.exports = { createMemberRepository };

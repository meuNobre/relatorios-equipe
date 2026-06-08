function createReportRepository(db) {
  function upsert(input) {
    db.prepare(`
      INSERT INTO reports (cycle_id, member_id, file_path)
      VALUES (?, ?, ?)
      ON CONFLICT(cycle_id, member_id)
      DO UPDATE SET file_path = excluded.file_path, generated_at = CURRENT_TIMESTAMP
    `).run(input.cycleId, input.memberId, input.filePath);

    return findByCycleAndMember(input.cycleId, input.memberId);
  }

  function findByCycleAndMember(cycleId, memberId) {
    return db
      .prepare('SELECT * FROM reports WHERE cycle_id = ? AND member_id = ?')
      .get(cycleId, memberId);
  }

  return { upsert, findByCycleAndMember };
}

module.exports = { createReportRepository };

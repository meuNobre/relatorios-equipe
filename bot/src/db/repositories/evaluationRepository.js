function createEvaluationRepository(db) {
  function create(input) {
    let evaluationId;

    try {
      db.exec('BEGIN');

      const result = db
        .prepare(
          'INSERT INTO evaluations (cycle_id, member_id, department_id, evaluator_discord_user_id) VALUES (?, ?, ?, ?)'
        )
        .run(input.cycleId, input.memberId, input.departmentId, input.evaluatorDiscordUserId);

      evaluationId = Number(result.lastInsertRowid);
      const insertScore = db.prepare(
        'INSERT INTO evaluation_scores (evaluation_id, criterion, score) VALUES (?, ?, ?)'
      );

      for (const [criterion, score] of Object.entries(input.scores)) {
        insertScore.run(evaluationId, criterion, score);
      }

      db.exec('COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }

    return findById(evaluationId);
  }

  function findById(id) {
    return db.prepare('SELECT * FROM evaluations WHERE id = ?').get(id);
  }

  function findForMemberDepartment(cycleId, memberId, departmentId) {
    return db
      .prepare('SELECT * FROM evaluations WHERE cycle_id = ? AND member_id = ? AND department_id = ?')
      .get(cycleId, memberId, departmentId);
  }

  function listForMember(cycleId, memberId) {
    return db
      .prepare(`
        SELECT e.*, d.name AS department_name
        FROM evaluations e
        INNER JOIN departments d ON d.id = e.department_id
        WHERE e.cycle_id = ? AND e.member_id = ?
        ORDER BY d.name
      `)
      .all(cycleId, memberId);
  }

  function listWithScoresForMember(cycleId, memberId) {
    const evaluations = listForMember(cycleId, memberId);
    const listScores = db.prepare(
      'SELECT criterion, score FROM evaluation_scores WHERE evaluation_id = ? ORDER BY criterion'
    );

    return evaluations.map((evaluation) => ({
      ...evaluation,
      scores: listScores.all(evaluation.id),
    }));
  }

  return { create, findById, findForMemberDepartment, listForMember, listWithScoresForMember };
}

module.exports = { createEvaluationRepository };

function createReportEligibilityService({ memberRepository, evaluationRepository }) {
  function getProgress(cycleId, memberId) {
    const departments = memberRepository.listDepartments(memberId);
    const evaluations = evaluationRepository.listForMember(cycleId, memberId);
    const evaluatedDepartmentIds = new Set(evaluations.map((evaluation) => evaluation.department_id));
    const missingDepartments = departments.filter((department) => !evaluatedDepartmentIds.has(department.id));

    return {
      total: departments.length,
      done: evaluations.length,
      missingDepartments,
      complete: departments.length > 0 && missingDepartments.length === 0,
    };
  }

  return { getProgress };
}

module.exports = { createReportEligibilityService };

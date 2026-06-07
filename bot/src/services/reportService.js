const fs = require('fs');
const path = require('path');

function createReportService({ memberRepository, evaluationRepository, reportRepository, renderClient }) {
  async function generateReport(cycle, member) {
    const departments = memberRepository.listDepartments(member.id);
    const evaluations = evaluationRepository.listWithScoresForMember(cycle.id, member.id);

    const payload = {
      cycle: { id: String(cycle.id), name: cycle.name },
      member: {
        id: String(member.id),
        nickname: member.nickname,
        role: member.role,
        date_joined: member.date_joined,
        departments: departments.map((department) => department.name),
      },
      feedbacks: evaluations.map((evaluation) => ({
        department: evaluation.department_name,
        notes: Object.fromEntries(evaluation.scores.map((score) => [score.criterion, score.score])),
      })),
    };

    const imageBuffer = await renderClient.renderReport(payload);
    const reportsDir = path.resolve(process.cwd(), 'data/reports');
    fs.mkdirSync(reportsDir, { recursive: true });

    const filePath = path.join(reportsDir, `cycle-${cycle.id}-member-${member.id}.png`);
    fs.writeFileSync(filePath, imageBuffer);

    return reportRepository.upsert({ cycleId: cycle.id, memberId: member.id, filePath });
  }

  return { generateReport };
}

module.exports = { createReportService };

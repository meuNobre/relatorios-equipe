const { createDatabaseConnection } = require('./db/connection');
const { createGuildRepository } = require('./db/repositories/guildRepository');
const { createDepartmentRepository } = require('./db/repositories/departmentRepository');
const { createMemberRepository } = require('./db/repositories/memberRepository');
const { createCycleRepository } = require('./db/repositories/cycleRepository');
const { createEvaluationRepository } = require('./db/repositories/evaluationRepository');
const { createReportRepository } = require('./db/repositories/reportRepository');
const { createCycleService } = require('./services/cycleService');
const { createDepartmentService } = require('./services/departmentService');
const { createMemberService } = require('./services/memberService');
const { createEvaluationService } = require('./services/evaluationService');
const { createReportEligibilityService } = require('./services/reportEligibilityService');
const { createReportService } = require('./services/reportService');
const { createRenderClient } = require('./services/renderClient');

let container;

function getContainer() {
  if (container) {
    return container;
  }

  const db = createDatabaseConnection();

  const guildRepository = createGuildRepository(db);
  const departmentRepository = createDepartmentRepository(db);
  const memberRepository = createMemberRepository(db);
  const cycleRepository = createCycleRepository(db);
  const evaluationRepository = createEvaluationRepository(db);
  const reportRepository = createReportRepository(db);

  const cycleService = createCycleService({ guildRepository, cycleRepository });
  const departmentService = createDepartmentService({ guildRepository, departmentRepository });
  const memberService = createMemberService({ guildRepository, memberRepository, departmentRepository });
  const reportEligibilityService = createReportEligibilityService({ memberRepository, evaluationRepository });
  const renderClient = createRenderClient();
  const reportService = createReportService({
    memberRepository,
    evaluationRepository,
    reportRepository,
    renderClient,
  });
  const evaluationService = createEvaluationService({
    guildRepository,
    cycleRepository,
    departmentRepository,
    memberRepository,
    evaluationRepository,
    reportEligibilityService,
    reportService,
  });

  container = {
    guildRepository,
    cycleRepository,
    departmentRepository,
    memberRepository,
    evaluationRepository,
    reportRepository,
    cycleService,
    departmentService,
    memberService,
    evaluationService,
    reportEligibilityService,
    reportService,
  };

  return container;
}

module.exports = { getContainer };

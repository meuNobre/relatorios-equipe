const fs = require('fs');
const path = require('path');
const { createDatabaseConnection } = require('./connection');
const { createGuildRepository } = require('./repositories/guildRepository');
const { createDepartmentRepository } = require('./repositories/departmentRepository');
const { createMemberRepository } = require('./repositories/memberRepository');
const env = require('../config/env');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.resolve(process.cwd(), '..', relativePath), 'utf8'));
}

function seedFromJson() {
  const db = createDatabaseConnection();
  const guildRepository = createGuildRepository(db);
  const departmentRepository = createDepartmentRepository(db);
  const memberRepository = createMemberRepository(db);

  const guild = guildRepository.ensureGuild(env.discord.guildId, 'MyFeedback');
  const members = readJson('data/members.json');

  for (const [nickname, info] of Object.entries(members)) {
    let member = memberRepository.findByNickname(guild.id, nickname);

    if (!member) {
      member = memberRepository.create(guild.id, {
        nickname,
        role: info.role,
        dateJoined: info.date_joined,
        discordUserId: null,
      });
    }

    for (const departmentName of info.departments) {
      let department = departmentRepository.findByName(guild.id, departmentName);

      if (!department) {
        department = departmentRepository.create(guild.id, departmentName);
      }

      memberRepository.addDepartment(member.id, department.id);
    }
  }

  console.log('JSONs importados para o SQLite.');
  db.close();
}

seedFromJson();

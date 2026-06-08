function formatChoiceName(value, suffix) {
  const label = suffix ? `${value} — ${suffix}` : value;
  return label.length > 100 ? `${label.slice(0, 97)}...` : label;
}

function filterChoices(choices, focusedValue) {
  const query = String(focusedValue || '').toLowerCase();
  return choices
    .filter((choice) => choice.name.toLowerCase().includes(query) || String(choice.value).toLowerCase().includes(query))
    .slice(0, 25);
}

function roleIdsFromInteraction(interaction) {
  return Array.from(interaction.member?.roles?.cache?.keys?.() || []);
}

async function handleAutocomplete(interaction) {
  const { getContainer } = require('../../container');
  const container = getContainer();
  const focusedOption = interaction.options.getFocused(true);
  const commandName = interaction.commandName;
  const optionName = focusedOption.name;
  const focusedValue = focusedOption.value;
  const userRoleIds = roleIdsFromInteraction(interaction);

  try {
    let choices = [];

    if (commandName === 'evaluate') {
      if (optionName === 'nickname') {
        const managedDepts = container.departmentService.getManagedDepartmentsByRoles(interaction.guild, userRoleIds);
        const allMembers = [];
        const seen = new Set();

        for (const dept of managedDepts) {
          const members = container.memberService.listMembersByDepartment(interaction.guild, dept.id);
          for (const member of members) {
            if (!seen.has(member.id)) {
              seen.add(member.id);
              allMembers.push({ name: member.nickname, value: member.nickname });
            }
          }
        }
        choices = allMembers;
      }

      if (optionName === 'departamento') {
        const nickname = interaction.options.getString('nickname');
        if (nickname) {
          const member = container.memberService.getMemberWithDepartments(interaction.guild, nickname);
          if (member) {
            const managedDepts = container.departmentService.getManagedDepartmentsByRoles(interaction.guild, userRoleIds);
            const managedDeptIds = new Set(managedDepts.map((dept) => dept.id));
            choices = member.departments
              .filter((dept) => managedDeptIds.has(dept.id))
              .map((dept) => ({ name: dept.name, value: dept.name }));
          }
        }
      }
    }

    if (commandName === 'member') {
      if (optionName === 'departamentos') {
        choices = container.departmentService
          .listDepartments(interaction.guild)
          .map((dept) => ({ name: dept.name, value: dept.name }));
      }

      if (optionName === 'nickname') {
        choices = container.memberService
          .listAllMembers(interaction.guild)
          .map((member) => ({ name: member.nickname, value: member.nickname }));
      }
    }

    if (commandName === 'department' && optionName === 'departamento') {
      choices = container.departmentService
        .listDepartments(interaction.guild)
        .map((dept) => ({ name: dept.name, value: dept.name }));
    }

    if (commandName === 'cycle' && optionName === 'ciclo') {
      choices = container.cycleService
        .listCycles(interaction.guild)
        .map((cycle) => ({ name: formatChoiceName(cycle.name, cycle.closed_at ? 'fechado' : 'aberto'), value: cycle.name }));
    }

    if (commandName === 'report' && optionName === 'nickname') {
      choices = container.memberService
        .listAllMembers(interaction.guild)
        .map((member) => ({ name: member.nickname, value: member.nickname }));
    }

    await interaction.respond(filterChoices(choices, focusedValue));
  } catch (error) {
    console.error('Autocomplete error:', error);
    await interaction.respond([]);
  }
}

module.exports = { handleAutocomplete };

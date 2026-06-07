const { SlashCommandBuilder } = require('discord.js');
const { getContainer } = require('../../container');

const data = new SlashCommandBuilder()
  .setName('department')
  .setDescription('Gerencia departamentos e cargos gestores.')
  .addSubcommand((subcommand) =>
    subcommand
      .setName('add')
      .setDescription('Cria um departamento que poderá receber avaliações.')
      .addStringOption((option) =>
        option.setName('nome').setDescription('Nome do departamento').setRequired(true)
      )
  )
  .addSubcommandGroup((group) =>
    group
      .setName('manager')
      .setDescription('Configura quem pode avaliar um departamento.')
      .addSubcommand((subcommand) =>
        subcommand
          .setName('add')
          .setDescription('Associa um cargo Discord como gestor de um departamento.')
          .addStringOption((option) =>
            option.setName('departamento').setDescription('Nome do departamento').setRequired(true)
          )
          .addRoleOption((option) =>
            option.setName('cargo').setDescription('Cargo gestor').setRequired(true)
          )
      )
  );

async function execute(interaction) {
  const { departmentService } = getContainer();
  const group = interaction.options.getSubcommandGroup(false);
  const subcommand = interaction.options.getSubcommand();

  if (!group && subcommand === 'add') {
    const name = interaction.options.getString('nome', true);
    const department = departmentService.addDepartment(interaction.guild, name);
    await interaction.reply(`Departamento criado: ${department.name}`);
    return;
  }

  if (group === 'manager' && subcommand === 'add') {
    const departmentName = interaction.options.getString('departamento', true);
    const role = interaction.options.getRole('cargo', true);
    const department = departmentService.addManagerRole(interaction.guild, departmentName, role.id);
    await interaction.reply(`Cargo ${role.name} agora pode avaliar ${department.name}.`);
  }
}

module.exports = { data, execute };

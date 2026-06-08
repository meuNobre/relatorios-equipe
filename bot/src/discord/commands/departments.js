const { SlashCommandBuilder } = require('discord.js');
const { getContainer } = require('../../container');
const { createSuccessEmbed, createDepartmentListEmbed } = require('../../utils/embeds');

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
  .addSubcommand((subcommand) =>
    subcommand.setName('list').setDescription('Lista departamentos ativos e cargos gestores.')
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
            option.setName('departamento').setDescription('Nome do departamento').setRequired(true).setAutocomplete(true)
          )
          .addRoleOption((option) =>
            option.setName('cargo').setDescription('Cargo gestor').setRequired(true)
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName('remove')
          .setDescription('Remove um cargo gestor de um departamento.')
          .addStringOption((option) =>
            option.setName('departamento').setDescription('Nome do departamento').setRequired(true).setAutocomplete(true)
          )
          .addRoleOption((option) =>
            option.setName('cargo').setDescription('Cargo gestor').setRequired(true)
          )
      )
      .addSubcommand((subcommand) =>
        subcommand.setName('list').setDescription('Lista todos os departamentos e seus cargos gestores.')
      )
  );

async function execute(interaction) {
  const { departmentService } = getContainer();
  const group = interaction.options.getSubcommandGroup(false);
  const subcommand = interaction.options.getSubcommand();

  if (!group && subcommand === 'add') {
    const name = interaction.options.getString('nome', true);
    const department = departmentService.addDepartment(interaction.guild, name);
    await interaction.reply({ embeds: [createSuccessEmbed('Departamento Criado', `**${department.name}** agora pode receber avaliações.`)], ephemeral: true });
    return;
  }

  if ((!group && subcommand === 'list') || (group === 'manager' && subcommand === 'list')) {
    await interaction.reply({ embeds: [createDepartmentListEmbed(departmentService.listDepartmentsWithManagers(interaction.guild))], ephemeral: true });
    return;
  }

  if (group === 'manager' && subcommand === 'add') {
    const departmentName = interaction.options.getString('departamento', true);
    const role = interaction.options.getRole('cargo', true);
    const department = departmentService.addManagerRole(interaction.guild, departmentName, role.id);
    await interaction.reply({ embeds: [createSuccessEmbed('Gestor Cadastrado', `${role} agora pode avaliar **${department.name}**.`)], ephemeral: true });
    return;
  }

  if (group === 'manager' && subcommand === 'remove') {
    const departmentName = interaction.options.getString('departamento', true);
    const role = interaction.options.getRole('cargo', true);
    const department = departmentService.removeManagerRole(interaction.guild, departmentName, role.id);
    await interaction.reply({ embeds: [createSuccessEmbed('Gestor Removido', `${role} não avalia mais **${department.name}**.`)], ephemeral: true });
  }
}

module.exports = { data, execute };

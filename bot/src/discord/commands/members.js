const { SlashCommandBuilder } = require('discord.js');
const { getContainer } = require('../../container');
const { createSuccessEmbed, createInfoEmbed, createMemberListEmbed } = require('../../utils/embeds');

const data = new SlashCommandBuilder()
  .setName('member')
  .setDescription('Gerencia membros avaliados pelo MyFeedback.')
  .addSubcommand((subcommand) =>
    subcommand
      .setName('add')
      .setDescription('Cadastra um membro e seus departamentos.')
      .addStringOption((option) =>
        option.setName('nickname').setDescription('Nickname usado no relatório').setRequired(true)
      )
      .addStringOption((option) =>
        option.setName('cargo').setDescription('Cargo/função do membro').setRequired(true)
      )
      .addStringOption((option) =>
        option.setName('entrada').setDescription('Data de entrada no formato YYYY-MM-DD').setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName('departamentos')
          .setDescription('Departamentos existentes, separados por vírgula')
          .setRequired(true)
          .setAutocomplete(true)
      )
      .addUserOption((option) =>
        option.setName('usuario').setDescription('Usuário Discord vinculado ao membro').setRequired(false)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('info')
      .setDescription('Mostra os dados cadastrados de um membro.')
      .addStringOption((option) =>
        option.setName('nickname').setDescription('Nickname do membro').setRequired(true).setAutocomplete(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand.setName('list').setDescription('Lista os membros ativos cadastrados.')
  );

async function execute(interaction) {
  const { memberService } = getContainer();
  const subcommand = interaction.options.getSubcommand();

  if (subcommand === 'add') {
    const user = interaction.options.getUser('usuario', false);
    const result = memberService.addMember(interaction.guild, {
      nickname: interaction.options.getString('nickname', true),
      role: interaction.options.getString('cargo', true),
      dateJoined: interaction.options.getString('entrada', true),
      departments: interaction.options.getString('departamentos', true).split(','),
      discordUserId: user ? user.id : null,
    });

    const embed = createSuccessEmbed(
      'Membro Cadastrado',
      `**${result.member.nickname}** foi cadastrado com sucesso.`,
      [
        { name: 'Cargo', value: result.member.role, inline: true },
        { name: 'Entrada', value: result.member.date_joined, inline: true },
        { name: 'Departamentos', value: result.departments.map((dept) => dept.name).join(', '), inline: false },
      ]
    );

    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  if (subcommand === 'info') {
    const nickname = interaction.options.getString('nickname', true);
    const result = memberService.getMemberInfo(interaction.guild, nickname);
    const embed = createInfoEmbed(
      'Dados do Membro',
      `Informações cadastradas de **${result.member.nickname}**.`,
      [
        { name: 'Cargo', value: result.member.role, inline: true },
        { name: 'Entrada', value: result.member.date_joined, inline: true },
        { name: 'Departamentos', value: result.departments.map((dept) => dept.name).join(', '), inline: false },
      ]
    );
    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  if (subcommand === 'list') {
    const members = memberService.listAllMembers(interaction.guild).map((member) => ({
      ...member,
      departments: memberService.getMemberInfo(interaction.guild, member.nickname).departments,
    }));

    await interaction.reply({ embeds: [createMemberListEmbed(members)], ephemeral: true });
  }
}

module.exports = { data, execute };

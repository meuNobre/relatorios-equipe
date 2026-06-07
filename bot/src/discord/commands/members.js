const { SlashCommandBuilder } = require('discord.js');
const { getContainer } = require('../../container');

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
          .setDescription('Departamentos separados por vírgula, exemplo: RH, Moderação')
          .setRequired(true)
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
        option.setName('nickname').setDescription('Nickname do membro').setRequired(true)
      )
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

    await interaction.reply(
      `Membro cadastrado: ${result.member.nickname} em ${result.departments.map((d) => d.name).join(', ')}.`
    );
    return;
  }

  if (subcommand === 'info') {
    const nickname = interaction.options.getString('nickname', true);
    const result = memberService.getMemberInfo(interaction.guild, nickname);
    await interaction.reply(
      `${result.member.nickname} | Cargo: ${result.member.role} | Departamentos: ${result.departments.map((d) => d.name).join(', ')}`
    );
  }
}

module.exports = { data, execute };

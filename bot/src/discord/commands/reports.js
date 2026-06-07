const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { getContainer } = require('../../container');

const data = new SlashCommandBuilder()
  .setName('report')
  .setDescription('Consulta ou regenera relatórios.')
  .addSubcommand((subcommand) =>
    subcommand
      .setName('status')
      .setDescription('Mostra se o membro já pode ter relatório no ciclo atual.')
      .addStringOption((option) =>
        option.setName('nickname').setDescription('Nickname do membro').setRequired(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('regenerate')
      .setDescription('Gera novamente o relatório de um membro já completo.')
      .addStringOption((option) =>
        option.setName('nickname').setDescription('Nickname do membro').setRequired(true)
      )
  );

async function execute(interaction) {
  const subcommand = interaction.options.getSubcommand();
  const nickname = interaction.options.getString('nickname', true);

  // Estes comandos ficam reservados para evolução do MVP.
  // A geração automática já acontece no /evaluate quando todos os departamentos foram concluídos.
  if (subcommand === 'status') {
    await interaction.reply(`Status de relatório para ${nickname}: use /evaluate para acompanhar o progresso automático no MVP.`);
    return;
  }

  if (subcommand === 'regenerate') {
    await interaction.reply({
      content: `Regeneração manual para ${nickname} ainda será ligada após a primeira rodada de avaliações automáticas.`,
      ephemeral: true,
    });
  }
}

module.exports = { data, execute };

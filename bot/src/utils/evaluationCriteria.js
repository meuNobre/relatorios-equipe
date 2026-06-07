const DEFAULT_CRITERIA = [
  'Realização de Atividades',
  'Frequência',
  'Comunicação',
  'Nota do Gestor',
];

function parseScoresFromInteraction(interaction) {
  const scores = {};

  for (const criterion of DEFAULT_CRITERIA) {
    const optionName = criterion
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '_');

    scores[criterion] = interaction.options.getString(optionName, true);
  }

  return scores;
}

module.exports = { DEFAULT_CRITERIA, parseScoresFromInteraction };

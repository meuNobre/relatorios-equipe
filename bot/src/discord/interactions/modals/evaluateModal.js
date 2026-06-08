const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { DEFAULT_CRITERIA } = require('../../../utils/evaluationCriteria');

function fieldIdForCriterion(criterion) {
  return criterion
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_');
}

function encodeModalValue(value) {
  return encodeURIComponent(value);
}

function decodeModalValue(value) {
  return decodeURIComponent(value);
}

function createEvaluateModal(memberNickname, departmentName) {
  const modal = new ModalBuilder()
    .setCustomId(`evaluate_modal:${encodeModalValue(memberNickname)}:${encodeModalValue(departmentName)}`)
    .setTitle(`Avaliar: ${memberNickname} - ${departmentName}`);

  const components = DEFAULT_CRITERIA.map((criterion) => {
    const input = new TextInputBuilder()
      .setCustomId(fieldIdForCriterion(criterion))
      .setLabel(criterion)
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Ex: Excelente, Bom, Regular, Ruim...')
      .setRequired(true)
      .setMaxLength(500);

    return new ActionRowBuilder().addComponents(input);
  });

  modal.addComponents(...components);
  return modal;
}

function parseEvaluateModalCustomId(customId) {
  const parts = customId.split(':');

  if (parts.length !== 3 || parts[0] !== 'evaluate_modal') {
    return null;
  }

  return {
    nickname: decodeModalValue(parts[1]),
    departmentName: decodeModalValue(parts[2]),
  };
}

function parseScoresFromModal(interaction) {
  const scores = {};

  for (const criterion of DEFAULT_CRITERIA) {
    scores[criterion] = interaction.fields.getTextInputValue(fieldIdForCriterion(criterion));
  }

  return scores;
}

module.exports = { createEvaluateModal, parseEvaluateModalCustomId, parseScoresFromModal };

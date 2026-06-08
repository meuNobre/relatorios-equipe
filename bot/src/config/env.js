const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

function requireEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`A variável de ambiente ${name} precisa estar configurada.`);
  }

  return value;
}

const databasePath = process.env.DATABASE_PATH || './data/myfeedback.sqlite';

module.exports = {
  discord: {
    // Só exigimos token/client/guild quando o bot inicia. Assim, npm run migrate funciona sem login no Discord.
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.DISCORD_CLIENT_ID,
    guildId: process.env.DISCORD_GUILD_ID,
    requireReady() {
      requireEnv('DISCORD_TOKEN');
      requireEnv('DISCORD_CLIENT_ID');
      requireEnv('DISCORD_GUILD_ID');
    },
  },
  database: {
    // Guardamos o caminho absoluto para o SQLite funcionar igual mesmo se o bot for iniciado de outro diretório.
    path: path.resolve(process.cwd(), databasePath),
  },
  renderApi: {
    url: process.env.RENDER_API_URL || 'http://localhost:8000',
  },
};

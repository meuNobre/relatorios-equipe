const { request } = require('undici');
const env = require('../config/env');

function createRenderClient() {
  async function renderReport(payload) {
    const response = await request(`${env.renderApi.url}/reports/render`, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'content-type': 'application/json' },
    });

    if (response.statusCode !== 200) {
      const body = await response.body.text();
      throw new Error(`Render API respondeu ${response.statusCode}: ${body}`);
    }

    return Buffer.from(await response.body.arrayBuffer());
  }

  return { renderReport };
}

module.exports = { createRenderClient };

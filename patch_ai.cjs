const fs = require('fs');
let content = fs.readFileSync('src/lib/ai.ts', 'utf-8');

const regex = /if \(\!config\.apiKey\) \{[\s\S]*?return data\.text;\s*\} catch \(err: any\) \{[\s\S]*?\}\s*\}/;

const replace = `if (!config.apiKey) {
    throw new Error('API Key is missing for ' + config.provider);
  }`;

content = content.replace(regex, replace);
fs.writeFileSync('src/lib/ai.ts', content);

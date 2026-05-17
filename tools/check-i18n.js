const fs = require('fs');
const path = require('path');

const i18nDir = path.join(__dirname, '..', 'src', 'assets', 'i18n');
const baseLanguage = 'fr';
const languages = ['en'];

function flatten(value, prefix = '', result = {}) {
  for (const [key, child] of Object.entries(value)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === 'object' && !Array.isArray(child)) {
      flatten(child, fullKey, result);
    } else {
      result[fullKey] = child;
    }
  }

  return result;
}

function readLanguage(language) {
  const filePath = path.join(i18nDir, `${language}.json`);
  return flatten(JSON.parse(fs.readFileSync(filePath, 'utf8')));
}

const base = readLanguage(baseLanguage);
let hasError = false;

for (const language of languages) {
  const current = readLanguage(language);
  const missing = Object.keys(base).filter((key) => !(key in current));
  const extra = Object.keys(current).filter((key) => !(key in base));

  if (missing.length || extra.length) {
    hasError = true;
    console.error(`i18n mismatch: ${language}.json`);
    if (missing.length) {
      console.error(`Missing keys:\n${missing.map((key) => `  - ${key}`).join('\n')}`);
    }
    if (extra.length) {
      console.error(`Extra keys:\n${extra.map((key) => `  - ${key}`).join('\n')}`);
    }
  }
}

if (hasError) {
  process.exit(1);
}

console.log('i18n files are in sync.');

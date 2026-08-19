const fs = require('fs');
const path = require('path');

/**
 * Garde-fou d'encodage.
 *
 * Des fichiers sources avaient ete enregistres en Windows-1252 au lieu d'UTF-8, ce qui
 * affichait « Cong? » a la place de « Conge » accentue. Pire, rouvrir puis re-sauver un
 * tel fichier en UTF-8 remplace definitivement les accents par U+FFFD : la donnee est
 * perdue et doit etre retapee a la main.
 *
 * Ce script echoue si un fichier source n'est pas de l'UTF-8 valide, ou s'il contient
 * deja le caractere de remplacement. `.editorconfig` declare bien `charset = utf-8`,
 * mais tous les editeurs ne l'honorent pas : cette verification, elle, est mecanique.
 *
 * Usage : npm run encoding:check
 */

const root = path.join(__dirname, '..', 'src');
const EXTENSIONS = ['.ts', '.html', '.scss', '.css', '.json'];
const IGNORED_DIRS = new Set(['node_modules', 'dist', '.angular', '.git']);
const REPLACEMENT_CHAR = '�';

/** UTF-8 strict : Buffer.toString('utf8') remplace silencieusement, TextDecoder leve. */
const strictDecoder = new TextDecoder('utf-8', { fatal: true });

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) yield* walk(path.join(dir, entry.name));
    } else if (EXTENSIONS.includes(path.extname(entry.name))) {
      yield path.join(dir, entry.name);
    }
  }
}

const notUtf8 = [];
const corrupted = [];

for (const file of walk(root)) {
  const bytes = fs.readFileSync(file);
  const relative = path.relative(path.join(__dirname, '..'), file);

  let text;
  try {
    text = strictDecoder.decode(bytes);
  } catch {
    notUtf8.push(relative);
    continue;
  }
  if (text.includes(REPLACEMENT_CHAR)) corrupted.push(relative);
}

if (notUtf8.length) {
  console.error(
    `\nFichiers qui ne sont pas en UTF-8 (probablement Windows-1252) :\n` +
    notUtf8.map((f) => `  - ${f}`).join('\n') +
    `\n  Corriger : reenregistrer le fichier en UTF-8 sans BOM.`
  );
}

if (corrupted.length) {
  console.error(
    `\nFichiers contenant le caractere de remplacement U+FFFD :\n` +
    corrupted.map((f) => `  - ${f}`).join('\n') +
    `\n  Les accents y ont ete perdus : ils doivent etre retapes a la main.`
  );
}

if (notUtf8.length || corrupted.length) {
  process.exit(1);
}

console.log('Tous les fichiers sources sont en UTF-8 valide.');

#!/usr/bin/env node
// Troca a URL do site (SITE_URL) em todos os arquivos de uma vez.
// Uso: node scripts/set-site-url.mjs https://seu-projeto.vercel.app
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const FILES = ['index.html', 'robots.txt', 'sitemap.xml', 'site.config.json'];

const arg = (process.argv[2] || '').trim().replace(/\/+$/, '');
if (!/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}$/i.test(arg)) {
  console.error('Informe a URL completa, com https:// e sem barra no final.');
  console.error('Exemplo: node scripts/set-site-url.mjs https://rei-do-iphone-jp.vercel.app');
  process.exit(1);
}

const configPath = join(root, 'site.config.json');
const current = JSON.parse(readFileSync(configPath, 'utf8')).SITE_URL;
let total = 0;
for (const file of FILES) {
  const path = join(root, file);
  const before = readFileSync(path, 'utf8');
  const count = before.split(current).length - 1;
  writeFileSync(path, before.split(current).join(arg));
  total += count;
  console.log(`${file}: ${count} ocorrência(s)`);
}
console.log(`\nSITE_URL: ${current}  ->  ${arg}  (${total} trocas)`);

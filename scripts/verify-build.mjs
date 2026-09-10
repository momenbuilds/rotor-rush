import { access, readdir, stat } from 'node:fs/promises';

const requiredFiles = ['dist/index.html', 'dist/favicon.svg', 'dist/manifest.webmanifest'];
await Promise.all(requiredFiles.map(file => access(file)));

const assets = await readdir('dist/assets');
const requiredCharacters = ['elon-pilot.webp', 'elon-pilot-back.webp', 'trump.webp', 'obama.webp', 'biden.webp', 'hunter-biden.webp'];

for (const character of requiredCharacters) {
  if (!assets.includes(character)) throw new Error(`Missing optimized character asset: ${character}`);
  const { size } = await stat(`dist/assets/${character}`);
  if (size > 100_000) throw new Error(`${character} is too large (${size} bytes)`);
}

const scripts = assets.filter(file => file.endsWith('.js'));
const styles = assets.filter(file => file.endsWith('.css'));
if (scripts.length < 2 || styles.length !== 1) throw new Error('Expected lazy game and bootstrap JavaScript bundles plus one CSS bundle.');

console.log(`Verified production build: ${assets.length} assets, all character textures under 100 KB.`);

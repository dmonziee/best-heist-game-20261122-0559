// The Meridian Job — hand-in program (Node 22, standard library only).
//
// This program takes the game in this repository's game/ folder, a plain set of
// static files a desktop browser loads offline (game/index.html and its ES
// modules, no library and no network request), and hands it in. It copies
// game/ and screenshots/ from beside this file to the output directory and
// writes output/dossier.json, the summary the judge reads, with the vendored
// make.fun library. The game itself is a top-down stealth heist: slip past
// patrolling guards and sweeping cameras, crack the glass case, lift the Star
// of Meridian and get out the service door before the alarm hits the top.
//
// Run it outside the grader with MAKEFUN_OUTPUT_DIR set:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const dossierOptions = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'game'), join(outputDir, 'game'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), {
    recursive: true,
  });
}

writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, dossierOptions),
);

// One line on stdout so whoever runs the hand-in can see what landed
// without opening the dossier: game files, screenshots, cover index.
function countFiles(dir) {
  return readdirSync(dir).reduce((n, name) => {
    const p = join(dir, name);
    return n + (statSync(p).isDirectory() ? countFiles(p) : 1);
  }, 0);
}
const shotFiles = readdirSync(join(repoRoot, 'screenshots'))
  .filter((f) => /\.(png|jpe?g)$/i.test(f))
  .sort();
const dossier = JSON.parse(
  readFileSync(join(outputDir, 'dossier.json'), 'utf8'),
);
console.log(
  `The Meridian Job: ${countFiles(join(repoRoot, 'game'))} game files, ` +
    `${shotFiles.length} screenshots (cover ${shotFiles[dossier.cover] ?? shotFiles[0]}) -> ${outputDir}`,
);

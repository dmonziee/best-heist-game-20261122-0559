# The Meridian Job — a stealth heist game

[![make.fun](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/dmonziee/best-heist-game-20261122-0559/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/dmonziee/best-heist-game-20261122-0559/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)

A top-down stealth heist in one room: the Meridian Gallery after dark. Slip
past five patrolling guards and three sweeping wall cameras, crack the glass
case, lift the Star of Meridian — and, if you are feeling greedy, crack the
walled vault in the bottom-right corner for the Meridian Sceptre — then get
out the service door before the alarm meter hits 100%.

## How it plays

- **Move** with WASD or the arrow keys; hold **Shift** to sprint (loud — the
  guards spot a sprinter faster).
- **Difficulty:** press **1** Easy, **2** Normal or **3** Hard on the briefing
  screen. Harder jobs mean faster guards, longer sight lines and a quicker
  alarm.
- **Shadows** are your friend: the dark patches on the floor halve how fast
  detectors fill the alarm.
- **Hold E** beside the pedestal to crack the case (2.5 s). It trips the
  case alarm, so be ready to run.
- **The vault:** hold **E** at the plinth inside the annex (4 s) to lift the
  Meridian Sceptre for +400. It trips a +25 alarm and Voss patrols the
  annex — time it right, or spend a smoke pellet on it.
- **Tools, at a cost:** `1` drops a smoke pellet (2 uses, −100 score),
  `2` fires an EMP that blinds the cameras for 8 s (1 use, −150 score).
- **Alarm:** rises while any cone has eyes on you, falls while you stay
  hidden. Past 70 the guards abandon patrol and hunt your last seen spot.
  At 100 the gallery locks down and the run ends.
- **Win:** reach the service door with the diamond. Score is the diamond
  (1000) plus the vault (400), a time bonus, a stealth bonus and a GHOST
  bonus (+150 if no guard or camera ever spotted you), minus tools spent.
  Your best score is saved between runs.
- **P** pauses, **M** mutes, **R** restarts.

Five ways through the room: the shadowed left wall, the open central hall,
the right corridor past the coin case, the carpeted middle path, and the
vault annex itself. Every run uses the same patrols, so the job is fair
and learnable.

## Verified playthroughs

Both routes below were driven hands-free in headless Chrome against the
live game (scripted key input, no cheats) and both end in GETAWAY CLEAN:

- **Diamond only:** 48.2 s, score 1704 (diamond 1000, time bonus 504,
  stealth 300, one smoke −100), alarm peaked at 15%.
- **Diamond + vault:** 48.1 s, score 1854 (diamond 1000, vault 400, time
  bonus 504, stealth 300, smoke + EMP + smoke −350), alarm peaked at 25%.

The vault run waits at the annex door until Voss is at the bottom of his
beat and walking away, cracks the sceptre from the far side of his patrol
line, and leaves the same way — crossing his line while he is at the far
end is what keeps the run alive. The logic suite (26 checks: vault walls,
door gap, patrols, camera 3 on the sceptre, difficulty ordering, vault
timing and alarm, lockpick, tools, exit, all four screenshot poses) passes
26/26.

## Play it

Serve `game/` with any static server and open `game/index.html` in desktop
Chrome — no network, no build step, no assets beyond the files in `game/`.

```sh
python3 -m http.server 8080 --directory game
```

## Files

- `game/index.html` — the page and canvas
- `game/src/config.js` — tuning, difficulty and look
- `game/src/level.js` — the gallery layout (walls, cases, shadows, vault,
  routes)
- `game/src/vision.js` — cones and line of sight
- `game/src/guards.js` — patrol, suspicion, hunt
- `game/src/cameras.js` — sweeping wall cameras and EMP
- `game/src/player.js` — the thief, lockpick, vault crack, smoke and EMP
- `game/src/alarm.js` — the alarm meter
- `game/src/audio.js` — synthesized sound, no files
- `game/src/render.js` — everything drawn on the canvas
- `game/src/poses.js` — staged moments for the screenshots
- `game/src/main.js` — game loop and state machine
- `main.ts` — hands the game in: copies `game/` and `screenshots/` to
  `/output` and writes `/output/dossier.json`
- `screenshots/` — four real renders of the game

Built for the make.fun best-heist-game-20261122-0559 bounty. MIT licensed.

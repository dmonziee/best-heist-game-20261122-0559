# The Meridian Job — a stealth heist game

[![make.fun](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/dmonziee/best-heist-game-20261122-0559/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/dmonziee/best-heist-game-20261122-0559/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)

A top-down stealth heist in one room: the Meridian Gallery after dark. Slip
past three patrolling guards and two sweeping wall cameras, crack the glass
case, lift the Star of Meridian, and get out the service door before the
alarm meter hits 100%.

## How it plays

- **Move** with WASD or the arrow keys; hold **Shift** to sprint (loud — the
  guards spot a sprinter faster).
- **Shadows** are your friend: the dark patches on the floor halve how fast
  detectors fill the alarm.
- **Hold E** beside the pedestal to crack the case (2.5 s). It trips the
  case alarm, so be ready to run.
- **Tools, at a cost:** `1` drops a smoke pellet (2 uses, −100 score),
  `2` fires an EMP that blinds the cameras for 8 s (1 use, −150 score).
- **Alarm:** rises while any cone has eyes on you, falls while you stay
  hidden. Past 70 the guards abandon patrol and hunt your last seen spot.
  At 100 the gallery locks down and the run ends.
- **Win:** reach the service door with the diamond. Score is the diamond
  (1000) plus a time bonus and a stealth bonus, minus tools spent.
- **P** pauses, **M** mutes, **R** restarts.

Three ways through the room: the shadowed left wall, the open central hall,
and the right corridor past the coin case. Every run uses the same patrols,
so the job is fair and learnable.

## Play it

Serve `game/` with any static server and open `game/index.html` in desktop
Chrome — no network, no build step, no assets beyond the files in `game/`.

```sh
python3 -m http.server 8080 --directory game
```

## Files

- `game/index.html` — the page and canvas
- `game/src/config.js` — tuning and look
- `game/src/level.js` — the gallery layout (walls, cases, shadows, routes)
- `game/src/vision.js` — cones and line of sight
- `game/src/guards.js` — patrol, suspicion, hunt
- `game/src/cameras.js` — sweeping wall cameras and EMP
- `game/src/player.js` — the thief, lockpick, smoke and EMP
- `game/src/alarm.js` — the alarm meter
- `game/src/audio.js` — synthesized sound, no files
- `game/src/render.js` — everything drawn on the canvas
- `game/src/poses.js` — staged moments for the screenshots
- `game/src/main.js` — game loop and state machine
- `main.ts` — hands the game in: copies `game/` and `screenshots/` to
  `/output` and writes `/output/dossier.json`
- `screenshots/` — four real renders of the game

Built for the make.fun best-heist-game-20261122-0559 bounty. MIT licensed.

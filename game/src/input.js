// Keyboard input: one shared state object the player and the game loop read.
// Keys are tracked by their code so WASD and the arrow keys both work.

export function createInput() {
  const keys = new Set();
  const pressed = new Set();

  function onKeyDown(event) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) {
      event.preventDefault();
    }
    if (!keys.has(event.code)) pressed.add(event.code);
    keys.add(event.code);
  }

  function onKeyUp(event) {
    keys.delete(event.code);
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  return {
    // Held-down movement, as a unit vector (or zero when idle).
    moveVector() {
      let x = 0;
      let y = 0;
      if (keys.has('KeyA') || keys.has('ArrowLeft')) x -= 1;
      if (keys.has('KeyD') || keys.has('ArrowRight')) x += 1;
      if (keys.has('KeyW') || keys.has('ArrowUp')) y -= 1;
      if (keys.has('KeyS') || keys.has('ArrowDown')) y += 1;
      if (x !== 0 && y !== 0) {
        const inv = 1 / Math.hypot(x, y);
        x *= inv;
        y *= inv;
      }
      return { x, y };
    },
    sprinting() {
      return keys.has('ShiftLeft') || keys.has('ShiftRight');
    },
    lockpickHeld() {
      return keys.has('KeyE');
    },
    // True once per physical press; the game loop clears it each frame.
    wasPressed(code) {
      return pressed.has(code);
    },
    endFrame() {
      pressed.clear();
    },
    anyKey() {
      return pressed.size > 0;
    },
  };
}

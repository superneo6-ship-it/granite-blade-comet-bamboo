function beep(frequencies: number[], durationSec: number) {
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioCtx) return;
  try {
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    frequencies.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now);
      const start = now + index * (durationSec * 0.55);
      gain.gain.exponentialRampToValueAtTime(0.05, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        start + durationSec,
      );
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + durationSec + 0.02);
    });
    window.setTimeout(() => {
      void ctx.close();
    }, 400);
  } catch {
    // Audio may be blocked without a user gesture.
  }
}

function vibrate(pattern: number | number[]) {
  try {
    const activation = navigator.userActivation;
    if (!activation || !(activation.isActive || activation.hasBeenActive)) {
      return;
    }
    navigator.vibrate?.(pattern);
  } catch {
    /* ignore */
  }
}

export function signalFound() {
  vibrate([28, 36, 48]);
  beep([880, 1174], 0.09);
}

export function signalMiss() {
  vibrate([90]);
  beep([196], 0.14);
}

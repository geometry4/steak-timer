// Must be called from a user gesture first (e.g. the Start button).
// After that, the stored context can play sounds freely.
let ctx = null;
export function initAudio() {
    if (!ctx)
        ctx = new AudioContext();
}
function beep(freq, startAt, dur) {
    if (!ctx)
        return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.7, ctx.currentTime + startAt);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startAt + dur);
    osc.start(ctx.currentTime + startAt);
    osc.stop(ctx.currentTime + startAt + dur + 0.01);
}
export function playAlarm() {
    beep(880, 0, 0.2);
    beep(880, 0.3, 0.2);
    beep(1046, 0.6, 0.35);
}

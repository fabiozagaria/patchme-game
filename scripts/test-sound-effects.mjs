import assert from "node:assert/strict";

let startedNotes = 0;

class FakeAudioParam {
  setValueAtTime() {}
  exponentialRampToValueAtTime() {}
}

class FakeAudioNode {
  connect() {
    return this;
  }
}

class FakeOscillator extends FakeAudioNode {
  frequency = new FakeAudioParam();
  start() {
    startedNotes += 1;
  }
  stop() {}
}

class FakeGain extends FakeAudioNode {
  gain = new FakeAudioParam();
}

class FakeAudioContext {
  currentTime = 0;
  destination = new FakeAudioNode();
  state = "running";
  createOscillator() {
    return new FakeOscillator();
  }
  createGain() {
    return new FakeGain();
  }
  resume() {
    this.state = "running";
    return Promise.resolve();
  }
}

globalThis.window = {};
globalThis.document = { hidden: false };
globalThis.AudioContext = FakeAudioContext;

const { playGameSound, setSoundEffectsEnabled } = await import("../src/lib/sound-effects.ts");

setSoundEffectsEnabled(false);
playGameSound("success");
assert.equal(startedNotes, 0, "Il mute deve impedire qualsiasi nota");

setSoundEffectsEnabled(true);
playGameSound("success");
assert.equal(startedNotes, 2, "Il salvataggio deve riprodurre due note");

playGameSound("level-up");
assert.equal(startedNotes, 6, "Il level-up deve aggiungere quattro note");

document.hidden = true;
playGameSound("trophy");
assert.equal(startedNotes, 6, "Una scheda nascosta non deve produrre audio");

console.log("Effetti sonori: 4 controlli superati.");

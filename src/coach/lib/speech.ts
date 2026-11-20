/**
 * Voz do coach (Web Speech API, pt-BR). Funciona offline na maioria dos
 * aparelhos. No iOS, a primeira fala precisa nascer de um toque do usuário:
 * por isso `warmUp()` é chamado no botão que abre a câmera.
 */
const KEY = "aurum:coach-voz";

let voice: SpeechSynthesisVoice | null = null;

function supported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function pickVoice() {
  if (!supported()) return;
  const voices = window.speechSynthesis.getVoices();
  const pt = voices.filter((v) => v.lang?.toLowerCase().replace("_", "-").startsWith("pt-br"));
  voice =
    pt.find((v) => /google/i.test(v.name)) ??
    pt.find((v) => /luciana|francisca|thalita|maria/i.test(v.name)) ??
    pt[0] ??
    voices.find((v) => v.lang?.toLowerCase().startsWith("pt")) ??
    null;
}

if (supported()) {
  pickVoice();
  window.speechSynthesis.addEventListener?.("voiceschanged", pickVoice);
}

export function voiceEnabled() {
  try {
    return localStorage.getItem(KEY) !== "0";
  } catch {
    return true;
  }
}

export function setVoiceEnabled(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? "1" : "0");
  } catch {
    /* sem armazenamento: vale só para esta visita */
  }
  if (!on) stopSpeech();
}

export function warmUp() {
  if (!supported()) return;
  const u = new SpeechSynthesisUtterance(" ");
  u.volume = 0;
  u.lang = "pt-BR";
  window.speechSynthesis.speak(u);
}

export function speak(text: string, opts: { interrupt?: boolean } = {}) {
  if (!supported() || !voiceEnabled()) return;
  const synth = window.speechSynthesis;
  if (opts.interrupt) synth.cancel();
  // Fila curta: o coach não deve "atrasar" falando coisas velhas
  else if (synth.pending) synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "pt-BR";
  if (voice) u.voice = voice;
  u.rate = 1.08;
  u.pitch = 1;
  synth.speak(u);
}

export function stopSpeech() {
  if (supported()) window.speechSynthesis.cancel();
}

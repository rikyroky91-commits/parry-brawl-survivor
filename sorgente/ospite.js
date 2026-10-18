/* Parry Brawl Survivor sul web: il ponte fra il motore e il browser (18/10/2026).
 *
 * È il gemello di `android/web/ponte.js` del repo android-updater: lì la memoria e i messaggi passano
 * da Java, qui da `localStorage` e dai comandi del sito (`hud.js`). Il motore (`ring.js`), l'avvio
 * (`prepara.js`) e le arene arrivano da android-updater a un commit fissato (vedi `motore.json`).
 */
(function () {
  "use strict";
  var CHIAVE = "pbs-memoria";
  var dati = {};
  try { dati = JSON.parse(window.localStorage.getItem(CHIAVE) || "{}") || {}; } catch (e) { dati = {}; }

  // Di serie, sul sito: audio acceso (la musica è metà del gioco), lingua del telefono, lotte accese.
  var LINGUE = ["it", "en", "es", "fr", "de"];
  if (!dati["pb-lingua"]) {
    var l = String((navigator.languages && navigator.languages[0]) || navigator.language || "en").slice(0, 2).toLowerCase();
    dati["pb-lingua"] = LINGUE.indexOf(l) >= 0 ? l : "en";
  }
  if (!dati["mut-ring-audio"]) dati["mut-ring-audio"] = "on";

  function salva(oggetto) {
    for (var k in oggetto) if (Object.prototype.hasOwnProperty.call(oggetto, k)) dati[k] = String(oggetto[k]);
    try { window.localStorage.setItem(CHIAVE, JSON.stringify(dati)); } catch (e) { /* memoria piena o privata: resta per questa volta */ }
  }
  salva({});

  window.__ringNome = "Parry Brawl Survivor";
  window.__ringMotto = "Para al momento giusto. A tempo di musica.";
  window.__ringMusicaBase = "sempre";
  // I due modi del sito (18/10/2026, Riccardo): la corsa nel cortile di pietra, largo e con le lastre che si rompono;
  // al posto del combattimento libero l'1 contro 1 sulla lava, dove comandi il tuo lottatore dal primo istante.
  window.__ringModoLibero = {
    nome: "1 contro 1", icona: "\u{1F30B}", unoControUno: true,
    testo: "Tu contro un lottatore, sulla piattaforma sopra la lava. Para i suoi colpi, buttalo giù, non cadere.",
  };
  // Aperta senza ?tipo= (l'anteprima, un link): il cortile di pietra, che è lo sfondo del menu.
  try { if (!/[?&]tipo=/.test(location.search) && window.__pbArena) window.__pbArena("arena"); } catch (e) { /* resta quella che c'è */ }
  window.__ringModoScelto = function (modo) {
    try { if (window.__pbArena) window.__pbArena(modo === "libero" ? "lava" : "arena"); } catch (e) { /* resta l'arena di prima */ }
  };
  window.__ringDati = dati;
  window.__lingueSoloDizionario = true;
  // Vita, punteggio, abilità, parata: li disegna il sito (hud.js), non il canvas.
  window.__ringHudEsterno = true;
  window.__ringBordoOggetti = 0.1;
  window.__pbModo = "arena";
  window.__pbSalva = salva;

  // La grafica: 60 fps, risoluzione piena fino a dpr 2 (sopra costa e non si vede), dettaglio medio.
  var dpr = window.devicePixelRatio || 1;
  window.__ringGrafica = {
    fps: [30, 60, 120].indexOf(+dati["pb-fps"]) >= 0 ? +dati["pb-fps"] : 60,
    risoluzione: Math.max(50, Math.min(100, +dati["pb-risoluzione"] || Math.round(Math.min(1, 2 / dpr) * 100))) / 100,
    dettaglio: ["basso", "medio", "alto"].indexOf(dati["pb-dettaglio"]) >= 0 ? dati["pb-dettaglio"] : "medio",
  };

  // La misura dei lottatori: dal lato corto dello schermo (400 px = 1), come nell'app.
  var TAGLIE = { piccoli: 0.8, medi: 1, grandi: 1.25 };
  var taglia = TAGLIE[dati["pb-taglia"]] || 1;
  window.__pbScala = function (W, H) {
    var lato = Math.min(W, H) || 400;
    return Math.max(0.85, Math.min(1.25, lato / 400)) * taglia;
  };

  // La classifica globale: la stessa del sito del tracker, dell'estensione e dell'app.
  var CLASSIFICA = "https://mobileupdatetracker.duckdns.org/api/corsa";
  window.__pbClassifica = {
    carica: function () {
      return fetch(CLASSIFICA + "/classifica?limite=10", { cache: "no-store", credentials: "omit" })
        .then(function (r) { if (!r.ok) throw r.status; return r.json(); });
    },
    invia: function (d) {
      return fetch(CLASSIFICA + "/punteggio", { method: "POST", credentials: "omit", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, d: j }; }); });
    },
  };

  // «Opzioni» e «Guida» dalla tendina del motore: le apre il menu del sito.
  window.__pbMessaggio = function (m) {
    try { if (window.__pbsMenu) window.__pbsMenu(m && m.tipo); } catch (e) { /* niente */ }
  };

  // I tocchi passano prima dal sito, poi dal motore: il motore ascolta `pointerdown` sulla finestra in fase di cattura,
  // e chi si registra prima viene servito prima. Qui (caricato prima di ring.js) si mette il gancio; la croce
  // invisibile di hud.js (`window.__pbsTocco`) decide se il tocco è suo e allora lo ferma.
  ["pointerdown", "pointermove", "pointerup", "pointercancel"].forEach(function (tipo) {
    window.addEventListener(tipo, function (ev) { if (typeof window.__pbsTocco === "function") window.__pbsTocco(ev); }, { capture: true, passive: false });
  });

  // iPhone: con l'interruttore silenzioso Safari zittisce l'audio delle pagine. Dichiarato come
  // «riproduzione», suona come un'app di musica (Safari 17 e successivi; gli altri lo ignorano).
  try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch (e) { /* niente */ }
})();

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

  // ·· PC o telefono (18/10/2026, Riccardo: «riconosca se sei su pc o mobile e quando sei su pc i comandi devono essere
  // come quelli della pagina web, cioè con i comandi radiali») ··
  // Telefono e tablet: i comandi touch del sito (hud.js) al posto di quelli del motore. PC: i comandi del motore, come
  // sul sito del tracker e nell'estensione (controller radiale, tendina, tastiera, anello del parry sul lottatore).
  // Si decide da sé; si forza col menu (`pbs-comandi`: "pc" o "touch", poi si ricarica) o con ?comandi=pc|touch.
  function comandiPc() {
    var q = /[?&]comandi=(pc|touch)\b/.exec(location.search);
    if (q) return q[1] === "pc";
    if (dati["pbs-comandi"] === "pc" || dati["pbs-comandi"] === "touch") return dati["pbs-comandi"] === "pc";
    var ua = navigator.userAgent || "";
    if (/Android|iPhone|iPad|iPod|Mobile|Silk|Kindle/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) return false;
    var mm = window.matchMedia ? function (q) { return window.matchMedia(q).matches; } : function () { return false; };
    // (un portatile col touch ma col mouse o il touchpad è un PC; uno schermo solo a dita, no)
    if (mm("(any-pointer: fine)")) return true;
    return !mm("(pointer: coarse)");
  }
  window.__pbsPc = comandiPc();
  document.documentElement.classList.add(window.__pbsPc ? "pbs-pc" : "pbs-touch");
  // Le frecce per guidare il lottatore: facoltative e spente di serie (Riccardo: «deve essere una cosa opzionale, il
  // personaggio si muove da solo»). Accese: ← → camminano, ↑ decolla, ↓ atterra; lasciate, torna a fare da sé.
  window.__pbsFrecce = dati["pbs-frecce"] === "on";

  // Telefono: vita, punteggio, abilità, parata li disegna il sito (hud.js), non il canvas. PC: li disegna il motore.
  window.__ringHudEsterno = !window.__pbsPc;
  // Niente suggerimenti dei tasti disegnati sul canvas (finivano sopra le voci del menu) e il controller radiale
  // nell'angolo in basso dello schermo, non sul pavimento dell'arena (18/10/2026, Riccardo).
  window.__ringSuggerimenti = false;
  window.__ringRadialeInBasso = true;
  // Il suolo dell'arena protagonista: zombie, gemme e forzieri escono dal terreno, che tiene i segni (vedi arena.html).
  window.__ringSuolo = true;
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
  // (I pannelli del sito stanno in `#pbs-hud`, che porta `data-ring-fuori`: il motore non ci prende i tocchi.)
  if (!window.__pbsPc) ["pointerdown", "pointermove", "pointerup", "pointercancel"].forEach(function (tipo) {
    window.addEventListener(tipo, function (ev) { if (typeof window.__pbsTocco === "function") window.__pbsTocco(ev); }, { capture: true, passive: false });
  });

  // ·· Le frecce (vedi `__pbsFrecce`) ··
  // Registrato prima del motore, che ascolta la tastiera anche lui in fase di cattura: in lotta le frecce le prende il
  // sito. Spente non fanno niente (il lottatore va da sé); accese ← → camminano (anche tenute premute) e ↑ ↓ decollano
  // e atterrano, con la tastiera del motore accesa o spenta. Nei menu, nella scelta delle carte, nella mira e mentre si
  // scrive il nome in classifica restano del motore, come sempre.
  var FRECCE = { ArrowLeft: "sinistra", ArrowRight: "destra", ArrowUp: "su", ArrowDown: "giu" };
  function inLotta(r) {
    var m;
    try { m = r.mosse(); if (r.pausa() || r.pannello()) return null; } catch (e) { return null; }
    if (!m.acceso || m.menu || m.scelta || m.vuoleTocchi) return null;
    if (m.corsa && !(m.corsaHud && m.corsaHud.fase === "lotta")) return null;
    return m;
  }
  window.addEventListener("keydown", function (ev) {
    // Col menu del sito aperto la tastiera è sua (Esc o M lo chiudono): sotto, il motore non deve muovere i suoi menu.
    if (typeof window.__pbsFoglioTasto === "function" && window.__pbsFoglioTasto(ev)) { ev.stopImmediatePropagation(); return; }
    var id = FRECCE[ev.code];
    if (!id || ev.ctrlKey || ev.metaKey || ev.altKey) return;
    var dove = ev.composedPath ? ev.composedPath()[0] : ev.target;
    if (dove && (/^(INPUT|TEXTAREA|SELECT)$/.test(dove.tagName || "") || dove.isContentEditable)) return;
    var r = window.__ring, m = r && r.mosse ? inLotta(r) : null;
    if (!m) return;
    ev.preventDefault(); ev.stopImmediatePropagation();
    if (!window.__pbsFrecce) return;
    try {
      if (id === "sinistra" || id === "destra") {
        // Tenuta premuta: un passo subito e poi uno ogni 150 ms finché si lascia, senza aspettare la ripetizione del
        // sistema (che parte dopo mezzo secondo e cambia da un PC all'altro).
        if (ev.repeat || tenuta[id]) return;
        r.premi(id);
        tenuta[id] = setInterval(function () { try { if (inLotta(r) && window.__pbsFrecce) r.premi(id); } catch (e) { /* niente */ } }, 150);
        return;
      }
      if (ev.repeat) return;
      var chi = m.corsaHud ? m.corsaHud.chi : m.chi, io = (m.lottatori || []).filter(function (l) { return l.tipo === chi; })[0];
      if ((id === "su") !== !!(io && io.vola)) r.premi("vola");
    } catch (e) { /* niente */ }
  }, true);
  var tenuta = {};
  function lascia(id) { if (tenuta[id]) { clearInterval(tenuta[id]); tenuta[id] = 0; } }
  window.addEventListener("keyup", function (ev) { var id = FRECCE[ev.code]; if (id) lascia(id); }, true);
  window.addEventListener("blur", function () { lascia("sinistra"); lascia("destra"); });

  // iPhone: con l'interruttore silenzioso Safari zittisce l'audio delle pagine. Dichiarato come
  // «riproduzione», suona come un'app di musica (Safari 17 e successivi; gli altri lo ignorano).
  try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch (e) { /* niente */ }
})();

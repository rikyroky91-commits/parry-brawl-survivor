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

  // Di serie, sul sito: audio acceso (la musica è metà del gioco), lingua del telefono, lotte accese, stile guerrieri (Dragon Ball Z).
  var LINGUE = ["it", "en", "es", "fr", "de"];
  if (!dati["pb-lingua"]) {
    var l = String((navigator.languages && navigator.languages[0]) || navigator.language || "en").slice(0, 2).toLowerCase();
    dati["pb-lingua"] = LINGUE.indexOf(l) >= 0 ? l : "en";
  }
  if (!dati["mut-ring-audio"]) dati["mut-ring-audio"] = "on";
  if (!dati["mut-ring-stile"]) dati["mut-ring-stile"] = "guerrieri";
  if (!dati["mut-ring-anime"]) dati["mut-ring-anime"] = "on";
  try { if (!sessionStorage.getItem("pbs-ospite")) sessionStorage.setItem("pbs-ospite", "1"); } catch (e) {}

  function salva(oggetto) {
    var cambiato = false;
    for (var k in oggetto) if (Object.prototype.hasOwnProperty.call(oggetto, k)) { if (dati[k] !== String(oggetto[k])) cambiato = true; dati[k] = String(oggetto[k]); }
    try { window.localStorage.setItem(CHIAVE, JSON.stringify(dati)); } catch (e) { /* memoria piena o privata: resta per questa volta */ }
    if (cambiato && typeof spedisciPiuTardi === "function") spedisciPiuTardi();
  }
  salva({});

  window.__ringNome = "Parry Brawl Survivor";
  window.__ringMotto = "Para al momento giusto. A tempo di musica.";
  window.__ringMusicaBase = "sempre";
  // I due modi del sito (Brawl Tutti contro Tutti stile Super Smash Bros):
  // 4 combattenti nell'arena in una partita a tempo di 3 minuti, vince chi muore meno volte!
  window.__ringModoLibero = {
    nome: "Brawl", icona: "⚔️", unoControUno: false, brawl: true,
    testo: "Tutti contro tutti in una sfida a tempo di 3 minuti (Super Smash Bros style). Scegli il tuo combattente dal roster: vince chi muore meno volte!",
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
  // Le frecce per guidare il lottatore con priorità sull'automa (lasciate le frecce torna istantaneamente automatico).
  window.__pbsFrecce = dati["pbs-frecce"] !== "off";

  // Telefono: vita, punteggio, abilità, parata li disegna il sito (hud.js), non il canvas. PC: li disegna il motore.
  window.__ringHudEsterno = !window.__pbsPc;
  // Niente suggerimenti dei tasti disegnati sul canvas (finivano sopra le voci del menu) e il controller radiale
  // nell'angolo in basso dello schermo, non sul pavimento dell'arena (18/10/2026, Riccardo).
  window.__ringSuggerimenti = false;
  window.__ringRadialeInBasso = true;
  // Il suolo dell'arena protagonista: zombie, gemme e forzieri escono dal terreno, che tiene i segni (vedi arena.html).
  window.__ringSuolo = true;
  // Accanto al menu iniziale, i personaggi con le loro doti da alzare coi crediti (il roster del motore).
  window.__ringRoster = true;
  // Solo i super guerrieri di serie: classici, maghi e duellanti si sbloccano coi crediti (19/10/2026, vedi
  // «LE FAMIGLIE DA SBLOCCARE» nel motore).
  window.__ringSblocchi = true;
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

  // ·· Le frecce direzionali ··
  // Il controllo fisico continuo e prioritario dei direzionali è gestito nativamente dal motore (ring.js).
  // Lasciamo che gli eventi fluiscano direttamente a ring.js senza bloccarli né intercettarli.
  window.addEventListener("keydown", function (ev) {
    // Col menu del sito aperto la tastiera è sua (Esc o M lo chiudono): sotto, il motore non deve muovere i suoi menu.
    if (typeof window.__pbsFoglioTasto === "function" && window.__pbsFoglioTasto(ev)) { ev.stopImmediatePropagation(); return; }
  }, true);

  var tastiPremuti = {};
  window.addEventListener("blur", function () {
    tastiPremuti = {};
    try {
      var r = window.__ring;
      if (r && typeof r.lascia === "function") {
        r.lascia("sinistra");
        r.lascia("destra");
      }
    } catch (e) {}
  });

  // ·· L'account (18/10/2026, Riccardo: «una pagina di log semplice, nick, mail e password, così da poter conservare il
  // proprio personaggio nel proprio account») ··
  // Sul server del tracker (`/api/giocatore`, nel repo android-updater), lo stesso della classifica. Il salvataggio è la
  // memoria del gioco (crediti, bottega, allenamento dei personaggi, missioni, record, impostazioni): a ogni cambio si
  // spedisce dopo qualche secondo; all'apertura, se sul server ce n'è uno più nuovo, si prende quello e si riparte.
  // Il token sta in `pbs-account` (fuori dalla memoria del gioco, che finisce sul server).
  var API = "https://mobileupdatetracker.duckdns.org/api/giocatore";
  var CHIAVE_ACCOUNT = "pbs-account";
  var conto = null;
  try { conto = JSON.parse(window.localStorage.getItem(CHIAVE_ACCOUNT) || "null"); } catch (e) { conto = null; }
  function salvaConto() { try { if (conto) window.localStorage.setItem(CHIAVE_ACCOUNT, JSON.stringify(conto)); else window.localStorage.removeItem(CHIAVE_ACCOUNT); } catch (e) { /* niente */ } }
  // Cosa va nel salvataggio: tutto quello del gioco tranne cose del solo dispositivo.
  var SOLO_QUI = { "pbs-comandi": 1, "pb-fps": 1, "pb-risoluzione": 1, "pb-dettaglio": 1 };
  function salvataggio() { var o = {}; for (var k in dati) if (!SOLO_QUI[k]) o[k] = dati[k]; return o; }
  function chiama(metodo, via, corpo) {
    var h = { "Content-Type": "application/json" };
    if (conto && conto.token) h.Authorization = "Bearer " + conto.token;
    return fetch(API + via, { method: metodo, headers: h, credentials: "omit", cache: "no-store", body: corpo ? JSON.stringify(corpo) : undefined })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          if (r.status === 401 && conto && via !== "/accedi") { conto = null; salvaConto(); avvisa(); }
          if (!r.ok) throw new Error((j && j.errore) || (r.status === 0 ? "Server non raggiungibile" : "Errore " + r.status));
          return j;
        });
      }, function () { throw new Error("Server non raggiungibile: riprova fra poco"); });
  }
  var ascolta = [];
  function avvisa() { ascolta.forEach(function (f) { try { f(statoConto()); } catch (e) { /* niente */ } }); }
  function statoConto() { return conto ? { nick: conto.nick, salvato: conto.salvato || 0, errore: conto.errore || "" } : null; }
  var attesaInvio = 0;
  function spedisciPiuTardi() { if (!conto) return; clearTimeout(attesaInvio); attesaInvio = setTimeout(spedisci, 4000); }
  function spedisci() {
    if (!conto) return Promise.resolve();
    return chiama("PUT", "/salvataggio", { salvataggio: salvataggio() })
      .then(function (j) { if (conto) { conto.salvato = Date.now(); conto.aggiornato = j.aggiornato || conto.aggiornato; conto.errore = ""; salvaConto(); avvisa(); } })
      .catch(function (e) { if (conto) { conto.errore = e.message; avvisa(); } });
  }
  // Dal server alla memoria del gioco, poi si riparte (il motore legge la memoria solo all'avvio).
  function applica(s) {
    if (!s || typeof s !== "object") return false;
    var tieni = {}; for (var k in SOLO_QUI) if (dati[k] !== undefined) tieni[k] = dati[k];
    dati = {}; for (var c in s) if (Object.prototype.hasOwnProperty.call(s, c)) dati[c] = String(s[c]);
    for (var t in tieni) dati[t] = tieni[t];
    try { window.localStorage.setItem(CHIAVE, JSON.stringify(dati)); } catch (e) { /* niente */ }
    return true;
  }
  function dentro(j) {
    conto = { token: j.token, nick: j.nick, salvato: 0, aggiornato: j.aggiornato || null };
    salvaConto();
    // Account con un salvataggio: si gioca da lì. Account nuovo (o vuoto): ci va quello di questo dispositivo.
    if (j.salvataggio && Object.keys(j.salvataggio).length) { applica(j.salvataggio); conto.salvato = Date.now(); salvaConto(); setTimeout(function () { location.reload(); }, 300); return { ricarica: true }; }
    return spedisci().then(function () { avvisa(); return { ricarica: false }; });
  }
  window.__pbsAccount = {
    stato: statoConto,
    ascolta: function (f) { ascolta.push(f); },
    registra: function (nick, email, password) { return chiama("POST", "/registra", { nick: nick, email: email, password: password }).then(dentro); },
    accedi: function (login, password) { return chiama("POST", "/accedi", { login: login, password: password }).then(dentro); },
    esci: function () {
      var c = conto;
      return (c ? spedisci().then(function () { return chiama("POST", "/esci"); }) : Promise.resolve()).catch(function () { /* esce lo stesso */ })
        .then(function () { conto = null; salvaConto(); avvisa(); });
    },
    salvaOra: spedisci,
  };
  // All'apertura, con un account: il salvataggio del server, se è più nuovo di quello spedito da qui.
  if (conto) {
    chiama("GET", "/salvataggio").then(function (j) {
      if (!conto) return;
      var suServer = j.aggiornato ? Date.parse(j.aggiornato) : 0, mio = conto.salvato || 0;
      if (j.salvataggio && suServer && suServer > mio + 2000 && JSON.stringify(j.salvataggio) !== JSON.stringify(salvataggio())) {
        applica(j.salvataggio); conto.salvato = suServer; salvaConto(); location.reload();
      }
    }).catch(function () { /* fuori rete: si gioca con quello che c'è */ });
    window.addEventListener("pagehide", function () {
      if (!conto || !attesaInvio) return;
      // (chiudendo la pagina con un invio in sospeso: parte subito, senza aspettare la risposta)
      try { fetch(API + "/salvataggio", { method: "PUT", keepalive: true, credentials: "omit", headers: { "Content-Type": "application/json", Authorization: "Bearer " + conto.token }, body: JSON.stringify({ salvataggio: salvataggio() }) }); } catch (e) { /* niente */ }
    });
  }

  // iPhone: con l'interruttore silenzioso Safari zittisce l'audio delle pagine. Dichiarato come
  // «riproduzione», suona come un'app di musica (Safari 17 e successivi; gli altri lo ignorano).
  try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch (e) { /* niente */ }
})();

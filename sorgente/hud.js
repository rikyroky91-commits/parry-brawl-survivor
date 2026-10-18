/* I comandi touch di Parry Brawl Survivor (18/10/2026).
 *
 * Riccardo: «comandi ripensati per il mobile e un tasto apposito e animato a tempo del parry».
 *  - In alto la capsula: pausa · i lottatori (anello = vita; tocco = comandi l'altro) e il punteggio · menu.
 *  - La croce per camminare è invisibile: compare dove si appoggia il pollice nella metà sinistra (fuori dai
 *    lottatori, che restano da prendere col dito) e sparisce quando si stacca. Spinta in su: vola.
 *  - Il tasto AURA, sempre lì accanto alla parata: carica l'energia; piena, diventa LIMIT BREAK.
 *  - Ogni tasto vibra come in un gioco (Android; su iPhone, dove Safari lo permette, il tocco del sistema).
 *  - In basso a destra il tasto PARATA, grande sotto il pollice. Intorno un anello si stringe quando arriva un
 *    colpo parabile e tocca il bordo nell'istante del colpo: bianco, rosso se è un attacco che la parata non
 *    regge, d'oro dentro la finestra del parry, quasi bianco negli ultimi fotogrammi (parry perfetto). Fuori,
 *    l'arco della guardia. Con la musica il tasto respira sul battito. Tenuto premuto, si resta in guardia.
 *  - Intorno alla parata quattro abilità (nella corsa: colpo finale e i tre oggetti), che si colorano
 *    man mano che si ricaricano.
 *  - Sul PC (18/10/2026, `window.__pbsPc`, deciso in ospite.js) niente di tutto questo: comanda il motore, col suo
 *    controller radiale, la tendina e la tastiera, come sul sito del tracker. Da qui restano il menu del sito (tasto
 *    ☰ in alto a sinistra, o M), la taratura dell'audio e le frecce facoltative.
 *  - Nel menu «Installa sul telefono»: l'APK per Android, «Aggiungi alla schermata Home» per iPhone (Riccardo: «dal
 *    menu della web app dai le istruzioni per scaricare l'apk per android o aggiungere alla home da iphone»).
 * Tutto passa da `window.__ring` (il motore): `mosse()` ogni 120 ms, `tempoParry()` a ogni fotogramma,
 * `premi(id)` / `lascia(id)` per le azioni dei tasti, `musica()` e `calibra()` per l'audio.
 */
(function () {
  "use strict";
  var lingua = "en";
  try { lingua = String((window.__ringDati && window.__ringDati["pb-lingua"]) || "en"); } catch (e) { /* inglese */ }
  var T = {
    it: { aura: "AURA", limit: "LIMIT", pausa: "Pausa", menu: "Menu", riprendi: "Riprendi", opzioni: "Opzioni del ring",
          opzioniSotto: "Personaggi, imprevisti, grafica, tasti", musica: "Musica", sempre: "Sempre", corsa: "Solo nella corsa", mai: "Spenta",
          tara: "Sincronizza l'audio", taraSotto: "Con cuffie Bluetooth: tocca a tempo e il colpo arriva col suono", classifica: "Classifica globale",
          taglia: "Lottatori", piccoli: "Piccoli", medi: "Medi", grandi: "Grandi", app: "Tutto il telefono come ring", appSotto: "Con l'app Android (o installa questa pagina)",
          home: "Esci", taraTitolo: "Tocca a tempo", taraTesto: "Tocca il cerchio su ogni «tic», almeno otto volte.", fatto: "Fatto", rifai: "Rifai", chiudi: "Chiudi",
          ritardo: "Ritardo", parry: "PARRY", perfetto: "PERFETTO", rotta: "GUARDIA ROTTA", ricarica: "Ricarica la pagina per cambiare misura",
          installa: "Installa sul telefono", installaSotto: "Android: scarica l'APK · iPhone: aggiungi alla Home",
          frecce: "Frecce per guidare", frecceSotto: "← → cammina, ↑ vola, ↓ atterra. Spente, il lottatore va da solo", accese: "Accese", spente: "Spente",
          comandi: "Comandi", comandiSotto: "PC: controller radiale e tastiera · Touch: tasti sullo schermo", auto: "Automatici", pc: "PC", touch: "Touch",
          menuPc: "Menu (M)", sito: "Menu del sito: musica, frecce, comandi",
          instTitolo: "Installa Parry Brawl Survivor", instPc: "Sul telefono apri questo indirizzo, poi segui i passi qui sotto:", copia: "Copia", copiato: "Copiato",
          andTitolo: "Android: tutto il telefono è il ring", andTesto: "L'app usa le tue schermate vere come arena: Home, blocco schermo, qualsiasi app.",
          apk: "Scarica l'APK", apkArrivo: "APK in arrivo", apkInfo: "ultima versione",
          and1: "Apri il file scaricato. Chrome avvisa che potrebbe essere dannoso: è l'avviso di sempre per le app fuori dal Play Store. Tocca <b>Scarica comunque</b>.",
          and2: "Consenti a Chrome di <b>installare app sconosciute</b>, poi <b>Installa</b>.",
          and3: "Android 13 e successivi: se l'interruttore dell'accessibilità è grigio, apri <b>Info app → ⋮ → Consenti impostazioni con restrizioni</b>.",
          andWeb: "Senza APK: in Chrome <b>⋮ → Aggiungi a schermata Home</b>, per il gioco a schermo intero.", webApp: "Installa come web app",
          iosTitolo: "iPhone e iPad: aggiungi alla Home", iosGia: "È già sulla tua schermata Home: aprila da lì per giocare a schermo intero.",
          ios1: "Apri questa pagina in <b>Safari</b>.", ios2: "Tocca <b>Condividi</b> {icona} (in Safari è nella barra in basso).",
          ios3: "Scorri e scegli <b>Aggiungi alla schermata Home</b>, poi <b>Aggiungi</b>.",
          iosNota: "Su iPhone nessuna app può disegnare sopra la Home o le altre app: lì il gioco è a schermo intero.",
          pcWeb: "Installalo anche sul computer, in una finestra sua:", pcTitolo: "Su questo computer" },
    en: { aura: "AURA", limit: "LIMIT", pausa: "Paused", menu: "Menu", riprendi: "Resume", opzioni: "Ring options",
          opzioniSotto: "Characters, events, graphics, keys", musica: "Music", sempre: "Always", corsa: "Only in the run", mai: "Off",
          tara: "Sync audio", taraSotto: "With Bluetooth headphones: tap on the beat so hits land with the sound", classifica: "Global leaderboard",
          taglia: "Fighters", piccoli: "Small", medi: "Medium", grandi: "Large", app: "Your whole phone as the ring", appSotto: "With the Android app (or install this page)",
          home: "Exit", taraTitolo: "Tap on the beat", taraTesto: "Tap the circle on every \"tick\", at least eight times.", fatto: "Done", rifai: "Redo", chiudi: "Close",
          ritardo: "Delay", parry: "PARRY", perfetto: "PERFECT", rotta: "GUARD BROKEN", ricarica: "Reload the page to change size",
          installa: "Install on your phone", installaSotto: "Android: download the APK · iPhone: add to Home Screen",
          frecce: "Arrow keys steer", frecceSotto: "← → walk, ↑ fly, ↓ land. Off: the fighter moves on its own", accese: "On", spente: "Off",
          comandi: "Controls", comandiSotto: "PC: radial controller and keyboard · Touch: on-screen buttons", auto: "Automatic", pc: "PC", touch: "Touch",
          menuPc: "Menu (M)", sito: "Site menu: music, arrow keys, controls",
          instTitolo: "Install Parry Brawl Survivor", instPc: "On your phone open this address, then follow the steps below:", copia: "Copy", copiato: "Copied",
          andTitolo: "Android: your whole phone is the ring", andTesto: "The app uses your real screens as the arena: home screen, lock screen, any app.",
          apk: "Download the APK", apkArrivo: "APK coming soon", apkInfo: "latest version",
          and1: "Open the downloaded file. Chrome warns it could be harmful: it is the standard warning for apps from outside the Play Store. Tap <b>Download anyway</b>.",
          and2: "Allow Chrome to <b>install unknown apps</b>, then <b>Install</b>.",
          and3: "Android 13 or later: if the accessibility switch is grey, open <b>App info → ⋮ → Allow restricted settings</b>.",
          andWeb: "No APK: in Chrome use <b>⋮ → Add to Home screen</b> for the full-screen game.", webApp: "Install as a web app",
          iosTitolo: "iPhone and iPad: add to Home Screen", iosGia: "It is already on your Home Screen: open it from there to play full screen.",
          ios1: "Open this page in <b>Safari</b>.", ios2: "Tap <b>Share</b> {icona} (in Safari it is in the bottom bar).",
          ios3: "Scroll down, choose <b>Add to Home Screen</b>, then <b>Add</b>.",
          iosNota: "On iPhone no app can draw over the home screen or other apps, so there the game runs full screen.",
          pcWeb: "You can also install it on this computer, in its own window:", pcTitolo: "On this computer" },
  };
  var t = T[lingua] || T.en;

  var R = function () { return window.__ring || null; };
  var PC = !!window.__pbsPc;
  // ·· La vibrazione ··
  // Android: l'API Vibration, con schemi diversi per tipo di tasto. iPhone non ce l'ha: da iOS 18 Safari dà il «tic»
  // aptico del sistema quando cambia un interruttore (<input type=checkbox switch>), ma solo dentro un gesto vero, e per
  // WebKit sul tocco il gesto è il dito che si stacca (touchend), non quello che si appoggia. Quindi su iPhone il tic
  // arriva al rilascio del tasto, e solo per i tasti (un parry riuscito non è un gesto: lì niente).
  var IOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var APTICO = { tasto: 10, leggero: 6, mossa: 14, forte: [16, 24, 30], parry: 22, perfetto: [18, 30, 44], colpo: [28, 30, 28], no: [8, 40, 8], limit: [20, 30, 20, 30, 60] };
  var ticInAttesa = false, ultimoTocco = 0;
  function ticIos() {
    try {
      var lbl = document.createElement("label"), inp = document.createElement("input");
      inp.type = "checkbox"; inp.setAttribute("switch", ""); lbl.setAttribute("aria-hidden", "true"); lbl.style.display = "none";
      lbl.appendChild(inp); document.head.appendChild(lbl); lbl.click(); document.head.removeChild(lbl);
    } catch (e) { /* niente */ }
  }
  if (IOS) {
    document.addEventListener("pointerdown", function () { ultimoTocco = Date.now(); }, true);
    document.addEventListener("touchend", function () { if (ticInAttesa) { ticInAttesa = false; ticIos(); } }, true);
  }
  var vibra = function (p) {
    if (typeof p === "string") p = APTICO[p] || 10;
    try { if (navigator.vibrate) { navigator.vibrate(p); return; } } catch (e) { /* niente */ }
    if (IOS && Date.now() - ultimoTocco < 600) ticInAttesa = true;
  };
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  var ICONE = {
    pausa: '<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1.2"/><rect x="14" y="5" width="4" height="14" rx="1.2"/></svg>',
    gioca: '<svg viewBox="0 0 24 24"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>',
    menu: '<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="2.2"/><circle cx="12" cy="12" r="2.2"/><circle cx="19" cy="12" r="2.2"/></svg>',
    vola: '<svg viewBox="0 0 24 24"><path d="M12 3l7 8h-4.5v5h-5v-5H5zM8 18h8v2.5H8z"/></svg>',
  };

  // ·· Il guscio ··
  var hud = el("div", "");
  hud.id = "pbs-hud";
  hud.className = "pbs-nascosti";
  var capsula = el("div", "pbs-capsula tocca");
  var bPausa = el("button", "pbs-icona", ICONE.pausa); bPausa.setAttribute("aria-label", t.pausa);
  var avatar = [mkAvatar(), mkAvatar()];
  var punti = el("div", "pbs-punti", "0 – 0");
  var bMenu = el("button", "pbs-icona", ICONE.menu); bMenu.setAttribute("aria-label", t.menu);
  capsula.appendChild(bPausa); capsula.appendChild(avatar[0].e); capsula.appendChild(punti); capsula.appendChild(avatar[1].e); capsula.appendChild(bMenu);

  var croce = el("div", "pbs-croce"), pomello = el("div", "pbs-pomello");
  croce.appendChild(pomello); croce.hidden = true;
  var azioni = el("div", "pbs-azioni");
  var bAura = el("button", "pbs-aura tocca", '<span class="nome"></span>'); bAura.setAttribute("aria-label", "Aura");
  var bParata = el("button", "pbs-parata tocca"); bParata.setAttribute("aria-label", "Parry");
  var tela = document.createElement("canvas"), scritta = el("div", "scritta"), catena = el("div", "pbs-catena", "×2");
  catena.hidden = true;
  bParata.appendChild(tela); bParata.appendChild(scritta);
  azioni.appendChild(bParata); azioni.appendChild(catena); azioni.appendChild(bAura);
  var abilita = [];
  for (var i = 0; i < 4; i++) {
    var a = el("button", "pbs-abilita tocca scarica", "<span></span>");
    a.setAttribute("data-posto", String(i)); a.hidden = true;
    azioni.appendChild(a); abilita.push({ e: a, id: null });
  }
  hud.appendChild(capsula); hud.appendChild(croce); hud.appendChild(azioni);
  // Sul PC i comandi touch non servono (li nasconde hud.css): il menu del sito è un tasto in più nella barretta del
  // motore, accanto al controller e alla tendina (vedi «Sul PC»).
  document.body.appendChild(hud);

  function mkAvatar() {
    var e = el("button", "pbs-avatar", '<svg viewBox="0 0 38 38"><circle class="fondo" cx="19" cy="19" r="16"/><circle class="vita" cx="19" cy="19" r="16" stroke-dasharray="100 100"/></svg><b></b>');
    return { e: e, anello: e.querySelector(".vita"), lettera: e.querySelector("b") };
  }
  function impostaAvatar(av, nome, colore, vita, ko, mio) {
    var giro = 2 * Math.PI * 16, k = Math.max(0, Math.min(1, vita));
    av.anello.setAttribute("stroke-dasharray", (giro * k).toFixed(1) + " " + giro.toFixed(1));
    av.anello.style.stroke = colore || "#fff";
    av.lettera.textContent = String(nome || "?").charAt(0).toUpperCase();
    av.lettera.style.color = colore || "#fff";
    av.e.classList.toggle("ko", !!ko); av.e.classList.toggle("mio", !!mio);
    av.e.setAttribute("aria-label", nome || "");
  }

  // ·· Lo stato del motore, ogni 120 ms ··
  var m = null, inPausa = false, pannello = false, menuAperto = false, avviato = false, mostra = false;
  function leggi() {
    var r = R();
    if (!r || !r.mosse) return;
    try { m = r.mosse(); inPausa = !!r.pausa(); pannello = !!r.pannello(); } catch (e) { return; }
    var corsaHud = m.corsaHud, lotta = corsaHud && corsaHud.fase === "lotta", gioco = !m.scelta && !m.corsa;
    // I comandi si tolgono quando il canvas vuole i tocchi (scelta del modo, carte, mira, classifica), con la tendina
    // o il menu aperti, in pausa e a lotte spente.
    mostra = !PC && avviato && m.acceso && !m.vuoleTocchi && !pannello && !menuAperto && !inPausa && (gioco || lotta);
    hud.classList.toggle("pbs-nascosti", !mostra);
    // La capsula solo a lotta in corso (o in pausa): sopra i menu del motore coprirebbe i titoli.
    var conCapsula = !PC && avviato && m.acceso && !pannello && !m.menu && !m.scelta && (inPausa || lotta || (gioco && !m.vuoleTocchi));
    capsula.style.opacity = conCapsula ? "1" : "0";
    capsula.style.pointerEvents = conCapsula ? "auto" : "none";
    bPausa.innerHTML = inPausa ? ICONE.gioca : ICONE.pausa;
    var ls = m.lottatori || [];
    if (ls.length >= 2) {
      var A = ls[0], B = ls[1];
      if (corsaHud) {
        var e = corsaHud.chi === B.tipo ? B : A;
        impostaAvatar(avatar[0], e.nome, e.colore, corsaHud.hp / Math.max(1, corsaHud.hpMax), false, true);
        avatar[1].e.hidden = true;
        punti.innerHTML = inPausa ? t.pausa : "♥" + corsaHud.vite + " · ⚠" + corsaHud.round + (corsaHud.obiettivo ? "<small>" + esc(corsaHud.obiettivo) + "</small>" : "");
      } else {
        impostaAvatar(avatar[0], A.nome, A.colore, A.vita, A.ko, m.chi === A.tipo);
        impostaAvatar(avatar[1], B.nome, B.colore, B.vita, B.ko, m.chi === B.tipo);
        avatar[1].e.hidden = false;
        var p = m.punteggio || {};
        punti.textContent = inPausa ? t.pausa : (p[A.tipo] || 0) + " – " + (p[B.tipo] || 0);
      }
    }
    if (lotta) postiCorsa(corsaHud); else if (gioco) postiLibero(m); else for (var i = 0; i < 4; i++) abilita[i].e.hidden = true;
    aggiornaAura(m);
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  // ·· Le abilità ··
  var PRIORITA = ["pugno", "calcio", "presa", "salto", "montante", "jet", "lancia"];
  var usate = {};
  function mettiAbilita(i, id, icona, carica, pronta, colore) {
    var a = abilita[i];
    a.id = id; a.e.hidden = !id;
    if (!id) return;
    var span = a.e.firstChild;
    if (span.textContent !== icona) span.textContent = icona;
    var attesa = usate[id] ? Math.min(1, (Date.now() - usate[id]) / 900) : 1, k = Math.min(carica, attesa);
    a.e.style.setProperty("--k", k.toFixed(3));
    if (colore) a.e.style.setProperty("--colore", colore);
    var ok = pronta && k >= 1;
    if (ok && a.e.classList.contains("scarica") && mostra) vibra("leggero");
    a.e.classList.toggle("scarica", !ok); a.e.classList.toggle("pronta", ok);
  }
  function postiCorsa(ch) {
    mettiAbilita(0, "__finale", "🎯", Math.min(1, ch.energia || 0), (ch.energia || 0) >= 1, "#ffd84a");
    for (var i = 0; i < 3; i++) {
      var o = (ch.oggetti || [])[i];
      mettiAbilita(i + 1, o ? "__oggetto" + i : null, o ? o.icona : "", 1, true, "#8fd3ff");
    }
  }
  function postiLibero(mm) {
    var voci = (mm.voci || []).filter(function (v) { return v.id !== "para" && v.id !== "carica" && v.id !== "trasforma"; });
    voci.sort(function (a, b) {
      var pa = PRIORITA.indexOf(a.id), pb = PRIORITA.indexOf(b.id);
      return (pa < 0 ? 99 : pa) - (pb < 0 ? 99 : pb);
    });
    var io = (mm.lottatori || []).filter(function (l) { return l.tipo === mm.chi; })[0], ki = io ? io.ki || 0 : 0;
    for (var i = 0; i < 4; i++) {
      var v = voci[i];
      mettiAbilita(i, v ? v.id : null, v ? v.icona : "", v ? (v.costo > 0 ? Math.min(1, ki / v.costo) : 1) : 0, v ? v.pronta : false, io ? io.colore : null);
    }
  }
  abilita.forEach(function (a) {
    a.e.addEventListener("pointerdown", function (ev) {
      ev.preventDefault();
      var r = R(); if (!r || !a.id) return;
      var ok = false;
      try {
        if (a.id === "__finale") ok = r.corsaFinale();
        else if (a.id.indexOf("__oggetto") === 0) ok = r.corsaOggetto(+a.id.slice(9));
        else ok = r.ordina(m && m.chi, a.id);
      } catch (e) { ok = false; }
      if (ok) { usate[a.id] = Date.now(); vibra(a.id === "__finale" ? "forte" : "mossa"); }
      else { vibra("no"); a.e.classList.remove("no"); void a.e.offsetWidth; a.e.classList.add("no"); }
    });
  });

  // ·· La croce invisibile: compare sotto il pollice, nella metà sinistra, e sparisce quando si stacca ··
  // Si prende il tocco prima del motore (fase di cattura) solo se non cade su un lottatore: quelli si afferrano ancora.
  var croceDito = null, croceDir = 0, croceGiro = 0, croceSu = false, croceX = 0, croceY = 0, RAGGIO = 52;
  function suUnLottatore(x, y) {
    var corpi = []; try { corpi = R().corpi() || []; } catch (e) { corpi = []; }
    for (var i = 0; i < corpi.length; i++) { var c = corpi[i]; if (c && x > c[0] - 14 && x < c[2] + 14 && y > c[1] - 14 && y < c[3] + 14) return true; }
    return false;
  }
  function croceGiu(ev) {
    if (!mostra || croceDito !== null) return;
    if (ev.target && ev.target.closest && ev.target.closest("#pbs-hud .tocca")) return;
    var W = window.innerWidth, H = window.innerHeight;
    if (ev.clientX > W * 0.5 || ev.clientY < H * 0.28 || suUnLottatore(ev.clientX, ev.clientY)) return;
    ev.preventDefault(); ev.stopImmediatePropagation();
    croceDito = ev.pointerId; croceX = ev.clientX; croceY = ev.clientY;
    croce.style.left = (croceX - 66) + "px"; croce.style.top = (croceY - 66) + "px"; croce.hidden = false;
    pomello.style.transform = "";
    vibra("leggero");
    clearInterval(croceGiro); croceGiro = setInterval(passo, 90);
  }
  function croceMuovi(ev) {
    if (ev.pointerId !== croceDito) return;
    ev.preventDefault(); ev.stopImmediatePropagation();
    var dx = ev.clientX - croceX, dy = ev.clientY - croceY, d = Math.hypot(dx, dy) || 1, k = Math.min(1, RAGGIO / d);
    pomello.style.transform = "translate(" + (dx * k).toFixed(1) + "px," + (dy * k).toFixed(1) + "px)";
    var dir = Math.abs(dx) > 14 ? (dx < 0 ? -1 : 1) : 0;
    if (dir !== croceDir) { croceDir = dir; if (dir) { passo(); vibra("leggero"); } }
    if (dy < -RAGGIO * 0.8 && Math.abs(dy) > Math.abs(dx) && !croceSu) { croceSu = true; azione("vola"); vibra("mossa"); }
    if (dy > -RAGGIO * 0.4) croceSu = false;
  }
  function croceFine(ev) {
    if (ev.pointerId !== croceDito) return;
    ev.stopImmediatePropagation();
    croceDito = null; croceDir = 0; croceSu = false; clearInterval(croceGiro);
    croce.hidden = true;
  }
  window.__pbsTocco = function (ev) {
    if (ev.type === "pointerdown") croceGiu(ev);
    else if (ev.type === "pointermove") croceMuovi(ev);
    else croceFine(ev);
  };
  function passo() { if (croceDir) azione(croceDir < 0 ? "sinistra" : "destra"); }

  // ·· L'aura: carica l'energia; piena, il Limit Break ··
  var auraStato = { limit: false, chi: null, ok: false };
  function aggiornaAura(mm) {
    var chi = mm.corsaHud ? mm.corsaHud.chi : mm.chi, io = (mm.lottatori || []).filter(function (l) { return l.tipo === chi; })[0];
    var voci = mm.voci || [], carica = voci.filter(function (v) { return v.id === "carica"; })[0], lb = voci.filter(function (v) { return v.id === "trasforma"; })[0];
    var ki = io ? io.ki || 0 : 0, costo = lb ? lb.costo || 40 : 100;
    auraStato.chi = chi; auraStato.ok = !!(carica || lb);
    auraStato.limit = !!(lb && lb.pronta && ki >= costo);
    bAura.style.setProperty("--k", Math.min(1, ki / 100).toFixed(3));
    if (io && io.colore) bAura.style.setProperty("--colore", io.colore);
    bAura.classList.toggle("spenta", !auraStato.ok);
    bAura.classList.toggle("limit", auraStato.limit);
    bAura.firstChild.textContent = auraStato.limit ? t.limit : t.aura;
  }
  bAura.addEventListener("pointerdown", function (ev) {
    ev.preventDefault();
    var r = R(); if (!r) return;
    if (!auraStato.ok) { vibra("no"); return; }
    var ok = false;
    try { ok = auraStato.limit ? r.ordina(auraStato.chi, "trasforma") : r.premi("aura"); } catch (e) { ok = false; }
    vibra(ok ? (auraStato.limit ? "limit" : "mossa") : "no");
    if (!ok) { bAura.classList.remove("no"); void bAura.offsetWidth; bAura.classList.add("no"); }
  });

  function azione(id) { var r = R(); try { return r && r.premi ? r.premi(id) : false; } catch (e) { return false; } }

  // ·· La parata ··
  var parataDito = null;
  bParata.addEventListener("pointerdown", function (ev) {
    ev.preventDefault();
    parataDito = ev.pointerId;
    try { bParata.setPointerCapture(ev.pointerId); } catch (e) { /* niente */ }
    premuta = performance.now();
    azione("para"); vibra("tasto");
  });
  function parataFine(ev) {
    if (ev.pointerId !== parataDito) return;
    parataDito = null; premuta = 0;
    var r = R(); try { if (r && r.lascia) r.lascia("para"); } catch (e) { /* niente */ }
  }
  bParata.addEventListener("pointerup", parataFine); bParata.addEventListener("pointercancel", parataFine);

  var eraRotta = false, premuta = 0, ultimoParry = 1e9, ultimoColpo = 1e9, scoppi = [], scossa = 0, dpr = 1, g = null;
  function preparaTela() {
    dpr = Math.min(3, window.devicePixelRatio || 1);
    tela.width = Math.round(200 * dpr); tela.height = Math.round(200 * dpr);
    g = tela.getContext("2d");
  }
  preparaTela();
  window.addEventListener("resize", preparaTela);
  function disegnaParata(tp, ora) {
    if (!g) return;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, 200, 200);
    var c = 100, Rb = 54, sx = scossa > ora ? (Math.random() - 0.5) * 6 : 0;
    g.save(); g.translate(sx, 0);
    // il battito: un alone che si apre a ogni colpo di cassa
    if (tp.battito !== null) {
      var b = Math.pow(1 - tp.battito, 3);
      g.globalAlpha = 0.28 * b; g.strokeStyle = "#ffd84a"; g.lineWidth = 8 * b + 1;
      g.beginPath(); g.arc(c, c, Rb + 3 + 6 * (1 - b), 0, Math.PI * 2); g.stroke();
      g.globalAlpha = 1;
    }
    var fot = tp.lotta ? tp.fot : null, dentro = fot !== null && fot <= tp.finestra, perfetto = fot !== null && fot <= tp.perfetto;
    // il disco
    var grad = g.createRadialGradient(c - 14, c - 18, 6, c, c, Rb);
    grad.addColorStop(0, tp.inGuardia ? (tp.aperta ? "#5a4a12" : "#1f3a4f") : "#2c2840");
    grad.addColorStop(1, tp.inGuardia ? (tp.aperta ? "#2a2208" : "#0f1d29") : "#141220");
    g.fillStyle = grad; g.beginPath(); g.arc(c, c, Rb - (premuta ? 2 : 0), 0, Math.PI * 2); g.fill();
    if (dentro) { g.globalAlpha = perfetto ? 0.55 : 0.32; g.fillStyle = "#ffd84a"; g.fill(); g.globalAlpha = 1; }
    g.lineWidth = 2; g.strokeStyle = dentro ? "#ffd84a" : tp.inGuardia ? "#8fd3ff" : "rgba(255,255,255,.28)"; g.stroke();
    // lo scudo
    g.save(); g.translate(c, c + 2); var s = premuta ? 0.93 : 1; g.scale(s, s);
    g.beginPath(); g.moveTo(0, -24); g.bezierCurveTo(10, -18, 18, -18, 21, -19); g.bezierCurveTo(21, 2, 14, 16, 0, 24);
    g.bezierCurveTo(-14, 16, -21, 2, -21, -19); g.bezierCurveTo(-18, -18, -10, -18, 0, -24); g.closePath();
    g.fillStyle = dentro ? "#ffe680" : tp.rotta ? "#ff6b5e" : "#f3f1ff"; g.fill();
    // (sullo scudo il colpo respinto: un fendente che rimbalza e la scintilla, come nell'icona)
    g.beginPath(); g.moveTo(-12, -13); g.lineTo(2, -1); g.lineTo(-10, 12);
    g.strokeStyle = "rgba(20,18,32,.6)"; g.lineWidth = 3.2; g.lineCap = "round"; g.lineJoin = "round"; g.stroke();
    g.beginPath();
    for (var q2 = 0; q2 < 8; q2++) { var an2 = q2 / 8 * Math.PI * 2, l2 = q2 % 2 ? 4.5 : 8; g.moveTo(2, -1); g.lineTo(2 + Math.cos(an2) * l2, -1 + Math.sin(an2) * l2); }
    g.strokeStyle = dentro || tp.rotta ? "#ffffff" : "#d99a00"; g.lineWidth = 1.8; g.stroke();
    g.restore();
    // la guardia: un arco sottile intorno, che si consuma
    var k = Math.max(0, Math.min(1, tp.guardia));
    g.lineWidth = 3; g.lineCap = "round";
    g.strokeStyle = "rgba(255,255,255,.1)"; g.beginPath(); g.arc(c, c, Rb - 5, -Math.PI / 2, Math.PI * 1.5); g.stroke();
    g.strokeStyle = tp.rotta ? (ora % 300 < 150 ? "#ff3b30" : "rgba(255,59,48,.3)") : k > 0.5 ? "#8fd3ff" : k > 0.25 ? "#ffb62e" : "#ff4a3a";
    g.beginPath(); g.arc(c, c, Rb - 5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); g.stroke();
    // l'anello del tempo: si stringe fino al bordo del tasto nell'istante del colpo
    if (fot !== null) {
      var q = Math.max(0, Math.min(1, fot / 36)), r = Rb + 9 + q * 34;
      var colore = perfetto ? "#fff6c4" : dentro ? "#ffd84a" : tp.rossa ? "#ff3b30" : "#ffffff";
      g.globalAlpha = Math.min(1, 0.35 + (1 - q) * 0.75);
      if (dentro || tp.rossa) { g.shadowColor = colore; g.shadowBlur = perfetto ? 22 : 12; }
      g.strokeStyle = colore; g.lineWidth = dentro ? 5 : tp.rossa ? 4 : 2.5;
      g.beginPath(); g.arc(c, c, r, 0, Math.PI * 2); g.stroke();
      g.shadowBlur = 0;
      // il bersaglio: dove l'anello deve arrivare
      g.globalAlpha = 0.6; g.setLineDash([4, 5]); g.lineWidth = 1.5; g.strokeStyle = dentro ? "#ffd84a" : "rgba(255,255,255,.7)";
      g.beginPath(); g.arc(c, c, Rb + 9, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
      g.globalAlpha = 1;
    }
    // i lampi del parry
    for (var i = scoppi.length - 1; i >= 0; i--) {
      var sc = scoppi[i], u = (ora - sc.t0) / (sc.perfetto ? 620 : 460);
      if (u >= 1) { scoppi.splice(i, 1); continue; }
      var e = 1 - Math.pow(1 - u, 3);
      g.globalAlpha = 1 - u; g.strokeStyle = sc.perfetto ? "#fff6c4" : "#ffd84a"; g.lineWidth = (sc.perfetto ? 9 : 6) * (1 - u) + 1;
      g.beginPath(); g.arc(c, c, Rb + e * (sc.perfetto ? 46 : 34), 0, Math.PI * 2); g.stroke();
      for (var j = 0; j < 10; j++) {
        var an = j / 10 * Math.PI * 2 + sc.giro, r0 = Rb + 4 + e * 18, r1 = r0 + 8 + e * (sc.perfetto ? 26 : 16);
        g.beginPath(); g.moveTo(c + Math.cos(an) * r0, c + Math.sin(an) * r0); g.lineTo(c + Math.cos(an) * r1, c + Math.sin(an) * r1); g.stroke();
      }
      g.globalAlpha = 1;
    }
    g.restore();
  }
  function annuncia(testo, cls) {
    scritta.textContent = testo; scritta.className = "scritta";
    void scritta.offsetWidth; scritta.className = "scritta via" + (cls ? " " + cls : "");
  }
  function ciclo(ora) {
    requestAnimationFrame(ciclo);
    var r = R();
    if (!r || !r.tempoParry || !mostra) { if (g) g.clearRect(0, 0, tela.width, tela.height); return; }
    var tp;
    try { tp = r.tempoParry(); } catch (e) { return; }
    // un parry nuovo: lampo, scritta, vibrazione (più forte se perfetto)
    if (tp.parry < ultimoParry && tp.parry < 20) {
      scoppi.push({ t0: ora, perfetto: tp.perfettoUltimo, giro: Math.random() });
      annuncia(tp.perfettoUltimo ? t.perfetto : t.parry, tp.perfettoUltimo ? "perfetto" : "");
      vibra(tp.perfettoUltimo ? "perfetto" : "parry");
    }
    ultimoParry = tp.parry;
    // un colpo preso: il tasto trema
    if (tp.colpito < ultimoColpo && tp.colpito < 6) { scossa = ora + 260; vibra("colpo"); }
    if (tp.rotta && !eraRotta) annuncia(t.rotta, "rossa");
    eraRotta = tp.rotta;
    ultimoColpo = tp.colpito;
    if (tp.catena >= 2) { catena.hidden = false; catena.textContent = "×" + tp.catena; } else catena.hidden = true;
    disegnaParata(tp, ora);
  }
  requestAnimationFrame(ciclo);

  // ·· Capsula: pausa, cambio di lottatore, menu ··
  bPausa.addEventListener("click", function () { var r = R(); if (r) { r.pausa(!r.pausa()); vibra("tasto"); leggi(); } });
  avatar.forEach(function (av) { av.e.addEventListener("click", function () { var r = R(); if (r && m && !m.corsaHud) { r.cambia(); vibra("tasto"); leggi(); } }); });
  bMenu.addEventListener("click", function () { vibra("tasto"); apriMenu(); });

  var foglio = null, pausaPrima = false;
  function chiudiMenu() {
    if (!foglio) return;
    foglio.remove(); foglio = null; menuAperto = false;
    var r = R(); if (r && !pausaPrima) r.pausa(false);
    leggi();
  }
  function apriMenu() {
    if (foglio) { chiudiMenu(); return; }
    var r = R(); if (!r) return;
    pausaPrima = !!r.pausa(); r.pausa(true); menuAperto = true;
    foglio = el("div", "tocca");
    var velo = el("div", "pbs-velo"), f = el("div", "pbs-foglio");
    velo.addEventListener("click", chiudiMenu);
    foglio.appendChild(velo); foglio.appendChild(f);
    var mu = {}; try { mu = r.musica() || {}; } catch (e) { mu = {}; }
    var NOMI_MUSICA = { sempre: t.sempre, corsa: t.corsa, mai: t.mai };
    var dati = window.__ringDati || {}, tg = dati["pb-taglia"] || "medi";
    var righe = [
      ["▶️", t.riprendi, "", "", chiudiMenu],
      ["🎵", t.musica, "", NOMI_MUSICA[mu.musica] || t.sempre, function () {
        var giro = ["sempre", "corsa", "mai"], prossimo = giro[(giro.indexOf(mu.musica) + 1) % 3];
        mu = r.musica({ musica: prossimo }); this.querySelector(".val").textContent = NOMI_MUSICA[prossimo];
      }],
      ["🎧", t.tara, t.taraSotto, (mu.ritardo > 0 ? "+" : "") + (mu.ritardo || 0) + " ms", function () { chiudiMenu(); apriTaratura(); }],
      ["🏆", t.classifica, "", "", function () { chiudiMenu(); try { r.pausa(false); r.comandi.classifica(true); } catch (e) { /* niente */ } }],
      ["⚙️", t.opzioni, t.opzioniSotto, "", function () { chiudiMenu(); r.pannello(true); }],
      ["🥊", t.taglia, t.ricarica, { piccoli: t.piccoli, medi: t.medi, grandi: t.grandi }[tg], function () {
        var giro = ["piccoli", "medi", "grandi"]; tg = giro[(giro.indexOf(tg) + 1) % 3];
        if (window.__pbSalva) window.__pbSalva({ "pb-taglia": tg });
        this.querySelector(".val").textContent = { piccoli: t.piccoli, medi: t.medi, grandi: t.grandi }[tg];
      }],
      ["📲", t.installa, t.installaSotto, "", function () { chiudiMenu(); apriInstalla(); }],
      ["🖥️", t.comandi, t.comandiSotto, nomeComandi(), function () {
        // auto → PC → touch → auto; vale dopo aver ricaricato la pagina (il motore parte in un modo o nell'altro)
        var giro = ["", "pc", "touch"], ora = dati["pbs-comandi"] || "", dopo = giro[(giro.indexOf(ora) + 1) % 3];
        if (window.__pbSalva) window.__pbSalva({ "pbs-comandi": dopo });
        dati["pbs-comandi"] = dopo;
        this.querySelector(".val").textContent = nomeComandi();
        setTimeout(function () { location.replace(location.pathname + location.search.replace(/[?&]comandi=(pc|touch)\b/, "")); }, 350);
      }],
      ["🚪", t.home, "", "", function () { location.href = "./"; }],
    ];
    if (PC) righe.splice(3, 0, ["⌨️", t.frecce, t.frecceSotto, window.__pbsFrecce ? t.accese : t.spente, function () {
      window.__pbsFrecce = !window.__pbsFrecce;
      if (window.__pbSalva) window.__pbSalva({ "pbs-frecce": window.__pbsFrecce ? "on" : "off" });
      this.querySelector(".val").textContent = window.__pbsFrecce ? t.accese : t.spente;
    }]);
    var h = el("h2", "", "Parry Brawl Survivor"); f.appendChild(h);
    righe.forEach(function (q) {
      var b = el("button", "pbs-riga", '<span class="ico">' + q[0] + '</span><span class="nome">' + esc(q[1]) + (q[2] ? "<small>" + esc(q[2]) + "</small>" : "") + '</span><span class="val">' + esc(q[3] || "") + "</span>");
      b.addEventListener("click", function (ev) { vibra("tasto"); q[4].call(this, ev); });
      f.appendChild(b);
    });
    hud.appendChild(foglio);
    hud.classList.add("pbs-nascosti");
  }
  function nomeComandi() {
    var c = (window.__ringDati || {})["pbs-comandi"];
    return c === "pc" ? t.pc : c === "touch" ? t.touch : t.auto + " · " + (PC ? t.pc : t.touch);
  }
  // Dalla tendina del motore (sul PC i suoi due tasti in fondo portano qui: vedi «Sul PC» più sotto).
  window.__pbsMenu = function (tipo) {
    var r = R(); try { if (r && r.pannello()) r.pannello(false); } catch (e) { /* niente */ }
    if (tipo === "guida") apriInstalla(); else apriMenu();
  };

  // ·· Installa sul telefono ··
  // Android: l'APK dell'ultima release del repo (la fa .github/workflows/apk.yml), coi tre passi dell'installazione da
  // file; e la web app, in un tocco dove Chrome lo offre. iPhone: Condividi → Aggiungi alla schermata Home. PC: tutte e
  // due, con l'indirizzo da aprire sul telefono.
  var REPO = "rikyroky91-commits/parry-brawl-survivor", APK = "ParryBrawlSurvivor.apk", invito = null;
  window.addEventListener("beforeinstallprompt", function (ev) { ev.preventDefault(); invito = ev; });
  window.addEventListener("appinstalled", function () { invito = null; });
  var ANDROID = /Android/i.test(navigator.userAgent);
  var INSTALLATA = (window.matchMedia && window.matchMedia("(display-mode: standalone), (display-mode: fullscreen)").matches) || window.navigator.standalone === true;
  var CONDIVIDI = '<svg class="pbs-cond" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l4 4h-3v8h-2V7H8zM5 11h3v2H7v6h10v-6h-1v-2h3v10H5z"/></svg>';
  function passi(lista) {
    return '<ol class="pbs-passi">' + lista.map(function (x, i) { return '<li><span class="num">' + (i + 1) + "</span><span>" + x + "</span></li>"; }).join("") + "</ol>";
  }
  function apriInstalla() {
    if (foglio) chiudiMenu();
    var r = R();
    pausaPrima = !!(r && r.pausa()); if (r) r.pausa(true); menuAperto = true;
    foglio = el("div", "tocca");
    var velo = el("div", "pbs-velo"), f = el("div", "pbs-foglio pbs-installa");
    velo.addEventListener("click", chiudiMenu);
    foglio.appendChild(velo); foglio.appendChild(f);
    var html = '<h2>' + esc(t.instTitolo) + "</h2>";
    var indirizzo = location.origin + location.pathname.replace(/[^/]*$/, "");
    if (!IOS && !ANDROID) html += '<p class="pbs-testo">' + esc(t.instPc) + '</p><div class="pbs-indirizzo"><code>' + esc(indirizzo) + '</code><button class="pbs-tasto secondo" data-copia>' + esc(t.copia) + "</button></div>";
    var android = '<section class="pbs-piatt"><h3>🤖 ' + esc(t.andTitolo) + '</h3><p class="pbs-testo">' + esc(t.andTesto) + "</p>" +
      '<a class="pbs-tasto pbs-apk" data-apk href="https://github.com/' + REPO + "/releases/latest/download/" + APK + '" rel="noopener">' + esc(t.apk) + ' <small data-apk-info></small></a>' +
      passi([t.and1, t.and2, t.and3]) +
      (ANDROID && invito ? '<button class="pbs-tasto secondo" data-webapp>' + esc(t.webApp) + "</button>" : ANDROID ? '<p class="pbs-nota">' + t.andWeb + "</p>" : "") + "</section>";
    var ios = '<section class="pbs-piatt"><h3>🍏 ' + esc(t.iosTitolo) + "</h3>" +
      (IOS && INSTALLATA ? '<p class="pbs-testo">✓ ' + esc(t.iosGia) + "</p>" : passi([t.ios1, t.ios2.replace("{icona}", CONDIVIDI), t.ios3])) +
      '<p class="pbs-nota">' + esc(t.iosNota) + "</p></section>";
    var pc = !IOS && !ANDROID && invito && !INSTALLATA ? '<section class="pbs-piatt"><h3>🖥️ ' + esc(t.pcTitolo) + '</h3><p class="pbs-testo">' + esc(t.pcWeb) + '</p><button class="pbs-tasto secondo" data-webapp>' + esc(t.webApp) + "</button></section>" : "";
    html += IOS ? ios + android : ANDROID ? android + ios : android + ios + pc;
    html += '<button class="pbs-tasto pbs-chiudi" data-chiudi>' + esc(t.chiudi) + "</button>";
    f.innerHTML = html;
    f.querySelector("[data-chiudi]").addEventListener("click", function () { vibra("tasto"); chiudiMenu(); });
    var copia = f.querySelector("[data-copia]");
    if (copia) copia.addEventListener("click", function () {
      try { navigator.clipboard.writeText(indirizzo).then(function () { copia.textContent = t.copiato; }); } catch (e) { /* niente */ }
    });
    var wa = f.querySelector("[data-webapp]");
    if (wa) wa.addEventListener("click", function () {
      if (!invito) return;
      invito.prompt(); invito.userChoice.then(function () { invito = null; wa.remove(); }).catch(function () { /* niente */ });
    });
    // L'APK c'è? (l'ultima release del repo; senza, il tasto dice «in arrivo» e non porta da nessuna parte)
    var a = f.querySelector("[data-apk]"), info = f.querySelector("[data-apk-info]");
    fetch("https://api.github.com/repos/" + REPO + "/releases/latest", { headers: { Accept: "application/vnd.github+json" } })
      .then(function (r2) { if (!r2.ok) throw r2.status; return r2.json(); })
      .then(function (rel) {
        var file = (rel.assets || []).filter(function (x) { return x.name === APK; })[0];
        if (!file) throw "assente";
        info.textContent = "· " + (file.size / 1048576).toFixed(1) + " MB";
      })
      .catch(function () {
        a.removeAttribute("href"); a.setAttribute("aria-disabled", "true"); a.classList.add("spento");
        a.firstChild.textContent = t.apkArrivo + " ";
      });
    hud.appendChild(foglio);
    hud.classList.add("pbs-nascosti");
  }

  // ·· Sul PC ··
  // M apre e chiude il menu del sito (non mentre si scrive il nome in classifica). La tendina del motore ha in fondo due
  // tasti pensati per l'estensione («accensione su tutti i siti», «come funziona»): qui portano al menu del sito e
  // all'installazione sul telefono. Il tasto per spegnere le lotte, sul sito, non serve.
  if (PC) {
    window.addEventListener("keydown", function (ev) {
      if (ev.code !== "KeyM" || ev.ctrlKey || ev.metaKey || ev.altKey || ev.repeat) return;
      var dove = ev.composedPath ? ev.composedPath()[0] : ev.target;
      if (dove && (/^(INPUT|TEXTAREA|SELECT)$/.test(dove.tagName || "") || dove.isContentEditable)) return;
      ev.preventDefault();
      if (foglio) chiudiMenu(); else apriMenu();
    }, true);
    var radice = window.__ringRadice;
    if (radice && radice.querySelector) {
      try {
        var st = document.createElement("style");
        st.textContent = ".tasto[data-gioca] { display: none !important; } .tasto[data-sito] svg { width: 18px; height: 18px; fill: currentColor; }";
        radice.appendChild(st);
      } catch (e) { /* niente */ }
      var barretta = radice.querySelector(".barretta");
      if (barretta) {
        var bSito = document.createElement("button");
        bSito.type = "button"; bSito.className = "tasto"; bSito.setAttribute("data-sito", "");
        bSito.setAttribute("aria-label", t.menuPc); bSito.title = t.menuPc + " · " + t.sito;
        bSito.innerHTML = ICONE.menu;
        bSito.addEventListener("click", function () { var r = R(); try { if (r && r.pannello()) r.pannello(false); } catch (e) { /* niente */ } apriMenu(); });
        barretta.appendChild(bSito);
      }
      var bo = radice.querySelector("[data-opzioni-estensione]"), bg = radice.querySelector("[data-guida]");
      if (bo) bo.textContent = "☰ " + t.sito;
      if (bg) bg.textContent = "📲 " + t.installa;
    }
  }
  // La pagina del gioco aperta da sola (dall'icona, da un link): anche lei porta il sito offline.
  if ("serviceWorker" in navigator && location.protocol === "https:") { try { navigator.serviceWorker.register("sw.js").catch(function () { /* niente */ }); } catch (e) { /* niente */ } }

  // ·· La taratura del ritardo audio ··
  function apriTaratura() {
    var r = R(); if (!r) return;
    pausaPrima = !!r.pausa(); r.pausa(true); menuAperto = true;
    var v = el("div", "tocca"), velo = el("div", "pbs-velo"), box = el("div", "pbs-taratura");
    box.innerHTML = '<div class="scheda"><h2>' + esc(t.taraTitolo) + "</h2><p>" + esc(t.taraTesto) + '</p><button class="pbs-bersaglio">0</button><div class="esito"></div>' +
      '<button class="pbs-tasto" data-fatto>' + esc(t.fatto) + '</button><button class="pbs-tasto secondo" data-rifai>' + esc(t.rifai) + "</button></div>";
    v.appendChild(velo); v.appendChild(box); hud.appendChild(v);
    var bers = box.querySelector(".pbs-bersaglio"), esito = box.querySelector(".esito");
    function parti() { try { r.calibra(true); } catch (e) { /* niente */ } bers.textContent = "0"; esito.textContent = ""; }
    parti();
    bers.addEventListener("pointerdown", function (ev) {
      ev.preventDefault();
      var d = {}; try { d = r.calibra("tocco", Math.max(0, performance.now() - ev.timeStamp)) || {}; } catch (e) { d = {}; }
      bers.textContent = String(d.n || 0);
      bers.classList.add("batte"); setTimeout(function () { bers.classList.remove("batte"); }, 90);
      if ((d.n || 0) >= 4) esito.textContent = t.ritardo + ": " + (d.ritardo > 0 ? "+" : "") + d.ritardo + " ms";
      vibra(6);
    });
    box.querySelector("[data-rifai]").addEventListener("click", function () { try { r.calibra(false); } catch (e) { /* niente */ } parti(); });
    box.querySelector("[data-fatto]").addEventListener("click", function () {
      try { r.calibra(false); } catch (e) { /* niente */ }
      v.remove(); menuAperto = false; if (!pausaPrima) r.pausa(false); leggi();
    });
  }

  // ·· Il primo tocco (sul menu del motore o sui comandi) sblocca l'audio, lo schermo intero, lo schermo acceso ··
  avviato = true;
  var blocco = null, primo = true;
  function tieniAcceso() {
    try { if (navigator.wakeLock && !document.hidden) navigator.wakeLock.request("screen").then(function (b) { blocco = b; }).catch(function () { /* niente */ }); } catch (e) { /* niente */ }
  }
  document.addEventListener("visibilitychange", function () { if (!document.hidden && !primo) tieniAcceso(); });
  document.addEventListener("pointerdown", function () {
    var r = R();
    try { if (r && r.musica) r.musica({ sveglia: true }); } catch (e) { /* niente */ }
    if (!primo) return;
    primo = false;
    var ios = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    var de = document.documentElement;
    if (!ios && de.requestFullscreen && !document.fullscreenElement && matchMedia("(pointer: coarse)").matches) {
      try { de.requestFullscreen({ navigationUI: "hide" }).catch(function () { /* niente */ }); } catch (e) { /* niente */ }
    }
    tieniAcceso();
  }, true);
  setInterval(leggi, 120);
  leggi();
})();

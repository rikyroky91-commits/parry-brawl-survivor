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
          ritardo: "Ritardo", parry: "PARRY", perfetto: "PERFETTO", rotta: "GUARDIA ROTTA", ricarica: "Ricarica la pagina per cambiare misura" },
    en: { aura: "AURA", limit: "LIMIT", pausa: "Paused", menu: "Menu", riprendi: "Resume", opzioni: "Ring options",
          opzioniSotto: "Characters, events, graphics, keys", musica: "Music", sempre: "Always", corsa: "Only in the run", mai: "Off",
          tara: "Sync audio", taraSotto: "With Bluetooth headphones: tap on the beat so hits land with the sound", classifica: "Global leaderboard",
          taglia: "Fighters", piccoli: "Small", medi: "Medium", grandi: "Large", app: "Your whole phone as the ring", appSotto: "With the Android app (or install this page)",
          home: "Exit", taraTitolo: "Tap on the beat", taraTesto: "Tap the circle on every \"tick\", at least eight times.", fatto: "Done", rifai: "Redo", chiudi: "Close",
          ritardo: "Delay", parry: "PARRY", perfetto: "PERFECT", rotta: "GUARD BROKEN", ricarica: "Reload the page to change size" },
  };
  var t = T[lingua] || T.en;

  var R = function () { return window.__ring || null; };
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
    mostra = avviato && m.acceso && !m.vuoleTocchi && !pannello && !menuAperto && !inPausa && (gioco || lotta);
    hud.classList.toggle("pbs-nascosti", !mostra);
    // La capsula solo a lotta in corso (o in pausa): sopra i menu del motore coprirebbe i titoli.
    var conCapsula = avviato && m.acceso && !pannello && !m.menu && !m.scelta && (inPausa || lotta || (gioco && !m.vuoleTocchi));
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
      ["📱", t.app, t.appSotto, "", function () { location.href = "./#installa"; }],
      ["🚪", t.home, "", "", function () { location.href = "./"; }],
    ];
    var h = el("h2", "", "Parry Brawl Survivor"); f.appendChild(h);
    righe.forEach(function (q) {
      var b = el("button", "pbs-riga", '<span class="ico">' + q[0] + '</span><span class="nome">' + esc(q[1]) + (q[2] ? "<small>" + esc(q[2]) + "</small>" : "") + '</span><span class="val">' + esc(q[3] || "") + "</span>");
      b.addEventListener("click", function (ev) { vibra("tasto"); q[4].call(this, ev); });
      f.appendChild(b);
    });
    hud.appendChild(foglio);
    hud.classList.add("pbs-nascosti");
  }
  window.__pbsMenu = function () { apriMenu(); };

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

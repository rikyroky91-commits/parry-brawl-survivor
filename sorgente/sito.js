/* La pagina d'ingresso: lingua, piattaforma, arena scelta, APK dalle release, service worker. */
(function () {
  "use strict";
  var REPO = "rikyroky91-commits/parry-brawl-survivor";
  var APK = "ParryBrawlSurvivor.apk";

  // ·· Italiano per chi ha il telefono in italiano (il resto in inglese, com'è scritto nella pagina) ··
  var IT = {
    installa: "Installa", sotto: "L'orda attacca a tempo di musica. Para al momento giusto, concatena, sopravvivi.", gioca: "Gioca ora",
    nota: "Gratis. L'account è facoltativo: tiene il tuo personaggio su ogni dispositivo. Funziona anche offline, una volta aperto.", account: "Account",
    t1: "Il parry è il gioco", p1: "Un anello si stringe intorno al tasto dello scudo e ne tocca il bordo nell'istante del colpo. Oro vuol dire adesso.",
    t2: "A tempo di musica", p2: "La musica guida l'orda: gli attacchi cadono sul battito e un «tic» li annuncia un battito prima. Gioca con l'audio.",
    t3: "Corsa survivor", p3: "Ondate infinite, armi che salgono di livello, un capo ogni pochi minuti e la classifica globale.",
    installaTitolo: "Mettilo sul telefono",
    iosTitolo: "iPhone e iPad", iosTesto: "Installalo come un'app da Safari: schermo intero, la sua icona, funziona offline.",
    ios1: "Apri questa pagina in <b>Safari</b>.", ios2: "Tocca", condividi: "Condividi", ios3: "Scegli <b>Aggiungi alla schermata Home</b>, poi <b>Aggiungi</b>.",
    iosNota: "iOS non permette a nessuna app di disegnare sopra la Home o sopra le altre app: su iPhone il gioco è a schermo intero.",
    androidTitolo: "Android: tutto il telefono è il ring",
    androidTesto: "L'app trasforma le tue schermate vere nell'arena: la Home, il blocco schermo, qualsiasi app o pagina web. I lottatori stanno su icone e pulsanti e il telefono resta usabile.",
    scarica: "Scarica l'APK",
    and1: "Apri il file scaricato. Chrome può avvisare che il file potrebbe essere dannoso: è l'avviso di sempre per le app fuori dal Play Store. Tocca <b>Scarica comunque</b>.",
    and2: "Quando Android lo chiede, consenti a Chrome di <b>installare app sconosciute</b>, poi <b>Installa</b>.",
    and3: "Android 13 e successivi: se l'interruttore dell'accessibilità è grigio, apri <b>Info app → ⋮ → Consenti impostazioni con restrizioni</b>. L'app legge solo dove stanno gli elementi sullo schermo, mai il loro testo.",
    androidPwa: "Non vuoi installare un APK? In Chrome usa", aggiungi: "Aggiungi a schermata Home", androidPwa2: "per il gioco a schermo intero.",
    pcTitolo: "Sul computer", pcTesto: "Gioca qui con mouse e tastiera: il controller radiale, S per il parry. Le frecce guidano il lottatore se le accendi dal menu (☰ o M); sennò va da solo. Oppure metti i lottatori su ogni pagina web con l'estensione per Chrome.",
    estensione: "Estensione per Chrome", altre: "Mostra tutte le piattaforme",
    privacy: "Niente pubblicità, niente tracciamento. Le impostazioni restano sul tuo dispositivo. Si inviano solo il nome che scegli per la classifica e il punteggio, quando li mandi tu.",
    inArrivo: "in arrivo", versione: "versione",
  };
  var it = /^it\b/i.test((navigator.languages && navigator.languages[0]) || navigator.language || "");
  if (it) {
    document.documentElement.lang = "it";
    document.querySelectorAll("[data-t]").forEach(function (e) { var k = e.getAttribute("data-t"); if (IT[k]) e.innerHTML = IT[k]; });
  }
  var dici = function (k, en) { return it && IT[k] ? IT[k] : en; };

  // ·· La piattaforma: si mostra solo la sua (le altre a richiesta) ··
  var ua = navigator.userAgent;
  var ios = /iP(hone|ad|od)/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var android = /Android/i.test(ua);
  var mia = ios ? "ios" : android ? "android" : "desktop";
  var blocchi = document.querySelectorAll(".piattaforma");
  blocchi.forEach(function (b) { b.hidden = b.getAttribute("data-per") !== mia; });
  var altre = document.querySelector("[data-altre]");
  if (altre) altre.addEventListener("click", function () { blocchi.forEach(function (b) { b.hidden = false; }); altre.hidden = true; });
  // Già installata come app: la sezione serve meno, ma resta per l'APK.
  var installata = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  if (installata && ios) { var b = document.querySelector('[data-per="ios"]'); if (b) b.hidden = true; }

  // ·· L'APK: l'ultima release del repo, se c'è ··
  var apk = document.querySelector("[data-apk]"), info = document.querySelector("[data-apk-info]");
  if (apk) {
    apk.href = "https://github.com/" + REPO + "/releases/latest/download/" + APK;
    fetch("https://api.github.com/repos/" + REPO + "/releases/latest", { headers: { Accept: "application/vnd.github+json" } })
      .then(function (r) { if (!r.ok) throw r.status; return r.json(); })
      .then(function (rel) {
        var file = (rel.assets || []).filter(function (a) { return a.name === APK; })[0];
        if (!file) throw "assente";
        info.textContent = (rel.tag_name ? rel.tag_name + " · " : "") + (file.size / 1048576).toFixed(1) + " MB";
      })
      .catch(function () { apk.setAttribute("aria-disabled", "true"); info.textContent = "(" + dici("inArrivo", "coming soon") + ")"; });
  }

  // ·· Offline: il service worker ··
  if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(function () { /* niente */ });
})();

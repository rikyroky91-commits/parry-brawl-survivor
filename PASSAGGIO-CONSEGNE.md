# Passaggio di Consegne: Parry Brawl Survivor

Documento vivo di riferimento per il repository **Parry Brawl Survivor** (`rikyroky91-commits/parry-brawl-survivor`).  
Ultimo aggiornamento: **25/10/2026**, ramo `main`.  
Proprietario e referente unico: **Riccardo** (`rikyroky91-commits`).

---

## 1. Architettura del Progetto

Il progetto si compone di due repository coordinati:

1. **`parry-brawl-survivor` (questo repository)**:
   - Contiene il codice web-specifico del sito, l'HUD touch/PC, la gestione della vibrazione aptica per Android e iPhone, il bridge `ospite.js`, il service worker e la pipeline di deploy su GitHub Pages.
   - File principali:
     - `motore.json`: fissa il repository e il commit SHA esatto del motore di gioco da cui compilare.
     - `costruisci.py`: scarica da GitHub il motore al commit di `motore.json`, genera gli asset web dell'app Android e dell'estensione Chrome, vi inietta i file di `sorgente/` e produce la build pronta in `dist/`.
     - `sorgente/hud.js`, `sorgente/hud.css`: HUD dei comandi (tasto parata, abilità, direzionali, vibrazione aptica).
     - `sorgente/ospite.js`: bridge browser, memoria locale, gestione account e dispatch comandi.
     - `.github/workflows/pubblica.yml`: GitHub Actions per il deploy automatico su GitHub Pages a ogni push sul ramo `main`.

2. **`android-updater` (repository del motore di gioco)**:
   - Repository: `https://github.com/rikyroky91-commits/android-updater`
   - Ramo: `main` (il ramo `claude/parry-brawl-web` è stato unito a `main` il 25/10/2026)
   - Contiene il motore fisico e di rendering del ring (`web/static/ring.js`), le traduzioni (`lingue.js`), e la logica di combattimento condivisa tra sito, app Android ed estensione Chrome.
   - Commit attuale integrato: `2aa27f746b18fb3093075237e1c7833fdc3de112` (`main` di android-updater, 25/10/2026).

---

## 2. Aggiornamento del 25 Ottobre 2026 (motore `2aa27f7`)

Solo `motore.json` cambia in questo repository: il resto arriva dal motore. Il dettaglio è in `PASSAGGIO-CONSEGNE.md` di android-updater (registro, 24 e 25/10).

- **Revisione del motore del 21/10**: corretti il crash a ogni teletrasporto, la raffica di pugni del trasformato, le frecce prese anche a gioco spento, il colpo finale annullato, hitbox e impatto del parry; tolti dai testi a schermo nomi di marchi altrui (il «Saibaman» è il **Germoglio esplosivo**, chiave `saiba` invariata).
- **Corsa infinita, cinque biomi**: cortile, palude, dune, ghiacci, bocca del vulcano, ognuno col suo capo e un attacco speciale annunciato da un cerchio. Battuto il capo si apre uno **squarcio**: il personaggio vola su e si passa al bioma dopo; dopo il quinto si ricomincia coi nemici più forti. Sul sito l'arena (`gioca.html`, cioè `arena.html` del motore) si ricolora per bioma tramite `window.__ringBioma`, che definisce lei.
- **Feedback dei colpi**: numeri del danno, anelli d'impatto, fermo sui colpi forti.
- **Brawl alla Smash**: percentuale al posto della vita, spinta che cresce, K.O. nell'abisso o contro i bordi, piattaforme che crollano, palco che cambia forma ogni 40 s. Il palco è del motore anche sopra l'arena del sito. `ospite.js` resta com'è: `__ringModoLibero.brawl: true` è ora riconosciuto dal motore (prima la voce «Brawl» rischiava di aprire il combattimento libero).
- Provato costruendo in locale (`python costruisci.py --motore <android-updater>`) in Chromium: menu, brawl, corsa con squarcio. Non provato su un telefono.

## 2 bis. Sintesi delle Modifiche Effettuate (21 Ottobre 2026)

### 🐉 1. Ridisegno Completo dei Saibaman (Grafica e Stile Anime DBZ)
- **Problema iniziale**: i Saibaman apparivano come "cactus disegnati male".
- **Intervento realizzato**:
  - Ridefinita la silhouette biologica aliena secondo i disegni originali di Akira Toriyama.
  - Tonalità verde muschio biologico (`#6b9e38`) con costolature e solchi da insettoide/melone (`#4d7a22`) lungo il cranio e il torso.
  - Occhi rossi a mandorla minacciosi con punto luce scuro ed effetto bagliore sanguigno.
  - Braccia e gambe scattanti con unghie/artigli neri affilati e postura rannicchiata pronta allo scatto.
  - Sputo d'acido viscido e balzo verso il guerriero durante gli attacchi ravvicinati.

### ⚡ 2. Rework Limit Break & Pettinatura Super Saiyan (Goku)
- **Problema iniziale**: troppi ciuffi biondi disordinati e sproporzionati durante il Limit Break.
- **Intervento realizzato**:
  - Armonizzata la capigliatura Super Saiyan: rimossa la moltiplicazione caotica dei ciuffi, impostando le punte canoniche DBZ ben sagomate con lumeggiature biondo platino e base oro scuro.
  - Torso ridisegnato a petto nudo muscoloso e scolpito (pettorali massicci, addominali a tartaruga definiti, deltoidi e trapezi cesellati con inchiostrazione nera e ombreggiature calde).
  - Parte inferiore con pantaloni arancioni del dogi da combattimento strappati sul fondo, fascia/cintura blu scuro e polsini marziali.

### 🔥 3. Posa di Carica dell'Aura Goku & Espressione Facciale Toriyama
- **Problema iniziale**: la posa di caricamento dell'aura non rispecchiava la postura di Goku e l'espressione facciale risultava sgradevole.
- **Intervento realizzato**:
  - Posa autentica DBZ: squat marziale profondo a baricentro basso con gambe divaricate e ginocchia piegate.
  - Braccia flesse e abbassate a triangolo con pugni serrati rivolti all'interno verso le anche, gomiti leggermente aperti e muscoli tesi allo spasmo.
  - Espressione facciale classica Toriyama: bocca serrata ad arco rivolto verso il basso con linea d'ombra di sforzo marziale sotto il labbro, sopracciglia ad angolo acuto protese verso il centro, iridi concentrate e linee d'espressione sulla fronte e ai lati del viso.
  - Onde d'urto del ki che si propagano dal suolo e tremolio visivo durante l'accumulo energetico.

### 🥊 4. Rimozione Scie "a Lama" dai Pugni
- **Problema iniziale**: i pugni rilasciavano fasci geometrici allungati che sembravano lame.
- **Intervento realizzato**:
  - Eliminate completamente le lame visive poligonali dai pugni base, diretti e montanti.
  - Sostituite con cerchi d'impatto ed onde d'urto concentriche d'espansione cinetica rapida (`pugnoShockwave`) accompagnate da linee d'impatto ad alta trasparenza tipiche dei pugni marziali di Dragon Ball.

### 🕹️ 5. Correzione Comandi Direzionali & Ripresa Rotta Automatica
- **Problema iniziale**: i tasti freccia non rispondevano, il personaggio non si muoveva e dopo il comando manuale non riprendeva la caccia ai nemici.
- **Interventi realizzati**:
  - **Menu Principale e Scelta Modalità**: garantita la corretta apertura del menu di benvenuto e selezione all'avvio (`Corsa Infinita`, `Brawl`, `Account`), permettendo di scegliere la modalità o il personaggio prima di entrare nell'arena.
  - **Risoluzione blocco input**: in `sorgente/hud.js` è stato rimosso il popup automatico di registrazione account che a 700ms dal caricamento metteva il motore in pausa (`r.pausa(true)`) e focalizzava un `<input>`, bloccando l'elaborazione dei tasti.
  - **Fix eccezione JavaScript**: corretto in `sorgente/ospite.js` l'errore `ReferenceError: tastiPremuti is not defined` su perdita di focus della finestra (`window.blur`).
  - **Priorità frecce e movimento manuale**: in `ring.js`, `ArrowLeft` e `ArrowRight` muovono istantaneamente il lottatore del giocatore; `ArrowUp` esegue il salto/volo.
  - **Ripresa automatica**: al rilascio di tutti i tasti freccia, il flag `manuale` viene immediatamente disattivato e il lottatore riprende la rotta automatica verso i nemici più vicini senza scatti né latenza.

---

## 3. Guida Operativa

### Build locale del sito
```bash
# Con il motore remoto fissato in motore.json:
python costruisci.py

# Oppure da una cartella locale di android-updater:
python costruisci.py --motore ../android-updater
```

### Avvio del server di sviluppo locale
```bash
python -m http.server 8000 --directory dist
# Aprire http://localhost:8000/gioca.html
```

### Workflow di Pubblicazione su GitHub Pages
- Il sito è distribuito automaticamente su GitHub Pages dalla GitHub Action definita in `.github/workflows/pubblica.yml`.
- A ogni `push` sul ramo `main`, GitHub Actions:
  1. Clona il repository.
  2. Esegue `python3 costruisci.py`, prelevando la versione esatta di `android-updater` fissata in `motore.json`.
  3. Rilascia la directory `dist/` su GitHub Pages.

---

## 4. Regole per i Futuri Aggiornamenti

1. **Modifiche al Motore di Gioco**:
   - `ring.js`, `lingue.js`, le arene e la fisica si modificano nel repository `android-updater` (su `main`: un push lì pubblica anche il sito del tracker su Oracle).
   - Dopo aver committato e pushato le modifiche su `android-updater`, si copia il nuovo commit hash SHA in `motore.json` di questo repository.
2. **Modifiche al Sito & HUD**:
   - I layout touch, il foglio account, gli stili CSS e il bridge browser si modificano direttamente in `sorgente/`.
3. **Verifica della Build**:
   - Eseguire sempre `python costruisci.py` per accertarsi che la generazione della cartella `dist/` avvenga senza errori e che il service worker calcoli l'hash correttamente prima di effettuare il push su `main`.

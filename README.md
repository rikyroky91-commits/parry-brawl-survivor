# ⚔️ Parry Brawl Survivor — a survivor game where the music tells you when to parry

![HTML5](https://img.shields.io/badge/HTML5-Canvas-E34F26) ![PWA](https://img.shields.io/badge/iPhone-PWA-5A0FC8) ![Android](https://img.shields.io/badge/Android-APK-3DDC84) ![CI](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF)

### ▶️ [Play now in your browser](https://rikyroky91-commits.github.io/parry-brawl-survivor/) — no install needed

A survivor brawler built around one mechanic: the **parry**, timed to the beat of the soundtrack.
Enemy attacks land on the rhythm, so reading the music is how you survive the horde.

### Highlights
- 🎵 Rhythm-driven combat: attacks and the animated Parry button follow the music
- 📱 **One codebase, three platforms**: browser on PC (keyboard), installable **PWA on iPhone**, and an **Android APK** that turns the whole phone into the ring (CI build ready, release pending the signing key)
- 👆 Custom touch HUD: invisible D-pad, hold-and-swipe Parry button for specials, abilities, audio latency calibration
- 🏆 Global leaderboard, multiple arenas, offline play via service worker
- 📳 Haptic feedback, with a workaround that makes button taps vibrate even in iPhone Safari (which has no Vibration API)
- 🤖 Fully automated pipeline: GitHub Actions publishes the site on every push and builds a signed APK when the engine changes

### How it's built
The game engine (`ring.js`) is shared with a Chrome extension and an Android app in
[android-updater](https://github.com/rikyroky91-commits/android-updater). This repo pins an engine commit in
`motore.json`, and `costruisci.py` assembles the website, PWA and touch layer on top of it.

```bash
python3 costruisci.py && cd dist && python3 -m http.server 8000   # http://localhost:8000
```

### Tech
JavaScript · HTML5 Canvas · Web Audio · PWA / Service Worker · Python build script · GitHub Actions · GitHub Pages

---

## 🇮🇹 In breve

Un survivor costruito intorno al parry, con la musica che detta il tempo degli attacchi.
**[Gioca subito dal browser](https://rikyroky91-commits.github.io/parry-brawl-survivor/)**: dal PC con la tastiera,
su iPhone come web app (Condividi → Aggiungi alla schermata Home); l'APK Android è pronta da compilare in CI. Sotto la documentazione tecnica.

---

## Documentazione tecnica


Il gioco da browser: un survivor costruito intorno al parry, con la musica che detta il tempo degli attacchi.
Si gioca dal telefono (comandi touch e tasto Parata animato a tempo) o dal computer (tastiera). Da qui:
su iPhone si installa come web app (Condividi → Aggiungi alla schermata Home), su Android si scarica l'APK
che usa tutto il telefono come ring.

### Come è fatto

Il motore del gioco **non sta qui**: `ring.js`, `lingue.js`, l'avvio e le arene vivono in
[android-updater](https://github.com/rikyroky91-commits/android-updater), lo stesso motore dell'estensione per
Chrome e dell'app Android. `motore.json` dice quale commit usare; `costruisci.py` lo scarica, ne prepara gli asset
e ci aggiunge quello che è solo del sito:

| File | Cosa fa |
| --- | --- |
| `sorgente/index.html`, `sito.css`, `sito.js` | pagina d'ingresso: gioca, scelta dell'arena, installazione per piattaforma |
| `sorgente/ospite.js` | il ponte col browser (memoria in `localStorage`, classifica, nome e musica di serie) |
| `sorgente/hud.js`, `hud.css` | i comandi touch: capsula, croce, volo, tasto Parata (tenuto e dito in su: la fila delle speciali), abilità, menu, taratura dell'audio |
| `sorgente/manifest.webmanifest`, `icone/` | la web app installabile |
| `strumenti/icone.py` | rigenera le icone |
| `costruisci.py` | costruisce `dist/` (con `gioca.html` fatta dall'arena del motore e il service worker per l'offline) |

```bash
python3 costruisci.py                                # motore da GitHub, al commit di motore.json
python3 costruisci.py --motore ../android-updater    # motore da una copia locale
cd dist && python3 -m http.server 8000               # http://localhost:8000
```

**Per aggiornare il gioco**: si modifica il motore in android-updater, poi qui si cambia `commit` in `motore.json`.

## Pubblicazione

- **Sito**: `.github/workflows/pubblica.yml` a ogni push su `main`. Una volta sola: Settings → Pages → Source:
  **GitHub Actions**.
- **APK**: `.github/workflows/apk.yml` quando cambia `motore.json` (o a mano da Actions). Serve una chiave di firma
  del sito nei segreti del repo, una volta sola:

  ```bash
  keytool -genkeypair -keystore parry-sito.jks -alias sito -keyalg RSA -keysize 4096 -validity 10000
  base64 -w0 parry-sito.jks     # → segreto FIRMA_KEYSTORE
                                # la password scelta → segreto FIRMA_PASSWORD
  ```

  La chiave va conservata fuori dal repo: se si perde, chi ha già l'APK non riceve più aggiornamenti senza
  disinstallare. Senza i segreti il sito mostra «APK in arrivo».

## PC e telefono

`ospite.js` decide all'apertura (`window.__pbsPc`):

- **Telefono e tablet** (Android, iPhone, iPad, schermo solo touch): i comandi touch di `hud.js` (croce invisibile,
  tasto Parata a tempo, Aura, abilità) e il cruscotto disegnato dal sito.
- **PC** (mouse o touchpad): i comandi del motore, come sul sito del tracker e nell'estensione: controller radiale,
  tendina, tastiera (S parry, W A D, Z X C V…), cruscotto sul canvas. Il menu del sito è il tasto ☰ nella barretta
  in basso a destra, o **M**.
- **Frecce** (facoltative, spente di serie): accese dal menu, ← → camminano, ↑ decolla, ↓ atterra; spente o lasciate,
  il lottatore va da solo. Nei menu e nella scelta delle carte le frecce restano del motore.
- Il menu → **Comandi** forza PC o Touch (si ricarica); `?comandi=pc` o `?comandi=touch` vale per una visita.
- Il menu → **Installa sul telefono**: APK per Android (dall'ultima release), «Aggiungi alla schermata Home» per
  iPhone; sul PC tutte e due, con l'indirizzo da aprire sul telefono.

## Cose da sapere

- La classifica globale passa dal server di Mobile Update Tracker (`/api/corsa`): se quel sito cambia dominio,
  va cambiato `ospite.js`.
- Su iPhone nessuna app può disegnare sopra la Home o le altre app: lì il gioco è sempre a schermo intero.
- Sul telefono il terreno dell'arena è alto quanto serve ai comandi (`__ringAltezzaSuolo` in `costruisci.py`) e tutti i
  tasti stanno sotto la sua linea: sopra c'è solo il gioco (e la capsula in alto).
- Vibrazione su iPhone: Safari non ha l'API Vibration. Ogni tasto ha sopra un interruttore trasparente
  (`<input type=checkbox switch>`): il dito lo tocca davvero e Safari fa il suo «tic» (da iOS 17.4). Il vecchio trucco
  del clic finto da codice non funziona più da iOS 26.5. Parry riusciti e colpi presi su iPhone non vibrano: non sono
  tocchi, e una pagina web non ha altro modo.
- Il font è Archivo (SIL Open Font License, `sorgente/font/OFL.txt`), servito dal sito.

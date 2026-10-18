"""Costruisce il sito di Parry Brawl Survivor in `dist/` (18/10/2026).

    python3 costruisci.py                       # prende il motore da GitHub, al commit di motore.json
    python3 costruisci.py --motore ../android-updater   # da una copia locale (com'è, anche non committata)

Il gioco (ring.js, lingue.js, l'avvio e le arene) si modifica SOLO in android-updater: è lo stesso motore
dell'estensione e dell'app Android. Qui si prendono gli asset che `android/costruisci.py --solo-asset` prepara
per l'app, si sostituisce il ponte con Java (`ponte.js`) col ponte del browser (`ospite.js`) e si aggiungono i
comandi touch (`hud.js`), la pagina d'ingresso e quello che serve per installarlo come app.

I ritocchi a `arena.html` si fermano con un errore se l'originale cambia: va aggiornato il ritocco, non aggirato.
"""
import argparse
import hashlib
import json
import pathlib
import shutil
import subprocess
import sys
import tempfile
from datetime import datetime, timezone

QUI = pathlib.Path(__file__).resolve().parent
SORGENTE = QUI / "sorgente"
USCITA = QUI / "dist"
DAL_MOTORE = ["ring.js", "lingue.js", "prepara.js", "comandi.js"]


def esegui(comando, cartella):
    print("$", " ".join(comando), "  (in", cartella, ")")
    subprocess.run(comando, cwd=cartella, check=True)


def prendi_motore(locale):
    """La cartella di android-updater da cui costruire, e il commit."""
    if locale:
        cartella = pathlib.Path(locale).resolve()
        try:
            commit = subprocess.run(["git", "rev-parse", "HEAD"], cwd=cartella, capture_output=True, text=True, check=True).stdout.strip()
            sporco = subprocess.run(["git", "status", "--porcelain", "--", "web/static", "android/web", "estensione"], cwd=cartella, capture_output=True, text=True).stdout.strip()
            if sporco:
                commit += "+modifiche-locali"
        except (subprocess.CalledProcessError, FileNotFoundError):
            commit = "locale"
        return cartella, commit
    pin = json.loads((QUI / "motore.json").read_text(encoding="utf-8"))
    commit = pin["commit"]
    if not commit or commit.startswith("DA-"):
        sys.exit("motore.json: manca il commit di android-updater da usare")
    cartella = pathlib.Path(tempfile.mkdtemp(prefix="motore-"))
    esegui(["git", "init", "-q"], cartella)
    esegui(["git", "remote", "add", "origin", pin["repo"]], cartella)
    esegui(["git", "fetch", "-q", "--depth", "1", "origin", commit], cartella)
    esegui(["git", "checkout", "-q", "FETCH_HEAD"], cartella)
    return cartella, commit


def ritocca(testo, sostituzioni, nome):
    for vecchio, nuovo in sostituzioni:
        if testo.count(vecchio) != 1:
            sys.exit(f"{nome}: il punto da ritoccare è cambiato o non c'è più:\n{vecchio}")
        testo = testo.replace(vecchio, nuovo)
    return testo


TESTA = """  <title>Parry Brawl Survivor</title>
  <meta name="theme-color" content="#0e0c18">
  <link rel="manifest" href="manifest.webmanifest">
  <link rel="icon" href="icone/favicon-32.png" sizes="32x32">
  <link rel="apple-touch-icon" href="icone/apple-touch-icon.png">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="Parry Brawl">
  <link rel="stylesheet" href="font.css">
  <link rel="stylesheet" href="hud.css">
  <script>
    // Si parte nel cortile di pietra (l'arena della corsa); l'1 contro 1 passa alla lava da sé (ospite.js).
    (function () { try { if (!/[?&]tipo=/.test(location.search)) history.replaceState(null, "", (location.search ? location.search + "&" : "?") + "tipo=arena"); } catch (e) {} })();
  </script>"""


def gioca_html(arena):
    return ritocca(arena, [
        ("  <title>Page Brawl · Arena</title>", TESTA),
        ('  <script>window.__pbModo = "arena";</script>\n  <script src="ponte.js"></script>', '  <script src="ospite.js"></script>'),
        ('  <script src="lingue.js"></script>', '  <script src="motore/lingue.js"></script>'),
        ('  <script src="prepara.js"></script>', '  <script src="motore/prepara.js"></script>'),
        ('  <script src="ring.js"></script>', '  <script src="motore/ring.js"></script>'),
        # (sul PC lo stile da telefono di comandi.js nasconderebbe i tasti del motore: così comandi.js si ferma subito)
        ('  <script src="comandi.js"></script>', '  <script>if (window.__pbsPc && window.__ringRadice) window.__ringRadice.__pbComandi = true;</script>\n'
                                               '  <script src="motore/comandi.js"></script>\n  <script src="hud.js"></script>'),
    ], "arena.html")


def service_worker(file, versione):
    elenco = json.dumps(["./"] + sorted("./" + f for f in file if f != "sw.js"), indent=0)
    return f"""/* GENERATO da costruisci.py. Offline: tutto il sito in cache alla prima visita, aggiornato a ogni versione. */
const VERSIONE = "pbs-{versione}";
const FILE = {elenco};
self.addEventListener("install", (e) => {{ e.waitUntil(caches.open(VERSIONE).then((c) => c.addAll(FILE)).then(() => self.skipWaiting())); }});
self.addEventListener("activate", (e) => {{
  e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((n) => n !== VERSIONE).map((n) => caches.delete(n)))).then(() => self.clients.claim()));
}});
self.addEventListener("fetch", (e) => {{
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;            // classifica, GitHub: sempre dalla rete
  e.respondWith(caches.match(e.request, {{ ignoreSearch: true }}).then((r) => r || fetch(e.request)));
}});
"""


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--motore", help="cartella locale di android-updater (sennò il commit di motore.json da GitHub)")
    a = p.parse_args()
    motore, commit = prendi_motore(a.motore)
    esegui([sys.executable, "estensione/costruisci.py"], motore)
    esegui([sys.executable, "android/costruisci.py", "--solo-asset"], motore)
    asset = motore / "android" / "build" / "assets" / "web"

    if USCITA.exists():
        shutil.rmtree(USCITA)
    shutil.copytree(SORGENTE, USCITA)
    (USCITA / "motore").mkdir()
    for nome in DAL_MOTORE:
        shutil.copy2(asset / nome, USCITA / "motore" / nome)
    (USCITA / "gioca.html").write_text(gioca_html((asset / "arena.html").read_text(encoding="utf-8")), encoding="utf-8")
    (USCITA / "versione.json").write_text(json.dumps({
        "motore": commit, "costruito": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    }, indent=2) + "\n", encoding="utf-8")

    file = [str(f.relative_to(USCITA)).replace("\\", "/") for f in USCITA.rglob("*") if f.is_file() and not f.name.endswith(".txt")]
    impronta = hashlib.sha256()
    for f in sorted(file):
        impronta.update(f.encode()); impronta.update((USCITA / f).read_bytes())
    (USCITA / "sw.js").write_text(service_worker(file, impronta.hexdigest()[:12]), encoding="utf-8")
    (USCITA / ".nojekyll").write_text("", encoding="utf-8")
    print(f"sito in {USCITA} ({len(file) + 1} file), motore {commit}")


if __name__ == "__main__":
    main()

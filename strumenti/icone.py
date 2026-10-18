"""Le icone di Parry Brawl Survivor (18/10/2026): uno scudo d'oro che respinge un colpo, su fondo notte.

    python3 strumenti/icone.py      → sorgente/icone/*.png

Disegnate qui (niente immagini prese da fuori): grandi 1024 px e poi rimpicciolite, per bordi puliti.
"""
import math
import pathlib

from PIL import Image, ImageDraw, ImageFilter

QUI = pathlib.Path(__file__).resolve().parent.parent / "sorgente" / "icone"
L = 1024
ORO = (255, 216, 74)
ORO_SCURO = (201, 150, 20)
NOTTE_A = (20, 18, 32)
NOTTE_B = (52, 40, 82)


def fondo(maschera_tonda=True):
    img = Image.new("RGBA", (L, L), (0, 0, 0, 0))
    grad = Image.new("RGBA", (L, L))
    px = grad.load()
    for y in range(L):
        for x in range(L):
            d = math.hypot(x - L * 0.5, y - L * 0.42) / (L * 0.75)
            k = max(0.0, min(1.0, d))
            px[x, y] = tuple(int(NOTTE_B[i] * (1 - k) + NOTTE_A[i] * k) for i in range(3)) + (255,)
    if not maschera_tonda:
        return grad
    m = Image.new("L", (L, L), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, L - 1, L - 1), radius=int(L * 0.22), fill=255)
    img.paste(grad, (0, 0), m)
    return img


def scudo(img, scala=1.0):
    d = ImageDraw.Draw(img)
    cx, cy, s = L / 2, L * 0.53, L * 0.30 * scala
    # l'anello del parry, che esplode intorno
    alone = Image.new("RGBA", (L, L), (0, 0, 0, 0))
    da = ImageDraw.Draw(alone)
    r = s * 1.38
    da.ellipse((cx - r, cy - r, cx + r, cy + r), outline=ORO + (255,), width=int(L * 0.028))
    for i in range(12):
        a = i / 12 * math.tau + 0.13
        r0, r1 = s * 1.52, s * (1.78 if i % 2 else 1.66)
        da.line((cx + math.cos(a) * r0, cy + math.sin(a) * r0, cx + math.cos(a) * r1, cy + math.sin(a) * r1), fill=(255, 246, 196, 255), width=int(L * 0.022))
    bagliore = alone.filter(ImageFilter.GaussianBlur(L * 0.02))
    img.alpha_composite(bagliore)
    img.alpha_composite(alone)
    # lo scudo: bordo alto dritto, fianchi che scendono a punta
    lati = []
    for t in range(0, 101):
        u = t / 100
        x = s * 0.9 * (1 - u ** 2.4) ** 0.85
        y = -s * 0.9 + u * s * 2.0
        lati.append((cx + x, cy + y))
    sinistra = [(2 * cx - x, y) for (x, y) in reversed(lati)]
    d.polygon(lati + sinistra, fill=ORO + (255,))
    d.polygon([(cx, cy - s * 0.9)] + [(cx, y) for (_, y) in lati[1:]] + sinistra[:-1], fill=(255, 232, 140, 255))
    # il bordo
    d.line(lati + sinistra + [lati[0]], fill=ORO_SCURO + (255,), width=int(L * 0.014), joint="curve")
    # il colpo respinto: un fendente che arriva in diagonale e rimbalza, con la scintilla nel punto d'urto
    w = int(L * 0.036)
    px, py = cx + s * 0.05, cy - s * 0.05
    d.line((cx - s * 0.62, cy - s * 0.6, px, py), fill=(42, 34, 66, 255), width=w)
    d.line((px, py, cx - s * 0.5, cy + s * 0.55), fill=(42, 34, 66, 255), width=w)
    for k in range(8):
        a = k / 8 * math.tau
        r1 = s * (0.34 if k % 2 == 0 else 0.2)
        d.line((px, py, px + math.cos(a) * r1, py + math.sin(a) * r1), fill=(255, 255, 255, 255), width=int(L * 0.018))
    d.ellipse((px - s * 0.09, py - s * 0.09, px + s * 0.09, py + s * 0.09), fill=(255, 255, 255, 255))
    return img


def salva(img, nome, misura):
    QUI.mkdir(parents=True, exist_ok=True)
    img.resize((misura, misura), Image.LANCZOS).save(QUI / nome)


def main():
    tonda = scudo(fondo(True))
    salva(tonda, "icona-512.png", 512)
    salva(tonda, "icona-192.png", 192)
    salva(tonda, "favicon-32.png", 32)
    # Apple e «maskable» vogliono il quadrato pieno (il sistema taglia da sé); il disegno sta nella zona sicura.
    piena = scudo(fondo(False), scala=0.82)
    salva(piena, "apple-touch-icon.png", 180)
    salva(piena, "icona-maskable-512.png", 512)
    print("icone in", QUI)


if __name__ == "__main__":
    main()

"""Genera el código QR que apunta a la página publicada.

Uso:
    pip install segno
    python scripts/make_qr.py https://TU-USUARIO.github.io/cv-esteban-calle/

Crea assets/qr/QR_CV_Esteban_Calle.png (para pantalla o impresión) y .svg (escalable).
Los módulos usan el vino de la paleta (#4f000b) sobre blanco, que se escanea bien.
"""
import sys
from pathlib import Path

import segno

if len(sys.argv) != 2:
    sys.exit("Falta la URL. Ejemplo: python scripts/make_qr.py https://TU-USUARIO.github.io/cv-esteban-calle/")

url = sys.argv[1]
out = Path(__file__).resolve().parent.parent / "assets" / "qr"
out.mkdir(parents=True, exist_ok=True)

qr = segno.make(url, error="q")   # corrección de errores nivel Q
qr.save(out / "QR_CV_Esteban_Calle.png", scale=24, border=4, dark="#4f000b", light="#ffffff")
qr.save(out / "QR_CV_Esteban_Calle.svg", scale=24, border=4, dark="#4f000b", light="#ffffff")
print("Listo:", out)

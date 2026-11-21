# CV Esteban Calle

Hoja de vida interactiva de Juan Esteban Calle Betancur (Desarrollador Frontend Junior · Ingeniero de Multimedia), en español e inglés. Es una página estática: HTML, CSS y JavaScript sin dependencias de compilación.

## Estructura

```
cv-esteban-calle/
├── index.html            Contenido en español y estructura de la página
├── css/
│   └── styles.css        Estilos: paleta, tipografías y todas las secciones
├── js/
│   ├── i18n.js           Textos en inglés, rutas de los PDF y mensajes
│   ├── suzanne.js        Geometría de Suzanne (el mono de Blender) en base64
│   ├── mesh.js           Escena 3D del fondo con Suzanne (Three.js)
│   └── main.js           Idioma, scroll infinito, animaciones y clics
├── assets/
│   ├── cv/               PDF del CV en español e inglés
│   └── qr/               Aquí se guarda el QR que genera scripts/make_qr.py
├── scripts/
│   └── make_qr.py        Genera el código QR de la página publicada
└── .vscode/
    └── extensions.json   Recomienda la extensión Live Server
```

## Abrirlo en VS Code

1. Abre la carpeta `cv-esteban-calle` en VS Code (Archivo → Abrir carpeta).
2. Instala la extensión **Live Server** (VS Code te la sugiere al abrir la carpeta).
3. Clic derecho sobre `index.html` → **Open with Live Server**. La página se recarga sola al guardar cambios.

También puedes abrir `index.html` directamente en el navegador. Necesita internet para cargar las tipografías (Google Fonts) y Three.js (cdnjs); sin conexión la página funciona, pero con tipografías de reemplazo y sin el fondo 3D.

## Qué editar y dónde

| Quiero cambiar... | Archivo |
| --- | --- |
| Un texto del CV | El español en `index.html` y su traducción en `js/i18n.js` (misma clave `data-i`) |
| Colores | Variables al inicio de `css/styles.css` (`--wine`, `--claret`, `--rose`, `--coral`, `--amber`, `--ink`, `--paper`) |
| Tipografías | Variables `--font-*` en `css/styles.css` y el `<link>` de Google Fonts en `index.html` |
| Añadir un proyecto | Copia un bloque `<article class="card">` en `index.html` y crea sus claves en `js/i18n.js` |
| Los PDF | Reemplaza los archivos de `assets/cv/` con el mismo nombre |
| El fondo 3D (colores, tamaño, cómo se mueve Suzanne) | `js/mesh.js` |
| Cambiar el modelo 3D por otro | Reemplaza los datos de `js/suzanne.js` (posiciones, triángulos y aristas) |
| Intensidad del fondo 3D por sección | Atributo `data-mesh` (0 a 1) de cada `<section>` en `index.html` |

Notas útiles:

- **Cómo funciona el idioma:** el español vive en el HTML. Cada elemento traducible tiene `data-i="clave"`, y `EN` en `js/i18n.js` guarda el inglés de esa clave. Si falta la clave en `EN`, se mantiene el español.
- **Scroll infinito:** al cargar, `js/main.js` clona el contenido de `<div class="copy">` dos veces (arriba y abajo) y salta entre copias sin que se note. Edita solo la copia del HTML, nunca los clones.
- **Movimiento reducido:** si el sistema del usuario pide menos movimiento, Suzanne queda en una pose fija y se desactivan la cinta y las inclinaciones.
- **El fondo 3D:** Suzanne se ve como malla de alambre a la izquierda de una línea vertical que sigue al cursor, y como superficie sombreada a la derecha. Mira hacia el cursor y gira un poco con el scroll.

## Publicarlo en GitHub

Desde la carpeta del proyecto:

```bash
git init
git add .
git commit -m "Primera versión del CV web"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/cv-esteban-calle.git
git push -u origin main
```

Crea antes el repositorio vacío `cv-esteban-calle` en GitHub (sin README ni .gitignore).

### Alojarlo gratis con GitHub Pages

1. En el repositorio: **Settings → Pages**.
2. En *Build and deployment*, elige **Deploy from a branch**, rama `main` y carpeta `/ (root)`.
3. Tras uno o dos minutos la página queda en `https://TU-USUARIO.github.io/cv-esteban-calle/`.

Las rutas del proyecto son relativas, así que funciona igual en esa dirección con subcarpeta.

## Código QR

Cuando tengas la dirección final, genera el QR:

```bash
pip install segno
python scripts/make_qr.py https://TU-USUARIO.github.io/cv-esteban-calle/
```

Se crean `assets/qr/QR_CV_Esteban_Calle.png` y `.svg`. Escanéalo con tu celular antes de imprimirlo.

## Créditos

- **Suzanne:** modelo de los [Khronos glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/Suzanne) (UX3D), licencia CC0 1.0 (dominio público). Es el mono de pruebas de Blender.
- **Three.js** (r128) para el fondo 3D, y **Google Fonts** para las tipografías Bricolage Grotesque, Inter y JetBrains Mono.

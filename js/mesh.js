/* ==========================================================================
   mesh.js · Suzanne, el mono de Blender, como fondo 3D (Three.js)

   Dibuja a Suzanne fija detrás de la página. Una línea vertical ("costura")
   sigue al cursor: a su izquierda el modelo se ve como malla de alambre (las
   aristas de sus cuadriláteros), a su derecha como superficie sombreada. Es la
   idea de "3D + código" hecha interacción. Suzanne mira hacia el cursor y gira
   un poco con el scroll.

   La geometría viene de js/suzanne.js (window.CV_SUZANNE).

   Se expone una sola función: CVMesh.create(opciones). Devuelve null si Three.js
   o el modelo no están disponibles, o si WebGL falla; en ese caso la página sigue
   funcionando sin el fondo 3D.

   opciones:
     canvas  -> el <canvas id="mesh"> de index.html
     pointer -> objeto compartido { x, y, active } con la posición del puntero
     reduce  -> true si el usuario pidió menos movimiento (pose fija, sin giros)

   devuelve { step(now, dt, target, vel), resize() }:
     step   -> se llama en cada frame; target es la opacidad deseada (0 a 1) y
               vel la velocidad de scroll, que hace girar la cabeza
     resize -> recalcula tamaño y posición del modelo
   ========================================================================== */
(function () {
  'use strict';

  /* Convierte un texto base64 en un arreglo tipado (Float32Array o Uint16Array) */
  function decode(b64, Type) {
    var s = atob(b64), bytes = new Uint8Array(s.length);
    for (var i = 0; i < s.length; i++) bytes[i] = s.charCodeAt(i);
    return new Type(bytes.buffer);
  }

  function create(opts) {
    if (!window.THREE || !window.CV_SUZANNE) return null;
    var T = window.THREE;
    var canvas = opts.canvas, pointer = opts.pointer, reduce = opts.reduce;
    var renderer;

    try {
      renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
    } catch (e) { return null; }
    renderer.setClearColor(0x000000, 0);

    var scene = new T.Scene();
    var camera = new T.PerspectiveCamera(38, 1, 0.1, 50);
    camera.position.z = 6.2;

    /* Geometría de Suzanne. Se comparte el mismo atributo de posiciones entre la
       superficie (triángulos) y la malla de alambre (aristas de los cuadriláteros). */
    var positions = new T.BufferAttribute(decode(window.CV_SUZANNE.positions, Float32Array), 3);

    var surfaceGeo = new T.BufferGeometry();
    surfaceGeo.setAttribute('position', positions);
    surfaceGeo.setIndex(new T.BufferAttribute(decode(window.CV_SUZANNE.indices, Uint16Array), 1));
    surfaceGeo.computeVertexNormals();   // normales suaves, como "Shade Smooth" en Blender

    var wireGeo = new T.BufferGeometry();
    wireGeo.setAttribute('position', positions);
    wireGeo.setIndex(new T.BufferAttribute(decode(window.CV_SUZANNE.edges, Uint16Array), 1));

    /* Posición x (en el mundo) de la costura; ambos materiales la leen para decidir qué dibujar */
    var split = { value: 0 };

    /* Parte sombreada: degradado entre los colores de la paleta según la altura y la normal */
    var solid = new T.Mesh(surfaceGeo, new T.ShaderMaterial({
      uniforms: {
        uSplit: split,
        uA: { value: new T.Color('#720026') },
        uB: { value: new T.Color('#ce4257') },
        uC: { value: new T.Color('#ff7f51') },
        uD: { value: new T.Color('#ff9b54') }
      },
      vertexShader: [
        'varying vec3 vN; varying vec3 vW;',
        'void main(){',
        '  vec4 wp = modelMatrix * vec4(position, 1.0);',
        '  vW = wp.xyz;',
        '  vN = normalize(mat3(modelMatrix) * normal);',
        '  gl_Position = projectionMatrix * viewMatrix * wp;',
        '}'
      ].join('\n'),
      fragmentShader: [
        'uniform float uSplit; uniform vec3 uA; uniform vec3 uB; uniform vec3 uC; uniform vec3 uD;',
        'varying vec3 vN; varying vec3 vW;',
        'void main(){',
        '  if (vW.x < uSplit) discard;                       // a la izquierda de la costura no se dibuja',
        '  vec3 n = normalize(vN);',
        '  vec3 L = normalize(vec3(-0.4, 0.7, 0.8));         // dirección de la luz',
        '  float d = max(dot(n, L), 0.0);',
        '  float rim = pow(1.0 - max(dot(n, vec3(0.0, 0.0, 1.0)), 0.0), 2.4);  // brillo en el borde',
        '  float t = clamp(vW.y * 0.42 + 0.5 + n.x * 0.12, 0.0, 1.0);',
        '  vec3 base = t < 0.5 ? mix(uA, uB, t * 2.0) : mix(uB, uC, (t - 0.5) * 2.0);',
        '  vec3 col = base * (0.4 + 0.85 * d) + uD * rim * 0.55;',
        '  gl_FragColor = vec4(col, 1.0);',
        '}'
      ].join('\n')
    }));

    /* Parte de alambre: las aristas de los cuadriláteros, en ámbar translúcido */
    var wire = new T.LineSegments(wireGeo, new T.ShaderMaterial({
      uniforms: { uSplit: split, uColor: { value: new T.Color('#ff9b54') } },
      transparent: true,
      depthWrite: false,
      vertexShader: [
        'varying vec3 vW;',
        'void main(){',
        '  vec4 wp = modelMatrix * vec4(position, 1.0);',
        '  vW = wp.xyz;',
        '  gl_Position = projectionMatrix * viewMatrix * wp;',
        '}'
      ].join('\n'),
      fragmentShader: [
        'uniform float uSplit; uniform vec3 uColor; varying vec3 vW;',
        'void main(){',
        '  if (vW.x > uSplit) discard;                       // a la derecha de la costura no se dibuja',
        '  gl_FragColor = vec4(uColor, 0.7);',
        '}'
      ].join('\n')
    }));

    var monkey = new T.Group();
    monkey.add(solid);
    monkey.add(wire);
    scene.add(monkey);

    /* Línea vertical que marca la costura */
    var seamGeo = new T.BufferGeometry();
    seamGeo.setAttribute('position', new T.Float32BufferAttribute([0, -2.1, 0.2, 0, 2.1, 0.2], 3));
    var seam = new T.Line(seamGeo, new T.LineBasicMaterial({ color: 0xff9b54, transparent: true, opacity: 0.75 }));
    scene.add(seam);

    var halfW = 3;   // mitad del ancho visible en el plano del modelo

    function resize() {
      var w = window.innerWidth, h = window.innerHeight;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      halfW = Math.tan(19 * Math.PI / 180) * camera.position.z * camera.aspect;
      if (camera.aspect >= 1.15) {
        /* Pantalla ancha: Suzanne a la derecha, el texto a la izquierda */
        monkey.position.set(halfW * 0.52, 0, 0);
        monkey.scale.setScalar(1.3);
      } else {
        /* Pantalla vertical: centrada y más pequeña */
        monkey.position.set(0, -0.2, 0);
        monkey.scale.setScalar(Math.min(1.1, halfW * 0.85 / 1.34));
      }
    }
    resize();

    var current = 0;                 // opacidad actual del canvas
    var yaw = 0.3, pitch = -0.05;    // hacia dónde mira Suzanne (radianes)
    var spin = 0;                    // giro extra que aporta el scroll y se disipa solo
    monkey.rotation.set(pitch, yaw, 0);

    function step(now, dt, target, vel) {
      if (camera.aspect < 1) target *= 0.42;   // en móvil el fondo es más tenue para no estorbar la lectura
      current += (target - current) * Math.min(1, dt * 4);
      canvas.style.opacity = current.toFixed(3);
      if (current < 0.02) return;              // casi invisible: no se gasta GPU

      var t = now / 1000;
      if (!reduce) {
        /* Suzanne mira hacia el cursor; sin cursor, mira de lado a lado muy despacio */
        var ty = pointer.active ? (pointer.x / window.innerWidth * 2 - 1) * 0.55 : Math.sin(t * 0.5) * 0.4;
        var tp = pointer.active ? (pointer.y / window.innerHeight * 2 - 1) * 0.25 : Math.sin(t * 0.37) * 0.08;
        yaw += (ty - yaw) * Math.min(1, dt * 3);
        pitch += (tp - pitch) * Math.min(1, dt * 3);

        /* El scroll gira la cabeza (en la dirección del scroll) y luego vuelve a su sitio */
        spin += vel * 0.0006 * dt;
        spin -= spin * Math.min(1, dt * 1.2);
        spin = Math.max(-1.4, Math.min(1.4, spin));   // nunca da la espalda del todo

        monkey.rotation.y = yaw + spin;
        monkey.rotation.x = pitch - 0.05;
      }

      var tx;
      if (pointer.active) tx = (pointer.x / window.innerWidth * 2 - 1) * halfW;   // la costura sigue al puntero
      else tx = reduce ? monkey.position.x : monkey.position.x + Math.sin(t * 0.7) * 1.1;  // sin puntero: barrido lento
      split.value += (tx - split.value) * Math.min(1, dt * 8);
      seam.position.x = split.value;

      renderer.render(scene, camera);
    }

    return { step: step, resize: resize };
  }

  window.CVMesh = { create: create };
})();

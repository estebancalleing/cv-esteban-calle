/* ==========================================================================
   i18n.js · textos y configuración de idioma

   Cómo funciona el cambio de idioma:
   - El español está escrito directamente en index.html.
   - Cada elemento traducible lleva un atributo data-i="clave".
   - Aquí abajo, el objeto EN guarda la versión en inglés de cada clave.
   - main.js lee el texto en español del HTML al iniciar, y alterna entre
     ese texto y el inglés de este archivo cuando se pulsa ES / EN.

   Para editar un texto: cambia el español en index.html y su traducción
   en la misma clave de EN. Si una clave no existe en EN, se mantiene el español.
   ========================================================================== */
window.CV_I18N = {

  /* Rutas de los PDF (el botón "Descargar CV" del inicio usa el del idioma activo) */
  PDF: { es: 'assets/cv/CV_Juan_Calle_ES.pdf', en: 'assets/cv/CV_Juan_Calle_EN.pdf' },
  /* Nombre con el que se guarda el archivo al descargarlo */
  FILE: { es: 'CV_Juan_Esteban_Calle_ES.pdf', en: 'CV_Juan_Esteban_Calle_EN.pdf' },

  /* En pantallas táctiles la pista del inicio cambia de "mueve el cursor" a "desliza" */
  HINT_T_ES: 'Desliza para pasar de malla a sombreado',

  /* Claves cuyo texto contiene HTML (negrita en las etiquetas de idiomas) */
  HTML_KEYS: { l_es: 1, l_en: 1 },

  /* Mensajes breves: [español, inglés] */
  TOAST: {
    copied: ['Correo copiado', 'Email copied'],
    copyfail: ['Selecciona y copia el correo', 'Select and copy the email']
  },

  /* Versión en inglés de cada clave data-i */
  EN: {
    /* Navegación */
    nav_projects: 'Projects', nav_exp: 'Experience', nav_skills: 'Skills', nav_contact: 'Contact',

    /* Inicio */
    role1: 'Junior Frontend Developer', role2: 'Multimedia Engineer',
    lede: 'Multimedia Engineer with 3+ years of professional experience in 3D and interactive production, transitioning into software development with a focus on Frontend. Solid foundation in C#, JavaScript and TypeScript; web development experience with HTML, CSS, Next.js and forays into ASP.NET, and interactive applications built in Unity (AR, VR and video games).',
    lede2: 'Used to working in multidisciplinary teams, delivering to clients with changing requirements, and verifying the quality of deliverables and builds. Currently deepening my skills in React, Git/GitHub and API consumption, and studying multi-agent AI orchestration.',
    cta_projects: 'View projects', cta_cv: 'Download CV',
    hint: 'Move your cursor to switch between mesh and shaded',
    hint_t: 'Drag to switch between mesh and shaded',
    mq: '3D × Code',

    /* Proyectos */
    h_projects: 'Projects', sub_projects: 'Web applications, video games and physical devices connected to Unity.',
    g_web: 'Web', g_3d: '3D × Code',
    p1_tag: 'Personal project · in progress', p1_t: 'Car Rental Agency Booking Platform',
    p1_b1: 'Web application to view booking information, fetching data from an API using fetch.',
    p1_b2: 'Next phase: integrate an API that displays the booked vehicle and the full rental details.',
    p2_tag: 'Academic project', p2_t: 'ASP.NET Website',
    p2_b1: 'Web application with forms, C# logic and Bootstrap styling.',
    p3_tag: 'Academic and personal projects', p3_t: 'Interactive Applications & Video Games',
    p3_b1: 'Programmed augmented and virtual reality applications (Meta Quest) and an action video game with FPS mechanics.',
    p3_b2: 'External device integration: Kinect with Unity, and an Arduino mini-console connected through a serial port to an Asteroids clone.',
    p4_tag: 'Team of 6', p4_t: 'Olimpiadas Tech Video Game',
    p4_stack: 'Unity · C# · 3D modeling · Rigging · Animation',
    p4_b1: 'Designed the environment based on a real city and laid out the spaces for gameplay and story.',
    p4_b2: 'Produced the 3D models, rigs and animations for the characters and enemies.',
    p4_b3: "Supported the game's art direction.",

    /* Experiencia y educación */
    h_exp: 'Experience',
    e1_date: 'Jan 2023 – Jul 2026', e1_role: '3D Generalist',
    e1_b1: 'Produced 3D assets for animation and real-time engines (Unity and web), meeting technical performance specifications: LODs, texture density and reusable materials.',
    e1_b2: 'Deliverable quality control: checking models against requirements, packaged materials, correct deployment in the engine and build review.',
    e1_b3: 'Daily collaboration with art, animation and development teams through Slack, Notion and Figma, using standardized workflows and reusable components.',
    e1_b4: 'Delivered work to clients across different sectors (a digital-money fintech startup, a fitness and running app, among others), adapting to changes in direction and requirements modified during the project.',
    e2_date: '2019 – present (intermittent)', e2_role: 'Video Editor & Animator',
    e2_b1: 'Editing, color grading and animation for music videos, explaining to clients and teams the reasoning behind each creative decision.',
    h_edu: 'Education', ed_t: 'Multimedia Engineering', ed_honor: 'Graduated with Honors',
    ed_course: 'Relevant coursework: programming in every semester, software analysis and development, databases, data networks, multimedia data networks and signal processing.',

    /* Habilidades */
    h_skills: 'Skills', s_lang: 'Languages', s_back: 'Backend & Data', s_tools: 'Tools', s_qa: 'Quality (QA)', s_ai: 'AI',
    k_react: 'React (learning)', k_api: 'Consuming APIs with fetch',
    k_db: 'Database design and creation', k_net: 'Data networks', k_term: 'Terminal',
    k_qa1: 'Build verification', k_qa2: 'Requirements validation', k_qa3: 'Manual deployment testing',
    k_ai1: 'Multi-agent orchestration (studying)', k_ai2: 'AI assistants for code debugging',
    s_langs: 'Languages spoken', l_es: '<strong>Spanish:</strong> native',
    l_en: '<strong>English:</strong> professional (fluent conversation in technical environments)',

    /* Contacto */
    h_contact: 'Contact', sub_contact: 'Write to me or download my CV.',
    c_name: 'Name', c_mail: 'Email', btn_copy: 'Copy', btn_write: 'Send email', c_cv: 'CV',
    dl_es: 'CV in Spanish (PDF)', dl_en: 'CV in English (PDF)',
    loop: 'Keep scrolling: the page loops back to the top.'
  }
};

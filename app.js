// trusted logos marquee (separating 15 logos from a 5x3 SVG grid sheet)
const track = document.getElementById('marqueeTrack');
const cols = 5;
const rows = 3;
const logoItems = [];

// Generate the 15 individualized logo divs
for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    const el = document.createElement('div');
    el.className = 'brand-logo-item';
    el.style.backgroundPosition = `${c * 25}% ${r * 50}%`;
    logoItems.push(el);
  }
}

// Duplicate the set to allow a seamless loop scroll in the marquee
[...logoItems, ...logoItems].forEach(item => {
  track.appendChild(item.cloneNode(true));
});

// scroll reveal for regular sections
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// ---- Scroll story: cards gather into a deck, then move to the right ----
const story = document.getElementById('story');
const stage = document.getElementById('storyStage');
const cards = [...document.querySelectorAll('#deck .card')];
const heroText = document.getElementById('heroText');
const somosText = document.getElementById('somosText');

const N = cards.length;
const mid = (N - 1) / 2;

// Nuevas configuraciones para 4 tarjetas de fotos asimétricas
const heroRot = [-4, 2, -2, 5];
const heroX = [-380, -130, 130, 380];
const heroY = [95, 75, 100, 115];

// Configuraciones finales para el collage en sección Somos
const somosRot = [-5, 3, -2, 6];
const somosX = [40, 180, 330, 470];
const somosY = [-60, 50, -40, 110];
const somosScale = [0.8, 0.75, 0.72, 0.72];

function lerp(a, b, t) { return a + (b - a) * t; }

let ticking = false;

function update() {
  ticking = false;
  const storyRect = story.getBoundingClientRect();
  const stageH = stage.offsetHeight;
  const total = story.offsetHeight - stageH;
  let progress = total > 0 ? (-storyRect.top) / total : 0;
  progress = Math.min(1, Math.max(0, progress));

  const stageWidth = stage.offsetWidth;
  const isMobile = stageWidth < 768;

  cards.forEach((card, i) => {
    const c = i - mid;

    if (isMobile) {
      // EN MÓVIL:
      // Fase 1 (0 -> 0.40): las tarjetas van de su posición A inicial a apilarse en el mazo B en el centro
      // Fase 2 (0.40 -> 0.75): las tarjetas se quedan en el mazo B y se desvanecen (opacity 1 -> 0) sin desarmarse a la derecha
      // Fase 3 (> 0.75): totalmente desvanecidas (opacity = 0)
      const mobHeroX = [-130, -45, 45, 130];
      const mobHeroY = [35, 20, 30, 45];
      const Ax = mobHeroX[i];
      const Ay = mobHeroY[i];
      const Arot = heroRot[i];

      const Bx = c * 3;
      const By = c * 2;
      const Brot = c * 2;
      const Bsc = 0.68;

      let x, y, rot, sc, cardOpacity = 1;
      if (progress < 0.40) {
        const t = progress / 0.40;
        x = lerp(Ax, Bx, t);
        y = lerp(Ay, By, t);
        rot = lerp(Arot, Brot, t);
        sc = lerp(0.75, Bsc, t);
        cardOpacity = 1;
      } else if (progress < 0.75) {
        const t = (progress - 0.40) / 0.35;
        x = Bx;
        y = By + lerp(0, 18, t);
        rot = Brot;
        sc = lerp(Bsc, Bsc * 0.7, t);
        cardOpacity = lerp(1, 0, t);
      } else {
        x = Bx;
        y = By + 18;
        rot = Brot;
        sc = Bsc * 0.7;
        cardOpacity = 0;
      }

      card.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${sc})`;
      card.style.opacity = cardOpacity;
      card.style.pointerEvents = cardOpacity < 0.1 ? 'none' : 'auto';
    } else {
      // EN DESKTOP (Inalterado):
      card.style.opacity = 1;
      card.style.pointerEvents = 'auto';

      const Ax = heroX[i];
      const Ay = heroY[i];
      const Arot = heroRot[i];
      const Asc = 1;

      // Estado B: se agrupan en el centro
      const Bx = c * 4;
      const By = c * 3;
      const Brot = c * 2.4;
      const Bsc = 0.8;

      // Estado C: se abren a la derecha de forma asimétrica y esparcida
      const Cx = somosX[i];
      const Cy = somosY[i];
      const Crot = somosRot[i];
      const Csc = somosScale[i];

      let x, y, rot, sc;
      if (progress < 0.45) {
        const t = progress / 0.45;
        x = lerp(Ax, Bx, t);
        y = lerp(Ay, By, t);
        rot = lerp(Arot, Brot, t);
        sc = lerp(Asc, Bsc, t);
      } else {
        const t = (progress - 0.45) / 0.55;
        x = lerp(Bx, Cx, t);
        y = lerp(By, Cy, t);
        rot = lerp(Brot, Crot, t);
        sc = lerp(Bsc, Csc, t);
      }
      card.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${sc})`;
    }
  });

  const heroFade = Math.min(1, progress / 0.28);
  heroText.style.opacity = 1 - heroFade;
  heroText.style.transform = `translate(-50%, ${lerp(0, -30, heroFade)}px)`;
  heroText.style.pointerEvents = heroFade > 0.95 ? 'none' : 'auto';

  let somosFade = progress > 0.45 ? Math.min(1, (progress - 0.45) / 0.35) : 0;
  somosText.style.opacity = somosFade;
  if (isMobile) {
    somosText.style.transform = `translate(-50%, calc(-50% + ${lerp(24, 0, somosFade)}px))`;
  } else {
    somosText.style.transform = `translateY(calc(-50% + ${lerp(24, 0, somosFade)}px))`;
  }
  somosText.style.pointerEvents = somosFade > 0.5 ? 'auto' : 'none';

  const badges = document.querySelectorAll('.float-badge');
  badges.forEach(b => { b.style.opacity = 1 - heroFade; });

  const scrollHint = document.getElementById('mobileScrollHint');
  if (scrollHint) {
    scrollHint.style.opacity = 1 - heroFade;
  }
}

function onScroll() {
  if (!ticking) { requestAnimationFrame(update); ticking = true; }
}
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
update();

// ---- Mobile Menu Toggle ----
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');

if (mobileMenuBtn && navLinks) {
  mobileMenuBtn.addEventListener('click', () => {
    mobileMenuBtn.classList.toggle('active');
    navLinks.classList.toggle('active');
    document.body.classList.toggle('menu-open');
  });

  // Close menu when clicking any nav link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenuBtn.classList.remove('active');
      navLinks.classList.remove('active');
      document.body.classList.remove('menu-open');
    });
  });
}

// Toggle flipped class on mobile tap for interactive cards
document.querySelectorAll('.service-card-container').forEach(card => {
  card.addEventListener('click', function (e) {
    if (window.innerWidth <= 820) {
      // If clicking the CTA or a link, don't toggle flip
      if (e.target.closest('.back-cta-pill') || e.target.closest('a')) {
        return;
      }
      this.classList.toggle('flipped');
    }
  });
});

// ---- PORTFOLIO CASE STUDY DETAILS MODAL ----
const caseStudiesData = {
  foro: {
    category: "DANE Y NACIONES UNIDAS",
    title: "Foro Mundial de Datos",
    images: [
      "Foto de dato/FOTO TODOS FORO .jpg.jpeg",
      "Foto de dato/19.png",
      "Foto de dato/4.2.png",
      "Foto de dato/7.2.png",
      "Foto de dato/DSC_4697.JPG.jpeg",
      "Foto de dato/_DSC1365.JPG.jpeg"
    ],
    brief: `
      <h4>Sobre el Proyecto</h4>
      <p>JR Marketing estuvo a cargo de la <strong>producción integral del Foro Mundial de Datos de las Naciones Unidas</strong>, realizado por primera vez en Latinoamérica, en Medellín.</p>
      <hr>
      <h4>Nuestra Gestión & Impacto</h4>
      <p>Creamos y ejecutamos una experiencia de alto impacto que conectó a más de <strong>3.500 participantes de 120 países</strong> alrededor de la innovación, la tecnología y el desarrollo sostenible.</p>
      <hr>
      <h4>Escala del Evento</h4>
      <ul>
        <li>Evento de talla mundial para más de <strong>3.500 personas</strong>.</li>
        <li>Más de <strong>120 países y 100 nacionalidades</strong> representadas.</li>
        <li>Conexión entre líderes gubernamentales, multilaterales, empresas y academia.</li>
      </ul>
      <hr>
      <p><strong>📍 Ubicación:</strong> Medellín, Colombia</p>
    `
  },
  rueda: {
    category: "EVENTO / FESTIVAL",
    title: "Rueda Eléctrica Fest",
    images: [
      "RUEDAFEST/1 (1).jpg.jpeg",
      "RUEDAFEST/DSC04016.jpg.jpeg",
      "RUEDAFEST/DSC04152.jpg.jpeg",
      "RUEDAFEST/DSC04257.jpg.jpeg",
      "RUEDAFEST/DSC05032.jpg.jpeg"
    ],
    brief: `
      <h4>Sobre el Proyecto</h4>
      <p>Desarrollamos el <strong>primer festival de movilidad eléctrica de Colombia</strong>, realizado en el Centro Comercial Unicentro. El evento reunió a más de 20 marcas líderes del sector para impulsar la innovación y la sostenibilidad.</p>
      <hr>
      <h4>La Experiencia</h4>
      <ul>
        <li>Showroom de exhibición y ventas con más de 20 marcas.</li>
        <li>Videopodcast con invitados y expertos para generar contenido de valor.</li>
        <li>Entretenimiento de alto impacto con 5 artistas reconocidos.</li>
      </ul>
      <hr>
      <p><strong>📍 Ubicación:</strong> Bogotá, Colombia</p>
    `
  },
  fiesta: {
    category: "JUMBO / CENCOSUD",
    title: "Noches de Fiesta",
    images: [
      "Noche de fiesta/PHOTO-2026-03-14-15-31-00.jpg.jpeg",
      "Noche de fiesta/PHOTO-2026-06-13-10-55-59.jpg.jpeg",
      "Noche de fiesta/PHOTO-2026-06-13-18-01-42.jpg.jpeg",
      "Noche de fiesta/PHOTO-2026-06-13-18-09-59.jpg.jpeg",
      "Noche de fiesta/PHOTO-2026-06-13-18-28-29.jpg.jpeg"
    ],
    brief: `
      <h4>Sobre el Proyecto</h4>
      <p>JR Marketing ha llevado <strong>Noches de Fiesta</strong> a más de <strong>26 puntos de venta en 13 ciudades</strong> del país.</p>
      <hr>
      <h4>La Experiencia</h4>
      <p>Una experiencia de marca que integra música, producción técnica, animación, entretenimiento y entrega de premios para conectar al público con Jumbo y sus marcas patrocinadoras de una manera cercana, dinámica y memorable.</p>
      <hr>
      <h4>Impacto Nacional</h4>
      <ul>
        <li>Cobertura en <strong>26 puntos de venta</strong> y <strong>13 ciudades</strong>.</li>
        <li>Activaciones BTL masivas con alta participación y premiación.</li>
      </ul>
    `
  },
  ccl: {
    category: "CCL",
    title: "Inauguración Clúster más grande de LATAM",
    images: [
      "CCL/IMG_2568.jpeg",
      "CCL/IMG_2565.jpeg",
      "CCL/IMG_2569.jpeg",
      "CCL/IMG_2573.jpeg",
      "CCL/IMG_2574.jpeg",
      "CCL/IMG_2576.jpeg",
      "CCL/IMG_2578.jpeg",
      "CCL/IMG_2582.jpeg",
      "CCL/IMG_2583.jpeg",
      "CCL/IMG_2592.jpeg"
    ],
    brief: `
      <h4>Sobre el Proyecto</h4>
      <p>JR Marketing conceptualizó y produjo el panel <strong>“Colaboración Digital en Logística”</strong> para CCL, creando una experiencia corporativa innovadora y memorable.</p>
      <hr>
      <h4>Nuestra Gestión</h4>
      <p>El evento reunió a líderes de la industria e integró contenidos, tecnología y elementos disruptivos para fortalecer el posicionamiento de CCL como referente en transformación digital del sector logístico.</p>
      <hr>
      <h4>Prensa & Medios</h4>
      <p><strong>Noticia destacada por P&M:</strong><br>
      <a href="https://www.revistapym.com.co/articulos/comunicacion/70040/ccl-y-jr-marketing-se-unen-para-crear-el-panel-de-colaboracion-digital-en-logistica" target="_blank" rel="noopener noreferrer" style="color: var(--pink); text-decoration: underline; font-weight: 600;">Ver artículo en Revista P&M →</a></p>
    `
  },
  simetrik: {
    category: "SIMETRIK",
    title: "Perpetual Evolution Fest",
    images: [
      "SIMETRIK/IMG_6764.jpeg",
      "SIMETRIK/714BD73F-FE47-412C-9FF3-6DFBD9A2A5F3.JPG",
      "SIMETRIK/IMG_6752.jpeg",
      "SIMETRIK/IMG_6767.jpeg",
      "SIMETRIK/IMG_6769.jpeg",
      "SIMETRIK/fc82f6ad-e8e3-4924-8ca5-c51dd3263c93.JPG"
    ],
    brief: `
      <h4>Sobre el Proyecto</h4>
      <p>JR Marketing produjo el <strong>Perpetual Evolution Fest de Simetrik</strong>, una experiencia corporativa de dos días realizada en Ágora Bogotá, que reunió a más de <strong>500 asistentes de diferentes países</strong>.</p>
      <hr>
      <h4>Nuestra Gestión</h4>
      <p>El evento integró conferencistas de talla mundial, innovación, inteligencia artificial y espacios de conexión para fortalecer la cultura organizacional y proyectar el futuro de la compañía.</p>
      <hr>
      <h4>Cifras Clave</h4>
      <ul>
        <li><strong>+500 asistentes internacionales</strong>.</li>
        <li>2 días de convención en <strong>Ágora Bogotá</strong>.</li>
        <li>Conferencistas internacionales y tecnología IA.</li>
      </ul>
    `
  },
  softserve: {
    category: "SOFTSERVE",
    title: "Town Hall & Company Day",
    images: [
      "TOWN HALL/471642095_559399136961674_5284572861736434843_n.jpg",
      "TOWN HALL/471401031_559399186961669_6387094944194735593_n.jpg",
      "TOWN HALL/471433718_559399256961662_2293639095918517422_n.jpg",
      "TOWN HALL/471504426_559398953628359_7586353331792064145_n.jpg",
      "TOWN HALL/471514310_559398936961694_8380176975290733366_n.jpg",
      "TOWN HALL/471606443_559399250294996_4107268685845011409_n.jpg",
      "TOWN HALL/471615434_559398960295025_5948903597505571585_n.jpg",
      "TOWN HALL/471667686_559399273628327_8953339903235252400_n.jpg",
      "TOWN HALL/471773145_560400836861504_8410839998588403820_n.jpg",
      "TOWN HALL/471839225_559398940295027_99955726532970576_n.jpg",
      "TOWN HALL/471857295_559399016961686_7769462760660103805_n.jpg"
    ],
    brief: `
      <h4>Sobre el Proyecto</h4>
      <p>JR Marketing produjo los <strong>Town Halls y Company Day de SoftServe</strong> bajo un formato híbrido, conectando de manera simultánea a colaboradores y líderes ubicados en distintos países.</p>
      <hr>
      <h4>La Experiencia</h4>
      <p>La experiencia integró producción audiovisual de alta definición, transmisión en vivo, contenidos corporativos estratégicos y herramientas interactivas para fomentar la participación, fortalecer la cultura organizacional y mantener alineados a sus equipos a nivel global.</p>
    `
  },
  castrol: {
    category: "CASTROL",
    title: "Estrategia & Producción Audiovisual RRSS",
    images: [
      "CASTROL/IMG_6825.jpeg",
      "CASTROL/IMG_6866.jpeg",
      "CASTROL/IMG_6875.jpeg",
      "CASTROL/IMG_6881.jpeg",
      "CASTROL/IMG_7458.jpeg",
      "CASTROL/IMG_7459.jpeg",
      "CASTROL/IMG_7480.jpeg"
    ],
    brief: `
      <h4>Sobre el Proyecto</h4>
      <p>JR Marketing estuvo a cargo de la <strong>estrategia, administración y producción audiovisual</strong> de las redes sociales de Castrol Colombia.</p>
      <hr>
      <h4>Nuestra Gestión</h4>
      <p>A través de una gestión integral en Facebook e Instagram, fortalecimos la presencia digital de la marca y consolidamos una comunidad de más de <strong>20.500 seguidores</strong>, altamente conectada con el mundo automotor.</p>
      <hr>
      <h4>Resultados</h4>
      <ul>
        <li>Gestión estratégica integral en Facebook e Instagram.</li>
        <li>Comunidad consolidada de <strong>+20.500 seguidores activos</strong>.</li>
        <li>Contenido audiovisual especializado de alto engagement.</li>
      </ul>
    `
  }
};

// Modal state elements
const modal = document.getElementById('caseModal');
const modalSlider = document.getElementById('modalSlider');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const galleryPrevBtn = document.getElementById('galleryPrevBtn');
const galleryNextBtn = document.getElementById('galleryNextBtn');
const galleryDotsContainer = document.getElementById('galleryDots');
const briefCategory = document.getElementById('briefCategory');
const briefTitle = document.getElementById('briefTitle');
const briefBody = document.getElementById('briefBody');

let currentSlideIdx = 0;
let totalSlides = 0;

// Update the slider position and active dots
function showSlide(index) {
  if (totalSlides === 0) return;
  currentSlideIdx = (index + totalSlides) % totalSlides;
  modalSlider.style.transform = `translateX(-${currentSlideIdx * 100}%)`;

  // Update active dot
  const dots = galleryDotsContainer.querySelectorAll('.gallery-dot');
  dots.forEach((dot, idx) => {
    dot.classList.toggle('active', idx === currentSlideIdx);
  });
}

// Open modal function
function openCaseModal(caseId) {
  const data = caseStudiesData[caseId];
  if (!data) return;

  // Set text contents
  briefCategory.textContent = data.category;
  briefTitle.textContent = data.title;
  briefBody.innerHTML = data.brief;

  // Clear previous gallery contents
  modalSlider.innerHTML = '';
  galleryDotsContainer.innerHTML = '';

  // Load new images and build slide elements
  totalSlides = data.images.length;
  currentSlideIdx = 0;

  data.images.forEach((imgSrc, idx) => {
    // Build slide div
    const slide = document.createElement('div');
    slide.className = 'gallery-slide';

    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = `${data.title} Slide ${idx + 1}`;
    slide.appendChild(img);
    modalSlider.appendChild(slide);

    // Build indicator dot
    const dot = document.createElement('button');
    dot.className = `gallery-dot ${idx === 0 ? 'active' : ''}`;
    dot.ariaLabel = `Ir a foto ${idx + 1}`;
    dot.addEventListener('click', () => showSlide(idx));
    galleryDotsContainer.appendChild(dot);
  });

  // Reset transform position
  modalSlider.style.transform = 'translateX(0)';

  // Display modal
  modal.classList.add('active');
  document.body.classList.add('modal-open');
}

// Close modal function
function closeCaseModal() {
  modal.classList.remove('active');
  document.body.classList.remove('modal-open');
}

// ---- Attach click handlers directly to each case card ----
document.querySelectorAll('.case-card[data-case]').forEach(function (card) {
  card.style.cursor = 'pointer';
  card.addEventListener('click', function (e) {
    // If it's the Ver Caso anchor, prevent default scroll-to-top
    e.preventDefault();
    openCaseModal(card.getAttribute('data-case'));
  });
});

// Close button
document.getElementById('modalCloseBtn').addEventListener('click', function (e) {
  e.preventDefault();
  closeCaseModal();
});

// Prev / Next slide buttons
document.getElementById('galleryPrevBtn').addEventListener('click', function (e) {
  e.preventDefault();
  showSlide(currentSlideIdx - 1);
});
document.getElementById('galleryNextBtn').addEventListener('click', function (e) {
  e.preventDefault();
  showSlide(currentSlideIdx + 1);
});

// Click on the dark backdrop (the modal overlay itself, not the content box)
modal.addEventListener('click', function (e) {
  if (e.target === modal) {
    closeCaseModal();
  }
});

// ESC key
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && modal.classList.contains('active')) {
    closeCaseModal();
  }
});

// ---- Corporate Video Overlay & Playback Handler ----
const jrVideo = document.getElementById('jrVideo');
const videoOverlay = document.getElementById('videoOverlay');

if (jrVideo && videoOverlay) {
  videoOverlay.addEventListener('click', function () {
    jrVideo.play();
    videoOverlay.classList.add('is-playing');
  });

  jrVideo.addEventListener('pause', function () {
    if (!jrVideo.seeking && jrVideo.currentTime < jrVideo.duration) {
      videoOverlay.classList.remove('is-playing');
    }
  });

  jrVideo.addEventListener('ended', function () {
    videoOverlay.classList.remove('is-playing');
  });

  jrVideo.addEventListener('play', function () {
    videoOverlay.classList.add('is-playing');
  });
}

// ---- Contact Form AJAX Submission (FormSubmit to jose.rey@jrmarketing.co) ----
const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const formStatusMsg = document.getElementById('formStatusMsg');

if (contactForm) {
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerText = 'Enviando...';
    }

    if (formStatusMsg) {
      formStatusMsg.style.display = 'none';
      formStatusMsg.className = 'form-status-msg';
    }

    const formData = new FormData(contactForm);

    fetch('https://formsubmit.co/ajax/jose.rey@jrmarketing.co', {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    })
      .then(response => response.json())
      .then(data => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = 'Enviar Mensaje';
        }
        if (formStatusMsg) {
          formStatusMsg.classList.add('form-status-success');
          formStatusMsg.innerText = '¡Mensaje enviado con éxito! Te responderemos a la brevedad en menos de 24 horas.';
          formStatusMsg.style.display = 'block';
        }
        contactForm.reset();
      })
      .catch(error => {
        console.error('Error al enviar formulario:', error);
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = 'Enviar Mensaje';
        }
        // Fallback: submit standard form if AJAX fails
        contactForm.submit();
      });
  });
}

// ---- Expandable Projects Toggle ----
const toggleMoreProjectsBtn = document.getElementById('toggleMoreProjectsBtn');
const moreCasesWrapper = document.getElementById('moreCasesWrapper');

if (toggleMoreProjectsBtn && moreCasesWrapper) {
  toggleMoreProjectsBtn.addEventListener('click', function () {
    const isExpanded = moreCasesWrapper.style.display !== 'none';
    if (isExpanded) {
      moreCasesWrapper.style.display = 'none';
      toggleMoreProjectsBtn.setAttribute('aria-expanded', 'false');
      toggleMoreProjectsBtn.classList.remove('is-active');
      toggleMoreProjectsBtn.querySelector('span').innerText = 'Conoce más proyectos';
    } else {
      moreCasesWrapper.style.display = 'block';
      toggleMoreProjectsBtn.setAttribute('aria-expanded', 'true');
      toggleMoreProjectsBtn.classList.add('is-active');
      toggleMoreProjectsBtn.querySelector('span').innerText = 'Ver menos proyectos';
    }
  });
}

// ---- Footer Accordions on Mobile ----
document.querySelectorAll('.accordion-header').forEach(header => {
  header.addEventListener('click', function () {
    if (window.innerWidth <= 768) {
      const parentCol = this.closest('.accordion-col');
      if (parentCol) {
        parentCol.classList.toggle('is-open');
      }
    }
  });
});


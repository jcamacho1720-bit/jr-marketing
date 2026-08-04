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
const heroY = [135, 115, 140, 155];

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
      const mobHeroY = [70, 55, 65, 80];
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
  card.addEventListener('click', function(e) {
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
    category: "FERIA / CONGRESO",
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
      <p>Este evento de carácter internacional reunió a líderes gubernamentales, organizaciones multilaterales, empresas, academia y expertos de diferentes países para debatir el papel de los datos en la construcción de políticas públicas, el desarrollo sostenible y la innovación.</p>
      <hr>
      <h4>Nuestra Gestión</h4>
      <p>Nuestra gestión abarcó la <strong>producción integral del evento</strong>, coordinando la experiencia de asistentes, conferencistas y aliados estratégicos, garantizando una ejecución impecable bajo estándares internacionales y consolidando un espacio de alto impacto para el intercambio de conocimiento y la cooperación global.</p>
      <hr>
      <h4>Escala del Evento</h4>
      <ul>
        <li>Evento de talla mundial para más de <strong>3.500 personas</strong>.</li>
        <li>Más de <strong>100 nacionalidades</strong> presentes.</li>
        <li>Líderes gubernamentales, multilaterales, empresas y academia.</li>
      </ul>
      <hr>
      <p><strong>📅 Fecha:</strong> 12 al 15 de noviembre de 2024</p>
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
      <p>Desarrollamos el <strong>primer festival de movilidad eléctrica de Colombia</strong>, realizado en el Centro Comercial Unicentro. El evento reunió a más de 20 marcas líderes del sector en un espacio diseñado para impulsar la innovación, la sostenibilidad y la generación de oportunidades comerciales.</p>
      <hr>
      <h4>La Experiencia</h4>
      <p>La experiencia integró:</p>
      <ul>
        <li>Un <strong>showroom de exhibición y ventas</strong> con más de 20 marcas del sector.</li>
        <li>Un <strong>videopodcast</strong> con invitados y expertos para generar contenido de valor.</li>
        <li>Entretenimiento de alto impacto con <strong>5 artistas reconocidos</strong> de la escena musical.</li>
      </ul>
      <hr>
      <p>El festival logró atraer público masivo, fortalecer el posicionamiento de las marcas participantes y generar una experiencia memorable para los asistentes.</p>
      <hr>
      <p><strong>📅 Fecha:</strong> 7 al 10 de mayo de 2026</p>
    `
  },
  fiesta: {
    category: "ACTIVACIÓN BTL",
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
      <p>Aliados estratégicos de <strong>Jumbo Cencosud</strong> durante más de un año para el desarrollo de <em>"Noches de Fiesta"</em>, una de las campañas experienciales más representativas de la marca a nivel nacional.</p>
      <hr>
      <h4>La Experiencia</h4>
      <p>Diseñamos y operamos una <strong>experiencia inmersiva</strong> que convierte cada tienda en un escenario de celebración, combinando:</p>
      <ul>
        <li>Música en vivo con DJ y producción técnica de sonido e iluminación.</li>
        <li>Dinámicas de participación y entrega de premios.</li>
        <li>Incentivos de interacción para aumentar el tráfico en tienda.</li>
      </ul>
      <hr>
      <h4>Escala Nacional</h4>
      <ul>
        <li><strong>26 puntos de venta</strong> en más de <strong>13 ciudades</strong> del país.</li>
        <li>Activaciones con altos estándares de calidad y consistencia operativa.</li>
        <li>Conexión emocional profunda entre Jumbo y sus clientes.</li>
      </ul>
      <hr>
      <p><strong>📅 Fecha:</strong> 2025 / 2026</p>
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
document.querySelectorAll('.case-card[data-case]').forEach(function(card) {
  card.style.cursor = 'pointer';
  card.addEventListener('click', function(e) {
    // If it's the Ver Caso anchor, prevent default scroll-to-top
    e.preventDefault();
    openCaseModal(card.getAttribute('data-case'));
  });
});

// Close button
document.getElementById('modalCloseBtn').addEventListener('click', function(e) {
  e.preventDefault();
  closeCaseModal();
});

// Prev / Next slide buttons
document.getElementById('galleryPrevBtn').addEventListener('click', function(e) {
  e.preventDefault();
  showSlide(currentSlideIdx - 1);
});
document.getElementById('galleryNextBtn').addEventListener('click', function(e) {
  e.preventDefault();
  showSlide(currentSlideIdx + 1);
});

// Click on the dark backdrop (the modal overlay itself, not the content box)
modal.addEventListener('click', function(e) {
  if (e.target === modal) {
    closeCaseModal();
  }
});

// ESC key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && modal.classList.contains('active')) {
    closeCaseModal();
  }
});


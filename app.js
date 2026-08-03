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
  const isMobile = stageWidth < 760;
  const respFactor = isMobile ? 0.45 : 1;
  const rightOffset = isMobile ? 0 : stageWidth * 0.26;

  cards.forEach((card, i) => {
    const c = i - mid;

    const Ax = heroX[i] * respFactor;
    const Ay = heroY[i] * respFactor;
    const Arot = heroRot[i];
    const Asc = 1;

    // Estado B: se agrupan en el centro
    const Bx = c * 4;
    const By = c * 3;
    const Brot = c * 2.4;
    const Bsc = 0.8;

    // Estado C: se abren a la derecha de forma asimétrica y esparcida
    const Cx = isMobile ? c * 8 : somosX[i] * respFactor;
    const Cy = isMobile ? 80 + c * 35 : somosY[i] * respFactor;
    const Crot = isMobile ? c * 4 : somosRot[i];
    const Csc = isMobile ? 0.42 : somosScale[i] * respFactor;

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
  });

  const heroFade = Math.min(1, progress / 0.28);
  heroText.style.opacity = 1 - heroFade;
  heroText.style.transform = `translate(-50%, ${lerp(0, -30, heroFade)}px)`;
  heroText.style.pointerEvents = heroFade > 0.95 ? 'none' : 'auto';

  let somosFade = progress > 0.55 ? Math.min(1, (progress - 0.55) / 0.3) : 0;
  somosText.style.opacity = somosFade;
  somosText.style.transform = `translateY(calc(-50% + ${lerp(24, 0, somosFade)}px))`;
  somosText.style.pointerEvents = somosFade > 0.5 ? 'auto' : 'none';

  const badges = document.querySelectorAll('.float-badge');
  badges.forEach(b => { b.style.opacity = 1 - heroFade; });
}

function onScroll() {
  if (!ticking) { requestAnimationFrame(update); ticking = true; }
}
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
update();

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
    category: "EXPERIENCIA / PRODUCCIÓN",
    title: "Foro Mundial de Datos",
    images: [
      "assets/evento-refest.png",
      "assets/stand-promocional.png",
      "assets/equipo-somos.png"
    ],
    brief: `
      <h4>El Desafío</h4>
      <p>Diseñar y producir de manera integral la infraestructura, escenografía y dinámicas de interacción para el evento sobre estadísticas y datos más prestigioso de América Latina, reuniendo a más de 1,500 delegados internacionales.</p>
      <hr>
      <h4>Nuestra Estrategia</h4>
      <p>Creamos un ecosistema espacial modular de bajo impacto ambiental utilizando materiales sostenibles. Diseñamos salones de conferencias híbridos con streaming en tiempo real y áreas de networking interactivo con pantallas dinámicas de visualización de datos.</p>
      <hr>
      <h4>Los Resultados</h4>
      <ul>
        <li>Asistencia récord de representantes de más de 45 países.</li>
        <li>100% de la producción escenográfica reciclada pos-evento.</li>
        <li>Transmisión en vivo sin interrupciones con más de 20,000 espectadores únicos.</li>
      </ul>
    `
  },
  rueda: {
    category: "CREATIVIDAD / ACTIVACIÓN",
    title: "Rueda Electrica Fest",
    images: [
      "assets/stand-promocional.png",
      "assets/evento-refest.png",
      "assets/equipo-somos.png"
    ],
    brief: `
      <h4>El Desafío</h4>
      <p>Crear y ejecutar el primer festival masivo al aire libre dedicado a la movilidad eléctrica y sostenible en Colombia, logrando captar el interés de marcas automotrices líderes y el público general.</p>
      <hr>
      <h4>Nuestra Estrategia</h4>
      <p>Conceptualizamos un circuito interactivo de pruebas ("Test Drive") en el corazón del festival. Desarrollamos stands promocionales interactivos con tecnología de realidad aumentada y paneles de discusión académica dirigidos por líderes de opinión del sector.</p>
      <hr>
      <h4>Los Resultados</h4>
      <ul>
        <li>Más de 5,000 asistentes activos durante el fin de semana.</li>
        <li>Participación directa de 18 marcas automotrices y de micro-movilidad.</li>
        <li>Más de 1,200 pruebas de vehículos eléctricos completadas en tiempo real.</li>
      </ul>
    `
  },
  fiesta: {
    category: "MARKETING EXPERIENCIAL",
    title: "Noches de Fiesta",
    images: [
      "assets/noches_de_fiesta_case.png",
      "assets/evento-refest.png",
      "assets/stand-promocional.png"
    ],
    brief: `
      <h4>El Desafío</h4>
      <p>Desarrollar una campaña experiencial nocturna y juvenil de alta recordación para posicionar marcas de bebidas premium en los principales centros urbanos del país.</p>
      <hr>
      <h4>Nuestra Estrategia</h4>
      <p>Creamos activaciones in-situ con cabinas fotográficas inmersivas, DJs en vivo, retos lúdicos digitales y recompensas personalizadas en barras luminosas LED de alta interacción.</p>
      <hr>
      <h4>Los Resultados</h4>
      <ul>
        <li>Activaciones exitosas en más de 24 clubes de 4 ciudades principales.</li>
        <li>Incremento del 32% en ventas directas de producto durante las noches del tour.</li>
        <li>Alcance orgánico en redes sociales superior a las 150,000 interacciones mensuales.</li>
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

// Add click event listeners via delegation
document.addEventListener('click', function(e) {
  // 1. Click on Case Card
  const card = e.target.closest('.case-card');
  if (card) {
    e.preventDefault();
    const caseId = card.getAttribute('data-case');
    if (caseId) {
      openCaseModal(caseId);
    }
    return;
  }

  // 2. Click on Close Button
  if (e.target.closest('#modalCloseBtn')) {
    e.preventDefault();
    closeCaseModal();
    return;
  }

  // 3. Click on Gallery Prev Button
  if (e.target.closest('#galleryPrevBtn')) {
    e.preventDefault();
    showSlide(currentSlideIdx - 1);
    return;
  }

  // 4. Click on Gallery Next Button
  if (e.target.closest('#galleryNextBtn')) {
    e.preventDefault();
    showSlide(currentSlideIdx + 1);
    return;
  }

  // 5. Click on Backdrop (outside the modal box content)
  if (e.target === modal) {
    closeCaseModal();
  }
});

// ESC key to close modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('active')) {
    closeCaseModal();
  }
});


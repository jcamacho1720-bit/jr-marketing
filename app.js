// trusted logos placeholders (duplicated for seamless marquee)
const brands = ["NORTE°", "ORBITA CO", "MUNDIAL", "ALTO RELIEVE", "TERRAL", "VÍA LIBRE", "CASETA", "PUNTO CIEGO"];
const track = document.getElementById('marqueeTrack');
[...brands, ...brands].forEach(b => {
  const el = document.createElement('div');
  el.className = 'brandmark';
  el.textContent = b;
  track.appendChild(el);
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

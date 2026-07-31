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

const heroRot = [-22, -13, -4, 4, 13, 22];
const heroX = [-250, -152, -52, 52, 152, 250];
const heroY = [16, -6, -14, -14, -6, 16];

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
  const respFactor = isMobile ? 0.5 : 1;
  const rightOffset = isMobile ? 0 : stageWidth * 0.27;

  cards.forEach((card, i) => {
    const c = i - mid;

    const Ax = heroX[i] * respFactor, Ay = heroY[i] * respFactor, Arot = heroRot[i], Asc = 1;
    const Bx = c * 4, By = c * 3, Brot = c * 2.4, Bsc = 0.8;
    const Cx = isMobile ? c * 10 : rightOffset + c * 26;
    const Cy = isMobile ? 60 + c * 4 : c * 34;
    const Crot = c * 4, Csc = isMobile ? 0.42 : 0.6;

    let x, y, rot, sc;
    if (progress < 0.45) {
      const t = progress / 0.45;
      x = lerp(Ax, Bx, t); y = lerp(Ay, By, t); rot = lerp(Arot, Brot, t); sc = lerp(Asc, Bsc, t);
    } else {
      const t = (progress - 0.45) / 0.55;
      x = lerp(Bx, Cx, t); y = lerp(By, Cy, t); rot = lerp(Brot, Crot, t); sc = lerp(Bsc, Csc, t);
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

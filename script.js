/* ===== Galaxia para Meyly — script.js ===== */

// ⚙️ CONFIGURACIÓN: pon aquí la fecha en que empezaron, formato "AAAA-MM-DDTHH:MM:SS".
// Ejemplo: "2025-02-14T00:00:00". Mientras sea null, el contador mostrará un aviso.
const START_DATE = null;

const $ = (id) => document.getElementById(id);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- 1. Fondo: estrellas, partículas y estrellas fugaces ---------- */
const cv = $('galaxia'), cx = cv.getContext('2d');
let W, H, stars = [], motes = [], shoots = [];
function resizeBg() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  W = innerWidth; H = innerHeight;
  cv.width = W * dpr; cv.height = H * dpr;
  cx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const n = Math.min(900, Math.floor(W * H / 1800)); // miles en pantallas grandes, ligero en celulares
  stars = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H,
    r: Math.random() * 1.3 + .2, p: Math.random() * 6.28, v: Math.random() * .03 + .005 }));
  motes = Array.from({ length: 40 }, () => ({ x: Math.random() * W, y: Math.random() * H,
    r: Math.random() * 2 + 1, dx: (Math.random() - .5) * .25, dy: -Math.random() * .3 - .05,
    c: Math.random() < .5 ? '255,95,168' : '170,130,255' }));
}
function drawBg(t) {
  cx.clearRect(0, 0, W, H);
  for (const s of stars) {
    cx.globalAlpha = .35 + .65 * Math.abs(Math.sin(s.p + t * s.v));
    cx.fillStyle = '#fff'; cx.fillRect(s.x, s.y, s.r, s.r);
  }
  for (const m of motes) {
    m.x += m.dx; m.y += m.dy;
    if (m.y < -5) { m.y = H + 5; m.x = Math.random() * W; }
    cx.globalAlpha = .6; cx.shadowBlur = 10; cx.shadowColor = `rgb(${m.c})`;
    cx.fillStyle = `rgb(${m.c})`; cx.beginPath(); cx.arc(m.x, m.y, m.r, 0, 6.28); cx.fill();
  }
  cx.shadowBlur = 0;
  for (let i = shoots.length - 1; i >= 0; i--) {
    const s = shoots[i]; s.x += s.vx; s.y += s.vy; s.l--;
    const g = cx.createLinearGradient(s.x, s.y, s.x - s.vx * 12, s.y - s.vy * 12);
    g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(1, 'rgba(255,95,168,0)');
    cx.globalAlpha = 1; cx.strokeStyle = g; cx.lineWidth = 2;
    cx.beginPath(); cx.moveTo(s.x, s.y); cx.lineTo(s.x - s.vx * 12, s.y - s.vy * 12); cx.stroke();
    if (s.l <= 0) shoots.splice(i, 1);
  }
  cx.globalAlpha = 1;
  requestAnimationFrame(drawBg);
}
function shoot() { // estrella fugaz ocasional
  shoots.push({ x: Math.random() * W * .8, y: Math.random() * H * .4, vx: 9, vy: 4.5, l: 45 });
  setTimeout(shoot, 5000 + Math.random() * 7000);
}
addEventListener('resize', resizeBg); resizeBg();
if (!reduce) { requestAnimationFrame(drawBg); setTimeout(shoot, 3000); }

/* ---------- Corazones flotantes (decorativos de fondo) ---------- */
function floatHeart() {
  const h = document.createElement('span');
  h.className = 'flota'; h.textContent = ['💗', '💖', '💜', '❤️'][Math.random() * 4 | 0];
  h.style.cssText = `left:${Math.random() * 100}%;font-size:${14 + Math.random() * 22}px;` +
    `animation-duration:${9 + Math.random() * 8}s;--dx:${(Math.random() - .5) * 120}px;opacity:.75`;
  $('corazones-flotantes').appendChild(h);
  setTimeout(() => h.remove(), 18000);
}
if (!reduce) setInterval(floatHeart, 1600);

/* ---------- Corazón formado por estrellas (latiendo) ---------- */
function heartField(canvas, count) {
  const pts = Array.from({ length: count }, () => { // puntos dentro de la curva del corazón
    const a = Math.random() * 6.28, k = Math.sqrt(Math.random()) ;
    return { x: 16 * Math.pow(Math.sin(a), 3) * k,
      y: -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) * k,
      p: Math.random() * 6.28, r: Math.random() * 1.6 + .4 };
  });
  const c = canvas.getContext('2d');
  let on = false;
  function frame(t) {
    if (!on) return;
    const dpr = Math.min(devicePixelRatio || 1, 2), w = canvas.clientWidth, h = canvas.clientHeight;
    if (canvas.width !== w * dpr) { canvas.width = w * dpr; canvas.height = h * dpr; }
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, w, h);
    const beat = 1 + .06 * Math.pow(Math.sin(t / 380), 2) * (Math.sin(t / 190) > 0 ? 1 : .5);
    const sc = w / 38 * beat;
    for (const p of pts) {
      c.globalAlpha = .4 + .6 * Math.abs(Math.sin(p.p + t / 700));
      c.fillStyle = p.r > 1.3 ? '#ffc2df' : '#ff5fa8';
      c.shadowBlur = 8; c.shadowColor = '#ff5fa8';
      c.beginPath(); c.arc(w / 2 + p.x * sc, h / 2 + p.y * sc + w * .03, p.r, 0, 6.28); c.fill();
    }
    requestAnimationFrame(frame);
  }
  return { start() { if (!on) { on = true; requestAnimationFrame(frame); } }, stop() { on = false; } };
}
const heartMain = heartField($('corazon-estrellas'), 1400);
const heartGift = heartField($('corazon-sorpresa'), 3200);

/* ---------- Música ---------- */
const audio = $('audio'), ondas = $('ondas'), bPlay = $('btn-play'), bFlot = $('btn-flotante');
function syncMusic() {
  const playing = !audio.paused;
  bPlay.textContent = playing ? '⏸' : '▶';
  ondas.classList.toggle('on', playing); bFlot.classList.toggle('on', playing);
}
function toggleMusic() {
  if (audio.paused) audio.play().catch(() => alert('No se encontró assets/te-amo-tanto.mp3. Coloca ahí tu archivo MP3.'));
  else audio.pause();
}
audio.addEventListener('play', syncMusic); audio.addEventListener('pause', syncMusic);
bPlay.onclick = bFlot.onclick = toggleMusic;

/* ---------- Entrada al universo ---------- */
$('btn-entrar').onclick = () => {
  audio.play().catch(() => {}); // la música inicia tras el clic de entrada
  $('bienvenida').classList.add('sale');
  setTimeout(() => {
    $('bienvenida').hidden = true; $('universo').hidden = false;
    $('reproductor').hidden = false; bFlot.hidden = false;
    scrollTo(0, 0); heartMain.start(); observe(); showPhrase('Bienvenida a tu universo, Meyly. 🌌');
  }, 1200);
};

/* ---------- Frase romántica al entrar a cada sección ---------- */
let phraseTimer;
function showPhrase(txt) {
  const f = $('frase'); f.textContent = txt; f.classList.add('ver');
  clearTimeout(phraseTimer); phraseTimer = setTimeout(() => f.classList.remove('ver'), 4200);
}
function observe() {
  const io = new IntersectionObserver((es) => es.forEach(e => {
    if (e.isIntersecting && e.target.dataset.frase) showPhrase(e.target.dataset.frase);
  }), { threshold: .6 });
  document.querySelectorAll('.seccion').forEach(s => io.observe(s));
}
$('btn-inicio').onclick = () => $('inicio').scrollIntoView({ behavior: 'smooth' });

/* ---------- Cartas (dos opciones) ---------- */
let cartaActual = 'papel';
function abrirCarta(id) {
  cartaActual = id;
  const s = $('sobre'); s.classList.remove('abre'); s.hidden = false;
  $('papel').hidden = true; $('papel2').hidden = true;
  $('modal-carta').hidden = false;
}
$('btn-carta').onclick = () => abrirCarta('papel');
$('btn-carta2').onclick = () => abrirCarta('papel2');
$('sobre').onclick = () => {
  const s = $('sobre'); s.classList.add('abre');
  setTimeout(() => { s.hidden = true; $(cartaActual).hidden = false; rain(14); }, 1500);
};
document.querySelectorAll('.btn-cerrar-carta').forEach(b => b.onclick = () => { $('modal-carta').hidden = true; });

/* ---------- Frases para Meyly ---------- */
const FRASES = [
  'Entre millones de estrellas, mi favorita siempre serás tú. ⭐',
  'Tu sonrisa es la luz que más me gusta mirar. 😊',
  'Contigo, hasta los días comunes se vuelven especiales. 💗',
  'Si el universo me diera a elegir otra vez, te elegiría a ti. 🌌',
  'Eres mi calma favorita y mi mejor casualidad. 🌙',
  'Gracias por existir y por iluminar mis días. ✨',
  'Cada momento contigo se queda guardado en mi corazón. 💖',
  'No hay galaxia lo bastante grande para todo lo que siento por ti. 🪐',
  'Pensar en ti es mi forma favorita de sonreír. 💫',
  'Eres un regalo que la vida me puso en el camino. 🎁',
  'Quiero cuidarte, hacerte reír y quedarme a tu lado. ❤️',
  'Brillas más que cualquier estrella del cielo, Meyly. 🌟'
];
let ultimaFrase = -1;
$('btn-frase').onclick = () => {
  let i; do { i = Math.random() * FRASES.length | 0; } while (i === ultimaFrase);
  ultimaFrase = i;
  const p = $('frase-texto'); p.style.opacity = 0;
  setTimeout(() => { p.textContent = FRASES[i]; p.style.opacity = 1; }, 250);
  rain(8);
};

/* ---------- Sorpresa ---------- */
const t1 = $('s-texto1'), t2 = $('s-texto2'), bClose = $('btn-cerrar-sorpresa');
let giftTimers = [];
$('btn-sorpresa').onclick = () => {
  [t1, t2, bClose].forEach(e => e.classList.remove('ver'));
  $('modal-sorpresa').hidden = false; heartGift.start();
  giftTimers = [setTimeout(() => rain(60), 2500), setTimeout(() => t1.classList.add('ver'), 4000),
    setTimeout(() => rain(40), 6500), setTimeout(() => t2.classList.add('ver'), 8000),
    setTimeout(() => bClose.classList.add('ver'), 10000)];
  sparkBurst(innerWidth / 2, innerHeight / 2, 30);
};
bClose.onclick = () => { giftTimers.forEach(clearTimeout); $('modal-sorpresa').hidden = true; heartGift.stop(); };
function rain(n) { // lluvia de corazones rosados y rojos
  for (let i = 0; i < n; i++) setTimeout(() => {
    const h = document.createElement('span'); h.className = 'lluvia';
    h.textContent = ['💗', '❤️', '💖', '💕'][Math.random() * 4 | 0];
    h.style.cssText = `left:${Math.random() * 100}%;font-size:${16 + Math.random() * 22}px;` +
      `animation-duration:${3 + Math.random() * 3}s;--r:${(Math.random() - .5) * 360}deg`;
    document.body.appendChild(h); setTimeout(() => h.remove(), 6500);
  }, i * 90);
}

/* ---------- Toques: destellos y corazones ---------- */
function sparkBurst(x, y, n = 8) {
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span'); s.className = 'chispa';
    const a = Math.random() * 6.28, d = 30 + Math.random() * 70;
    s.textContent = i % 3 === 0 ? '💗' : '✨';
    s.style.cssText = `left:${x}px;top:${y}px;font-size:${10 + Math.random() * 12}px;` +
      `--x:${Math.cos(a) * d}px;--y:${Math.sin(a) * d}px`;
    document.body.appendChild(s); setTimeout(() => s.remove(), 950);
  }
}
document.addEventListener('pointerdown', e => sparkBurst(e.clientX, e.clientY, 7));

/* ---------- Contador de tiempo juntos ---------- */
function tick() {
  const start = START_DATE ? new Date(START_DATE).getTime() : NaN;
  if (isNaN(start)) { $('aviso-fecha').hidden = false; return; }
  let d = Math.max(0, Math.floor((Date.now() - start) / 1000));
  $('c-dias').textContent = Math.floor(d / 86400);
  $('c-horas').textContent = Math.floor(d % 86400 / 3600);
  $('c-min').textContent = Math.floor(d % 3600 / 60);
  $('c-seg').textContent = d % 60;
}
tick(); setInterval(tick, 1000);

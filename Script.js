const NAMA_PENERIMA = "Sayangku";
const NAMA_PENGIRIM = "Aku";

const FOTOS = [
  { file: "foto1.jpg", caption: "malam waktu kita duduk di teras itu" },
  { file: "foto2.jpg", caption: "hari pertama kita ketemu" },
  { file: "foto3.jpg", caption: "waktu kamu ketawa sampai lupa foto" },
  { file: "foto4.jpg", caption: "momen kecil yang aku suka" },
  { file: "foto5.jpg", caption: "ganti dengan kenanganmu sendiri" },
  { file: "foto6.jpg", caption: "ganti dengan kenanganmu sendiri" }
];

const PESAN = `Aku suka caranya kamar ini terasa lebih hangat kalau ada kamu, ${NAMA_PENERIMA}. Kayak lampu yang nyala pelan tapi cukup buat bikin semuanya kerasa nyaman.

Aku nggak butuh momen besar buat sadar aku sayang kamu — cukup hal-hal kecil yang kita lewati bareng, yang kadang kita sendiri lupa catat, tapi aku simpan diam-diam.

Makasih udah jadi bagian dari cerita ini. Aku sayang kamu, hari ini dan hari-hari sesudahnya.`;

const TANDA_TANGAN = `— ${NAMA_PENGIRIM}`;


const cameraBtn = document.getElementById("camera-btn");
const flash = document.getElementById("flash");
const polaroidScene = document.getElementById("polaroid-scene");
const polaroidGrid = document.getElementById("polaroid-grid");
const letterMessage = document.getElementById("letter-message");
const letterSignature = document.getElementById("letter-signature");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const stringLights = document.getElementById("string-lights");
for (let i = 0; i < 14; i++) {
  const dot = document.createElement("span");
  dot.className = "dot-lamp";
  dot.style.animationDelay = (Math.random() * 3) + "s";
  stringLights.appendChild(dot);
}


FOTOS.forEach((foto, i) => {
  const item = document.createElement("div");
  item.className = "polaroid-item";
  const rotasi = (i % 2 === 0 ? 1 : -1) * (3 + ((i * 5) % 6));
  item.style.transform = `rotate(${rotasi}deg)`;

  const inner = document.createElement("div");
  inner.className = "polaroid-item-inner";

  const figure = document.createElement("figure");
  figure.className = "polaroid";
  figure.innerHTML = `
    <div class="photo-frame">
      <img src="${foto.file}" alt="Foto kenangan kalian"
           onerror="this.style.display='none'; this.parentElement.classList.add('empty')">
    </div>
    <figcaption>${foto.caption}</figcaption>
  `;

  inner.appendChild(figure);
  item.appendChild(inner);
  polaroidGrid.appendChild(item);
});

const semuaInner = polaroidGrid.querySelectorAll(".polaroid-item-inner");
const semuaImg = polaroidGrid.querySelectorAll(".photo-frame img");


function ketikPesan(teks, elemen, kecepatan = 24) {
  elemen.textContent = "";
  let i = 0;
  return new Promise((resolve) => {
    if (prefersReducedMotion) {
      elemen.textContent = teks;
      resolve();
      return;
    }
    const interval = setInterval(() => {
      elemen.textContent += teks[i];
      i++;
      if (i >= teks.length) {
        clearInterval(interval);
        resolve();
      }
    }, kecepatan);
  });
}

function tunggu(ms) {
  return new Promise(r => setTimeout(r, ms));
}


async function ambilPotret() {
  cameraBtn.classList.add("used");
  flash.classList.add("aktif");
  putarMusik();

  await tunggu(300);
  polaroidScene.classList.remove("hidden");

  for (let i = 0; i < semuaInner.length; i++) {
    await tunggu(prefersReducedMotion ? 0 : 240);
    semuaInner[i].classList.add("show");
    await tunggu(prefersReducedMotion ? 0 : 400);
    semuaImg[i].classList.add("developed");
  }

  await tunggu(500);
  letterSignature.textContent = "";
  await ketikPesan(PESAN, letterMessage, 20);
  letterSignature.textContent = TANDA_TANGAN;
}

cameraBtn.addEventListener("click", ambilPotret, { once: true });


const musik = document.getElementById("bg-music");
const vinylBtn = document.getElementById("vinyl-btn");
let musikSiap = true;

musik.addEventListener("error", () => {
  musikSiap = false;
  vinylBtn.classList.add("unavailable");
  vinylBtn.setAttribute("aria-label", "Musik tidak ditemukan — tambahkan file audio/lagu.mp3");
});

function putarMusik() {
  if (!musikSiap || !musik.paused) return;
  musik.volume = 0.45;
  musik.play()
    .then(() => vinylBtn.classList.add("playing"))
    .catch(() => { /* browser menahan autoplay, tombol tetap bisa dipakai manual */ });
}

function jedaMusik() {
  musik.pause();
  vinylBtn.classList.remove("playing");
}

vinylBtn.addEventListener("click", () => {
  musik.paused ? putarMusik() : jedaMusik();
});


const canvas = document.getElementById("dust-canvas");
const ctx = canvas.getContext("2d");
let motes = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function buatMote() {
  return {
    x: Math.random() * canvas.width,
    y: canvas.height + Math.random() * 60,
    r: 1 + Math.random() * 2.2,
    speed: 0.15 + Math.random() * 0.35,
    drift: (Math.random() - 0.5) * 0.4,
    opacity: 0.15 + Math.random() * 0.35,
    swing: Math.random() * Math.PI * 2
  };
}

function animasiDebu() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  motes.forEach(m => {
    m.y -= m.speed;
    m.swing += 0.015;
    m.x += Math.sin(m.swing) * m.drift;
    ctx.beginPath();
    ctx.fillStyle = `rgba(240,184,110,${m.opacity})`;
    ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
    ctx.fill();
  });
  motes = motes.filter(m => m.y > -20);
  if (motes.length < 40 && Math.random() > 0.5) motes.push(buatMote());
  requestAnimationFrame(animasiDebu);
}

if (!prefersReducedMotion) {
  for (let i = 0; i < 22; i++) motes.push(buatMote());
  requestAnimationFrame(animasiDebu);
}

import { writeFileSync, mkdirSync } from "fs";

const OUT = "public/images";
mkdirSync(OUT, { recursive: true });

const wrap = (w, h, inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">${inner}</svg>`;

const P = {
  green: ["#064e3b", "#065f46"],
  emerald: ["#047857", "#059669"],
  teal: ["#0f766e", "#0d9488"],
  dark: ["#14532d", "#166534"],
};

const bg = (id, c1, c2) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>`;

function sceneCard(w, h, p) {
  const [c1, c2] = P[p];
  return wrap(w, h, `<defs>${bg("bg", c1, c2)}<linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity="0.95"/><stop offset="1" stop-color="#ecfdf5" stop-opacity="0.85"/></linearGradient></defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <g transform="rotate(-10 ${w * 0.6} ${h * 0.5})">
    <rect x="${w * 0.34}" y="${h * 0.24}" width="${w * 0.4}" height="${h * 0.46}" rx="16" fill="url(#cg)"/>
    <rect x="${w * 0.34}" y="${h * 0.24}" width="${w * 0.4}" height="${h * 0.11}" rx="16" fill="#34d399" opacity="0.85"/>
    <circle cx="${w * 0.42}" cy="${h * 0.32}" r="${h * 0.028}" fill="#065f46"/>
  </g>
  <circle cx="${w * 0.22}" cy="${h * 0.66}" r="${h * 0.14}" fill="#fcd34d" opacity="0.95"/>
  <circle cx="${w * 0.22}" cy="${h * 0.66}" r="${h * 0.14}" fill="none" stroke="#f59e0b" stroke-width="3"/>
  <text x="${w * 0.22}" y="${h * 0.66 + h * 0.06}" font-size="${h * 0.16}" font-family="Arial" font-weight="bold" fill="#92400e" text-anchor="middle">$</text>`);
}

function sceneBuilding(w, h, p) {
  const [c1, c2] = P[p];
  return wrap(w, h, `<defs>${bg("bg", c1, c2)}</defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <polygon points="${w * 0.2},${h * 0.42} ${w * 0.8},${h * 0.42} ${w * 0.5},${h * 0.22}" fill="#ffffff" opacity="0.92"/>
  <rect x="${w * 0.22}" y="${h * 0.42}" width="${w * 0.56}" height="${h * 0.36}" fill="#ffffff" opacity="0.9"/>
  ${[0.28, 0.4, 0.52, 0.64].map((fx) => `<rect x="${w * fx}" y="${h * 0.46}" width="${w * 0.06}" height="${h * 0.28}" fill="${c1}" opacity="0.55"/>`).join("")}
  <rect x="${w * 0.46}" y="${h * 0.6}" width="${w * 0.08}" height="${h * 0.18}" fill="${c1}" opacity="0.6"/>`);
}

function scenePeople(w, h, p) {
  const [c1, c2] = P[p];
  return wrap(w, h, `<defs>${bg("bg", c1, c2)}</defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <circle cx="${w * 0.38}" cy="${h * 0.4}" r="${h * 0.12}" fill="#ffffff" opacity="0.9"/>
  <rect x="${w * 0.26}" y="${h * 0.55}" width="${w * 0.24}" height="${h * 0.3}" rx="${w * 0.1}" fill="#ffffff" opacity="0.85"/>
  <circle cx="${w * 0.62}" cy="${h * 0.44}" r="${h * 0.1}" fill="#a7f3d0" opacity="0.92"/>
  <rect x="${w * 0.53}" y="${h * 0.57}" width="${w * 0.2}" height="${h * 0.28}" rx="${w * 0.08}" fill="#a7f3d0" opacity="0.85"/>`);
}

function scenePhone(w, h, p) {
  const [c1, c2] = P[p];
  return wrap(w, h, `<defs>${bg("bg", c1, c2)}</defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <rect x="${w * 0.34}" y="${h * 0.18}" width="${w * 0.32}" height="${h * 0.64}" rx="14" fill="#ffffff" opacity="0.95"/>
  <rect x="${w * 0.37}" y="${h * 0.23}" width="${w * 0.26}" height="${h * 0.1}" rx="4" fill="#34d399" opacity="0.8"/>
  <polyline points="${w * 0.39},${h * 0.72} ${w * 0.46},${h * 0.62} ${w * 0.53},${h * 0.66} ${w * 0.6},${h * 0.54}" fill="none" stroke="#059669" stroke-width="${h * 0.03}" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="${w * 0.5}" cy="${h * 0.18}" r="${h * 0.012}" fill="#ffffff" opacity="0.6"/>`);
}

function sceneCoins(w, h, p) {
  const [c1, c2] = P[p];
  return wrap(w, h, `<defs>${bg("bg", c1, c2)}</defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  ${[0.3, 0.45, 0.6].map((fy) => `<ellipse cx="${w * 0.5}" cy="${h * fy}" rx="${w * 0.22}" ry="${h * 0.06}" fill="#fcd34d" opacity="0.95"/><ellipse cx="${w * 0.5}" cy="${h * fy}" rx="${w * 0.22}" ry="${h * 0.06}" fill="none" stroke="#f59e0b" stroke-width="2"/>`).join("")}
  <text x="${w * 0.5}" y="${h * 0.5}" font-size="${h * 0.12}" font-family="Arial" font-weight="bold" fill="#92400e" text-anchor="middle">$</text>`);
}

function sceneGrowth(w, h, p) {
  const [c1, c2] = P[p];
  return wrap(w, h, `<defs>${bg("bg", c1, c2)}</defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <polyline points="${w * 0.2},${h * 0.75} ${w * 0.4},${h * 0.6} ${w * 0.6},${h * 0.65} ${w * 0.8},${h * 0.35}" fill="none" stroke="#ffffff" stroke-width="${h * 0.04}" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M ${w * 0.8} ${h * 0.35} l -${w * 0.06} 0 M ${w * 0.8} ${h * 0.35} l -${w * 0.02} ${h * 0.06}" stroke="#a7f3d0" stroke-width="${h * 0.04}" fill="none" stroke-linecap="round"/>`);
}

function sceneArrows(w, h, p) {
  const [c1, c2] = P[p];
  return wrap(w, h, `<defs>${bg("bg", c1, c2)}</defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <g stroke="#ffffff" stroke-width="${h * 0.05}" fill="none" stroke-linecap="round">
    <line x1="${w * 0.2}" y1="${h * 0.4}" x2="${w * 0.7}" y2="${h * 0.4}"/>
    <path d="M ${w * 0.7} ${h * 0.4} l -${w * 0.08} -${h * 0.06} M ${w * 0.7} ${h * 0.4} l -${w * 0.08} ${h * 0.06}"/>
    <line x1="${w * 0.8}" y1="${h * 0.62}" x2="${w * 0.3}" y2="${h * 0.62}"/>
    <path d="M ${w * 0.3} ${h * 0.62} l ${w * 0.08} -${h * 0.06} M ${w * 0.3} ${h * 0.62} l ${w * 0.08} ${h * 0.06}"/>
  </g>`);
}

function sceneNetwork(w, h, p) {
  const [c1, c2] = P[p];
  const nodes = [[0.3, 0.3], [0.7, 0.35], [0.25, 0.7], [0.75, 0.72], [0.5, 0.5]];
  const lines = nodes.slice(0, 4).map((n) => `<line x1="${w * 0.5}" y1="${h * 0.5}" x2="${w * n[0]}" y2="${h * n[1]}" stroke="#a7f3d0" stroke-width="3" opacity="0.6"/>`).join("");
  const dots = nodes.map((n) => `<circle cx="${w * n[0]}" cy="${h * n[1]}" r="${h * 0.05}" fill="#ffffff" opacity="0.92"/>`).join("");
  return wrap(w, h, `<defs>${bg("bg", c1, c2)}</defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>${lines}${dots}`);
}

const scenes = { card: sceneCard, building: sceneBuilding, people: scenePeople, phone: scenePhone, coins: sceneCoins, growth: sceneGrowth, arrows: sceneArrows, network: sceneNetwork };

const jobs = [
  ["hero.svg", 1200, 800, "card", "green"],
  ["promo-checking.svg", 800, 500, "card", "emerald"],
  ["promo-business.svg", 800, 500, "building", "teal"],
  ["promo-home.svg", 800, 500, "people", "green"],
  ["promo-savings.svg", 800, 500, "coins", "dark"],
  ["about.svg", 900, 650, "people", "emerald"],
  ["contact.svg", 700, 520, "building", "teal"],
  ["service-loans.svg", 240, 240, "coins", "green"],
  ["service-transfer.svg", 240, 240, "arrows", "teal"],
  ["service-net.svg", 240, 240, "network", "emerald"],
  ["service-prepaid.svg", 240, 240, "card", "dark"],
  ["service-mcash.svg", 240, 240, "phone", "green"],
  ["service-cards.svg", 240, 240, "card", "emerald"],
];

for (const [name, w, h, type, p] of jobs) {
  writeFileSync(`${OUT}/${name}`, scenes[type](w, h, p));
}
console.log("generated", jobs.length, "images into", OUT);

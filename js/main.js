/* ===== CONFIGURAÇÃO — edite aqui ===== */
const CONFIG = {
  ARQUIVO: 'planilha.xlsx', // arquivo Excel na raiz do site (tem prioridade sobre o Google). Vazio = não usar
  SHEET_ID: 'FF7D56D498EB8333%21sfca1b248c1e24afe9aaa81b2f7e866d3&driveId=FF7D56D498EB8333&usid=cac38921-0746-4f27-a4e4-30fccf90df49',            // alternativa: ID de uma planilha Google pública
  ABAS: { projetos: 'Projetos', eventos: 'Eventos', noticias: 'Noticias' },
  FORM_URL: '',            // endereço do Formspree/Web3Forms; vazio = abre o e-mail do usuário
  EMAIL: 'erivelton.ramos@educacao.mg.gov.br',
  MAPA: 'Escola Estadual José Bonifácio, Poço Fundo - MG', // texto buscado no Google Maps (o pino abre no centro)
  ENDERECO: 'Rua Prefeito Edgard Ferreira, Centro — Poço Fundo, MG', // conferir o número com a direção
  LIBRAS: true,            // tradutor VLibras (governo federal); false para desligar
  REDES: []                // ex.: [['Instagram','https://instagram.com/...']] — confirmar com a direção
};
/* Conteúdo estático inicial (usado enquanto não houver planilha) */
const FALLBACK = {
  projetos: [
    { titulo: 'Robô com sensor ultrassônico', descricao: 'Carro de quatro rodas com Arduino e sensor que detecta obstáculos, montado pelos alunos.', imagem: 'img/robo.jpg', alt: 'Robô de quatro rodas com sensor ultrassônico' },
    { titulo: 'Peças cortadas a laser', descricao: 'Estruturas dos protótipos desenhadas no computador e cortadas na máquina a laser do laboratório.', imagem: 'img/laser.jpg', alt: 'Máquina de corte a laser com peças de madeira recortadas' }
  ],
  eventos: [],
  noticias: []
};
/* Colunas esperadas na planilha — Projetos: titulo, descricao, imagem, alt, autor | Eventos: titulo, data, hora, local, descricao, imagem, alt, link | Noticias: titulo, texto, imagem, alt */

const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const okImg = u => /^(https?:\/\/|img\/)/i.test(u || '') ? u : '';
const store = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };
const PAGES = [['index', 'Início'], ['sobre', 'Sobre'], ['projetos', 'Projetos'], ['agenda', 'Agenda'], ['contato', 'Contato']];

/* ---------- Acessibilidade ---------- */
let fs = +store.get('fs') || 100;
function applyA11y() {
  document.documentElement.style.fontSize = fs + '%';
  const on = store.get('hc') === '1';
  document.body.classList.toggle('hc', on);
  const b = $('#hc'); if (b) b.setAttribute('aria-pressed', on);
}

/* ---------- VLibras: tradutor de Libras do governo federal (vlibras.gov.br) ---------- */
function vlibras() {
  if (!CONFIG.LIBRAS || $('[vw]')) return;
  document.body.insertAdjacentHTML('beforeend', '<div vw class="enabled"><div vw-access-button class="active"></div><div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div></div>');
  const s = document.createElement('script');
  s.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
  s.onload = () => new window.VLibras.Widget('https://vlibras.gov.br/app');
  document.body.appendChild(s);
}

/* ---------- Cabeçalho e rodapé ---------- */
function chrome() {
  vlibras();
  const cur = document.body.dataset.page;
  $('#topo').innerHTML = `<div class="top"><div class="wrap bar">
    <a class="brand" href="index.html"><i aria-hidden="true"></i>Robótica José Bonifácio</a>
    <div class="tools" role="group" aria-label="Acessibilidade">
      <button class="tool" data-fs="-10" aria-label="Diminuir tamanho da letra">A−</button>
      <button class="tool" data-fs="10" aria-label="Aumentar tamanho da letra">A+</button>
      <button class="tool" id="hc" aria-pressed="false">Alto contraste</button></div></div>
    <nav class="wrap" aria-label="Principal"><button class="menu" aria-expanded="false" aria-controls="nav">Menu</button>
    <ul id="nav">${PAGES.map(([k, n]) => `<li><a href="${k}.html"${k === cur ? ' aria-current="page"' : ''}>${n}</a></li>`).join('')}</ul></nav></div>`;
  const redes = CONFIG.REDES.map(([n, u]) => `<a href="${esc(u)}" rel="noopener">${esc(n)}</a>`).join(' · ');
  $('#rodape').innerHTML = `<div class="foot"><div class="wrap"><p><strong>Projeto de Robótica — Escola Estadual José Bonifácio</strong></p>
    <p>Contato: <a href="mailto:${CONFIG.EMAIL}">${CONFIG.EMAIL}</a>${redes ? '<br>' + redes : ''}</p></div></div>`;
  document.addEventListener('click', e => {
    const t = e.target.closest('button'); if (!t) return;
    if (t.dataset.fs) { fs = Math.min(150, Math.max(80, fs + +t.dataset.fs)); store.set('fs', fs); applyA11y(); }
    if (t.id === 'hc') { store.set('hc', store.get('hc') === '1' ? '0' : '1'); applyA11y(); }
    if (t.classList.contains('menu')) { const o = $('#nav').classList.toggle('open'); t.setAttribute('aria-expanded', o); }
  });
}

/* ---------- Dados (Google Planilhas) ---------- */
const parseD = v => {
  if (v instanceof Date) return v;
  const s = String(v || ''); let m = /Date\((\d+),(\d+),(\d+)/.exec(s);
  if (m) return new Date(+m[1], +m[2], +m[3]);
  m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(s); if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
  m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s); if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
  return null; /* data inválida: o evento aparece em "próximos" em vez de sumir */
};
/* ---------- Dados a partir de um arquivo Excel (.xlsx) guardado junto do site ---------- */
let xlsxLib;
const getXlsx = () => xlsxLib || (xlsxLib = new Promise((ok, no) => {
  if (window.XLSX) return ok(window.XLSX);
  const s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
  s.onload = () => ok(window.XLSX); s.onerror = no; document.head.appendChild(s);
}));
const p2 = n => String(n).padStart(2, '0');
function linhaXlsx(r) {
  const o = {};
  for (const [k0, v] of Object.entries(r)) {
    const k = k0.trim().toLowerCase();
    if (k === 'data' && typeof v === 'number') { /* número de série do Excel -> data */
      const u = new Date(Math.round((v - 25569) * 864e5));
      o._d = new Date(u.getUTCFullYear(), u.getUTCMonth(), u.getUTCDate());
      o.data = `${p2(o._d.getDate())}/${p2(o._d.getMonth() + 1)}/${o._d.getFullYear()}`;
    } else if (k === 'hora' && typeof v === 'number') { /* fração do dia -> HH:MM */
      const m = Math.round((v % 1) * 1440);
      o.hora = `${p2(Math.floor(m / 60) % 24)}:${p2(m % 60)}`;
    } else o[k] = v;
  }
  if (typeof o.data === 'string' && !o._d) o._d = parseD(o.data);
  return o;
}
async function loadXlsx(key) {
  const X = await getXlsx();
  const wb = X.read(await (await fetch(CONFIG.ARQUIVO)).arrayBuffer());
  const ws = wb.Sheets[CONFIG.ABAS[key]];
  if (!ws) return FALLBACK[key];
  return X.utils.sheet_to_json(ws, { defval: '' }).map(linhaXlsx).filter(o => o.titulo);
}
async function load(key) {
  if (CONFIG.ARQUIVO) { try { return await loadXlsx(key); } catch (e) { return FALLBACK[key]; } }
  if (!CONFIG.SHEET_ID) return FALLBACK[key];
  try {
    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&headers=1&sheet=${encodeURIComponent(CONFIG.ABAS[key])}`;
    const t = await (await fetch(url)).text();
    const j = JSON.parse(t.slice(t.indexOf('(') + 1, t.lastIndexOf(')')));
    const h = j.table.cols.map(c => (c.label || '').trim().toLowerCase());
    return j.table.rows.map(r => {
      const o = {};
      h.forEach((k, i) => { const c = r.c[i]; o[k] = c ? (c.f ?? c.v ?? '') : ''; if (k === 'data' && c && c.v) o._d = parseD(c.v); });
      return o;
    }).filter(o => o.titulo);
  } catch (e) { return FALLBACK[key]; }
}
const MES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const card = p => {
  const img = okImg(p.imagem), d = p._d;
  const link = /^https?:\/\//i.test(p.link || '') ? `<p><a href="${esc(p.link)}" rel="noopener">Saiba mais</a></p>` : '';
  const quando = [p.data, p.hora, p.local].filter(Boolean).map(esc).join(' — ');
  return `<article class="card${d ? ' ev' : ''}">${img ? `<img src="${esc(img)}" alt="${esc(p.alt || p.titulo)}" loading="lazy">` : ''}<div>
  ${d ? `<span class="dia" aria-hidden="true"><b>${d.getDate()}</b>${MES[d.getMonth()]}</span>` : ''}<h3>${esc(p.titulo)}</h3>
  ${quando ? `<p class="meta">${quando}</p>` : ''}<p>${esc(p.descricao || p.texto)}</p>${p.autor ? `<p class="meta">Por ${esc(p.autor)}</p>` : ''}${link}</div></article>`;
};
const fill = (sel, arr, vazio) => { const e = $(sel); if (e) e.innerHTML = arr.length ? arr.map(card).join('') : `<p class="empty">${vazio}</p>`; };

document.addEventListener('DOMContentLoaded', async () => {
  chrome(); applyA11y();
  const pg = document.body.dataset.page, hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const prox = a => a.filter(e => !e._d || e._d >= hoje).sort((x, y) => (x._d || 0) - (y._d || 0));
  const pass = a => a.filter(e => e._d && e._d < hoje).sort((x, y) => y._d - x._d);
  if (pg === 'index') {
    const [p, e, n] = await Promise.all([load('projetos'), load('eventos'), load('noticias')]);
    fill('#ult-projetos', p.slice(-3).reverse(), 'Os primeiros projetos aparecem aqui em breve.');
    fill('#prox-eventos', prox(e).slice(0, 3), 'Nenhum evento marcado por enquanto.');
    fill('#noticias', n.slice(0, 3), 'Sem novidades por enquanto.');
  }
  if (pg === 'projetos') fill('#lista', await load('projetos'), 'Nenhum projeto cadastrado ainda.');
  if (pg === 'agenda') {
    const e = await load('eventos');
    fill('#futuros', prox(e), 'Nenhum evento marcado por enquanto.');
    fill('#passados', pass(e), 'Os eventos já realizados aparecem aqui.');
  }
  if (pg === 'contato') {
    const q = encodeURIComponent(CONFIG.MAPA);
    $('#mapa').src = `https://www.google.com/maps?q=${q}&z=17&output=embed`;
    $('#rota').href = `https://www.google.com/maps/dir/?api=1&destination=${q}`;
    $('#end').textContent = CONFIG.ENDERECO;
    $('#mail').textContent = CONFIG.EMAIL; $('#mail').href = 'mailto:' + CONFIG.EMAIL;
    const f = $('#form'), st = $('#st');
    f.addEventListener('submit', async ev => {
      ev.preventDefault();
      if (f.elements.website.value) return; /* proteção básica contra robôs (honeypot) */
      const d = new FormData(f);
      if (!CONFIG.FORM_URL) {
        location.href = `mailto:${CONFIG.EMAIL}?subject=${encodeURIComponent('Contato pelo site — ' + d.get('nome'))}&body=${encodeURIComponent(d.get('mensagem') + '\n\n' + d.get('email'))}`;
        return;
      }
      try {
        const r = await fetch(CONFIG.FORM_URL, { method: 'POST', body: d, headers: { Accept: 'application/json' } });
        if (!r.ok) throw 0;
        f.reset(); st.textContent = 'Mensagem enviada. Obrigado pelo contato!';
      } catch (e) { st.textContent = 'Não foi possível enviar. Tente de novo ou escreva para ' + CONFIG.EMAIL + '.'; }
    });
  }
});

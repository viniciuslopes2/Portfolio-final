// habilidades
const hardSkills = [
  { nome: "HTML5",      classe: "html5",      icone: "devicon-html5-plain" },
  { nome: "CSS3",       classe: "css3",       icone: "devicon-css3-plain" },
  { nome: "JavaScript", classe: "javascript", icone: "devicon-javascript-plain" },
  { nome: "BootStrap",  classe: "bootstrap",  icone: "devicon-bootstrap-plain" },
  { nome: "Python",     classe: "python",     icone: "devicon-python-plain" },
  { nome: "Java",       classe: "java",       icone: "devicon-java-plain" },
  { nome: "C#",         classe: "csharp",     icone: "devicon-csharp-plain" },
  { nome: "MySQL",      classe: "mysql",      icone: "devicon-mysql-plain" },
  { nome: "Kotlin",     classe: "kotlin",     icone: "devicon-kotlin-plain" },
  { nome: "C",          classe: "c-lang",     icone: "devicon-c-plain" },
  { nome: "React",      classe: "react",      icone: "devicon-react-original" },
  { nome: "Node.js",    classe: "nodejs",     icone: "devicon-nodejs-plain-wordmark" },
  { nome: "Flask",      classe: "flask",      icone: "devicon-flask-original" },
  { nome: "MongoDB",    classe: "mongodb",    icone: "devicon-mongodb-plain-wordmark" },
  { nome: "Git",        classe: "git",        icone: "devicon-git-plain" },
  { nome: "Docker",     classe: "docker",     icone: "devicon-docker-plain-wordmark" },
];

const softSkills = [
  "Comunicação Efetiva",
  "Trabalho em Equipe",
  "Organização e Foco",
  "Proatividade",
  "Resolução de Problemas",
  "Pensamento Crítico",
];

let projetosCache = [];

// utilitários
function esc(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

async function buscar(entidade) {
  const raw = localStorage.getItem('portfolio_' + entidade);
  if (raw) {
    try { return JSON.parse(raw); } catch {}
  }
  try {
    const res = await fetch(`data/${entidade}.json`);
    if (res.ok) return res.json();
  } catch {}
  return [];
}

function saudacao() {
  const hora = new Date().getHours();
  if (hora >= 5 && hora < 12) return 'Bom dia!';
  if (hora >= 12 && hora < 18) return 'Boa tarde!';
  return 'Boa noite!';
}

// render
function renderProjetos(filtro = 'todos') {
  const container = document.getElementById('projetos-grid');
  if (!container) return;

  const fallback = 'https://via.placeholder.com/400x225?text=Projeto';
  const lista = projetosCache.filter(p => filtro === 'todos' || p.categoria === filtro);

  container.innerHTML = lista.map(p => `
    <div class="projeto-card">
      <img src="${esc(p.imagem || fallback)}" alt="${esc(p.titulo)}" class="projeto-imagem"
           onerror="this.src='${fallback}'">
      <div class="projeto-conteudo">
        <h3 class="projeto-titulo">${esc(p.titulo)}</h3>
        <p class="projeto-descricao">${esc(p.descricao)}</p>
        <a href="${esc(p.link || '#')}" target="_blank" rel="noopener noreferrer" class="button">
          Ver Projeto
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </a>
      </div>
    </div>
  `).join('') || '<p class="text-muted">Nenhum projeto encontrado.</p>';
}

function renderCertificados(lista) {
  const container = document.getElementById('certificados-grid');
  if (!container) return;

  const fallback = 'https://via.placeholder.com/400x225?text=Certificado';

  container.innerHTML = lista.map(c => `
    <div class="projeto-card">
      <img src="${esc(c.imagem || fallback)}" alt="${esc(c.titulo)}" class="projeto-imagem"
           onerror="this.src='${fallback}'">
      <div class="projeto-conteudo">
        <h3 class="projeto-titulo">${esc(c.titulo)}</h3>
        <p class="projeto-descricao">${esc(c.descricao)}</p>
        ${c.credencial ? `<a href="${esc(c.credencial)}" target="_blank" rel="noopener noreferrer" class="button">Ver Credencial</a>` : ''}
      </div>
    </div>
  `).join('') || '<p class="text-muted">Nenhum certificado cadastrado.</p>';
}

function renderFormacao(lista) {
  const container = document.getElementById('lista-formacao');
  if (!container) return;

  container.innerHTML = lista.map(f => `
    <p><strong>${esc(f.instituicao)}</strong><br>
    ${esc(f.curso)} ${f.status ? `(${esc(f.status)})` : ''}</p>
    ${f.descricao ? `<p>${esc(f.descricao)}</p>` : ''}
  `).join('');
}

function renderExperiencias(lista) {
  const container = document.getElementById('lista-experiencias');
  if (!container) return;

  container.innerHTML = lista.map(e => `
    <p><strong>${esc(e.empresa)}</strong></p>
    ${e.cargo     ? `<p><em>${esc(e.cargo)}</em></p>`  : ''}
    ${e.descricao ? `<p>${esc(e.descricao)}</p>`       : ''}
  `).join('');
}

function renderCursos(lista) {
  const ul = document.getElementById('lista-cursos');
  if (!ul) return;

  ul.innerHTML = lista.map(c => `
    <li>
      <span class="curso-nome">
        ${esc(c.nome)}<br>
        <small class="curso-instituicao">${esc(c.instituicao)}</small>
      </span>
      <span class="curso-detalhes">${esc(c.carga)} &bull; ${esc(String(c.ano || ''))}</span>
    </li>
  `).join('');
}

function renderHabilidades() {
  const hard = document.getElementById('hard-skills-grid');
  const soft = document.getElementById('soft-skills-grid');

  if (hard) {
    hard.innerHTML = hardSkills.map(s =>
      `<span class="habilidade-tag ${s.classe}"><i class="${s.icone}"></i>${s.nome}</span>`
    ).join('');
  }

  if (soft) {
    soft.innerHTML = softSkills.map(s =>
      `<span class="habilidade-tag soft-skill-tag">${s}</span>`
    ).join('');
  }
}

// interações
function configurarFiltros() {
  const filtros = document.getElementById('filtros-projetos');
  if (!filtros) return;

  filtros.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-filtro');
    if (!btn) return;
    filtros.querySelectorAll('.btn-filtro').forEach(b => b.classList.remove('ativo'));
    btn.classList.add('ativo');
    renderProjetos(btn.dataset.categoria);
  });
}

function configurarMenu() {
  const toggle = document.getElementById('menu-toggle');
  const nav    = document.getElementById('main-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const aberto = nav.classList.toggle('mobile-menu-open');
    toggle.setAttribute('aria-expanded', aberto);
  });

  nav.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      nav.classList.remove('mobile-menu-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

// init
document.addEventListener('DOMContentLoaded', async () => {
  const anoEl = document.getElementById('footer-ano');
  if (anoEl) anoEl.textContent = new Date().getFullYear();

  const saudacaoEl = document.getElementById('mensagem-saudacao');
  if (saudacaoEl) saudacaoEl.textContent = saudacao();

  renderHabilidades();
  configurarFiltros();
  configurarMenu();

  try {
    const [projetos, certificados, formacao, experiencias, cursos] = await Promise.all([
      buscar('projetos'),
      buscar('certificados'),
      buscar('formacao'),
      buscar('experiencias'),
      buscar('cursos'),
    ]);

    projetosCache = projetos;
    renderProjetos();
    renderCertificados(certificados);
    renderFormacao(formacao);
    renderExperiencias(experiencias);
    renderCursos(cursos);
  } catch (err) {
    console.error('Erro ao carregar dados:', err);
  }
});

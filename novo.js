// storage (localStorage com fallback para data/*.json)
const DB_PREFIX = 'portfolio_';

async function carregarStorage(entidade) {
  const raw = localStorage.getItem(DB_PREFIX + entidade);
  if (raw) {
    try { return JSON.parse(raw); } catch {}
  }
  try {
    const res = await fetch(`data/${entidade}.json`);
    if (res.ok) {
      const dados = await res.json();
      localStorage.setItem(DB_PREFIX + entidade, JSON.stringify(dados));
      return dados;
    }
  } catch {}
  return [];
}

function salvarStorage(entidade, itens) {
  localStorage.setItem(DB_PREFIX + entidade, JSON.stringify(itens));
}

const api = {
  listar: (entidade) => carregarStorage(entidade),

  criar: async (entidade, body) => {
    const itens = await carregarStorage(entidade);
    const item  = { ...body, id: crypto.randomUUID() };
    itens.push(item);
    salvarStorage(entidade, itens);
    return item;
  },

  salvar: async (entidade, id, body) => {
    const itens = await carregarStorage(entidade);
    const idx   = itens.findIndex(i => i.id === id);
    if (idx === -1) throw new Error('Não encontrado');
    itens[idx] = { ...itens[idx], ...body, id };
    salvarStorage(entidade, itens);
    return itens[idx];
  },

  excluir: async (entidade, id) => {
    const itens = await carregarStorage(entidade);
    salvarStorage(entidade, itens.filter(i => i.id !== id));
  },
};

async function uploadImagem(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Erro ao ler imagem'));
    reader.readAsDataURL(file);
  });
}

// config das entidades
const entidades = {
  projetos: {
    listaId: 'lista-projetos',
    formId:  'form-projetos',
    temUpload: true,
    renderItem: (p) => ({
      thumb: p.imagem,
      titulo: p.titulo,
      meta: `<span class="badge">${esc(p.categoria)}</span> ${esc(p.descricao)}<br><small>${esc(p.link || '')}</small>`,
    }),
  },
  certificados: {
    listaId: 'lista-certificados',
    formId:  'form-certificados',
    temUpload: true,
    renderItem: (c) => ({
      thumb: c.imagem,
      titulo: c.titulo,
      meta: `${esc(c.descricao)}<br><small>${esc(c.credencial || '')}</small>`,
    }),
  },
  experiencias: {
    listaId: 'lista-experiencias',
    formId:  'form-experiencias',
    renderItem: (e) => ({
      titulo: e.empresa,
      meta: `<em>${esc(e.cargo || '')}</em><br>${esc(e.descricao || '')}`,
    }),
  },
  formacao: {
    listaId: 'lista-formacao',
    formId:  'form-formacao',
    renderItem: (f) => ({
      titulo: f.instituicao,
      meta: `${esc(f.curso)} ${f.status ? `<span class="badge">${esc(f.status)}</span>` : ''}<br>${esc(f.descricao || '')}`,
    }),
  },
  cursos: {
    listaId: 'lista-cursos-admin',
    formId:  'form-cursos',
    renderItem: (c) => ({
      titulo: c.nome,
      meta: `${esc(c.instituicao)} &bull; ${esc(c.carga || '')} &bull; ${esc(String(c.ano || ''))}`,
    }),
  },
};

// utilitários
function esc(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function path(str) {
  if (!str) return '';
  if (str.startsWith('http') || str.startsWith('data:')) return str;
  return str.replace(/^\/+/, '');
}

function toast(mensagem, tipo = 'success') {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = mensagem;
  el.className = `toast show ${tipo}`;
  setTimeout(() => { el.className = 'toast'; }, 2500);
}

// lista
async function carregarLista(entidade) {
  const config    = entidades[entidade];
  const container = document.getElementById(config.listaId);
  if (!container) return;

  const itens = await api.listar(entidade);

  if (!itens.length) {
    container.innerHTML = '<p class="text-muted">Nenhum item cadastrado.</p>';
    return;
  }

  container.innerHTML = itens.map(item => {
    const { thumb, titulo, meta } = config.renderItem(item);
    return `
      <div class="admin-item">
        ${thumb ? `<img src="${esc(path(thumb))}" class="admin-item-thumb" alt="" onerror="this.style.display='none'">` : ''}
        <div class="admin-item-body">
          <h3 class="admin-item-title">${esc(titulo)}</h3>
          <p class="admin-item-meta">${meta || ''}</p>
        </div>
        <div class="admin-item-actions">
          <button class="btn-edit"   data-acao="editar"  data-entidade="${entidade}" data-id="${esc(item.id)}">Editar</button>
          <button class="btn-delete" data-acao="excluir" data-entidade="${entidade}" data-id="${esc(item.id)}">Excluir</button>
        </div>
      </div>
    `;
  }).join('');
}

// formulário
function formParaObjeto(form) {
  const obj = {};
  new FormData(form).forEach((valor, chave) => {
    if (chave === 'imagemFile') return;
    obj[chave] = valor;
  });
  if (!obj.id) delete obj.id;
  return obj;
}

function preencherForm(form, item) {
  Object.entries(item).forEach(([chave, valor]) => {
    const campo = form.elements.namedItem(chave);
    if (campo && campo.type !== 'file') campo.value = valor ?? '';
  });
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function limparForm(form) {
  form.reset();
  const idField     = form.elements.namedItem('id');
  const imagemField = form.elements.namedItem('imagem');
  if (idField)     idField.value     = '';
  if (imagemField) imagemField.value = '';
}

async function salvarItem(entidade, form) {
  const config = entidades[entidade];

  if (config.temUpload) {
    const fileInput = form.elements.namedItem('imagemFile');
    if (fileInput?.files[0]) {
      const url = await uploadImagem(fileInput.files[0]);
      const imagemField = form.elements.namedItem('imagem');
      if (imagemField) imagemField.value = url;
    }
  }

  const dados = formParaObjeto(form);
  const id    = form.elements.namedItem('id')?.value;

  if (id) {
    await api.salvar(entidade, id, dados);
    toast('Atualizado com sucesso!');
  } else {
    await api.criar(entidade, dados);
    toast('Criado com sucesso!');
  }

  limparForm(form);
  await carregarLista(entidade);
}

async function editarItem(entidade, id) {
  const itens = await api.listar(entidade);
  const item  = itens.find(i => i.id === id);
  if (!item) return toast('Item não encontrado', 'error');

  const form = document.getElementById(entidades[entidade].formId);
  limparForm(form);
  preencherForm(form, item);
}

async function excluirItem(entidade, id) {
  if (!confirm('Tem certeza que deseja excluir?')) return;
  await api.excluir(entidade, id);
  toast('Excluído!');
  await carregarLista(entidade);
}

// abas
function ativarAba(aba) {
  document.querySelectorAll('.admin-tab').forEach(btn => {
    btn.classList.toggle('ativo', btn.dataset.tab === aba);
  });
  document.querySelectorAll('.admin-section').forEach(section => {
    section.classList.toggle('ativo', section.id === `tab-${aba}`);
  });
  history.replaceState(null, '', `#${aba}`);
}

// init
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('admin-tabs')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.admin-tab');
    if (btn) ativarAba(btn.dataset.tab);
  });

  Object.entries(entidades).forEach(([entidade, config]) => {
    const form = document.getElementById(config.formId);
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await salvarItem(entidade, form);
      } catch (err) {
        toast(err.message, 'error');
      }
    });

    form.addEventListener('click', (e) => {
      if (e.target.dataset.action === 'reset') limparForm(form);
    });
  });

  document.body.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-acao]');
    if (!btn) return;

    const { acao, entidade, id } = btn.dataset;
    try {
      if (acao === 'editar')  await editarItem(entidade, id);
      if (acao === 'excluir') await excluirItem(entidade, id);
    } catch (err) {
      toast(err.message, 'error');
    }
  });

  const abaInicial = (location.hash || '#projetos').slice(1);
  if (entidades[abaInicial]) ativarAba(abaInicial);

  Object.keys(entidades).forEach(entidade => carregarLista(entidade));
});

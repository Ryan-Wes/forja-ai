/* ============================================================
   FORJA — App (Fase 1)
   Tela Hoje (hábitos marcáveis) + Alter Ego. Dados via Store.
   ============================================================ */

const App = (() => {
  let view = "hoje";          // hoje | chefoes | progresso | metas | ego
  let modoEdicao = false;     // mostra botões de excluir hábito
  let addAberto = false;      // mostra form de novo hábito
  let iconeNovo = "star";     // ícone selecionado no form de novo hábito
  let criarBossAberto = false; // mostra form de novo chefão

  const el = () => document.getElementById("app");
  const esc = (s) => String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  const GRUPOS = [
    { id: "manha", titulo: "Ritual da manhã", icone: "sunrise" },
    { id: "dia",   titulo: "Hábitos do dia",  icone: "flame" },
    { id: "noite", titulo: "Ritual da noite", icone: "moon" },
  ];

  const NAV_ICONES = { hoje: "sun", chefoes: "skull", progresso: "trending", metas: "target", ego: "user" };

  // -------- streak (sequência) de um hábito de check --------
  function streak(id) {
    const feito = (k) => {
      const r = Store.estado.registros[k];
      return !!(r && r.checks && r.checks[id]);
    };
    let s = 0;
    const d = new Date();
    if (!feito(Store.chaveDia(d))) d.setDate(d.getDate() - 1); // não zera streak em andamento
    while (feito(Store.chaveDia(d))) { s++; d.setDate(d.getDate() - 1); }
    return s;
  }

  // ======================= TELA HOJE =======================
  function renderHoje() {
    const ego = Store.estado.alterEgo;
    const reg = Store.registro();
    const checks = Store.estado.habitos.filter(h => h.tipo === "check");
    const feitos = checks.filter(h => reg.checks[h.id]).length;
    const total = checks.length || 1;
    const pct = Math.round((feitos / total) * 100);

    const data = new Date().toLocaleDateString("pt-BR",
      { weekday: "long", day: "numeric", month: "long" });

    const nome = ego.nome ? esc(ego.nome) : "Forjador";

    let html = `
      <header class="topo">
        <div class="data">${esc(data)}</div>
        <div class="saudacao">Hoje você é <span class="nome-ego">${nome}</span>.</div>
        ${ego.mantra ? `<div class="mantra">"${esc(ego.mantra)}"</div>` : ""}
      </header>`;

    html += cardRPG();

    if (!ego.nome) {
      html += `
        <div class="aviso-fase">
          Quem você está virando? Comece definindo seu <b>Alter Ego</b>.
          <div style="margin-top:10px"><button class="btn" data-ir="ego">${Icons.svg("user", 18)} Definir meu Alter Ego</button></div>
        </div>`;
    }

    html += `
      <div class="progresso-dia">
        <div class="linha">
          <span class="rotulo">Provas de hoje</span>
          <span class="contagem">${feitos}<span class="total"> / ${checks.length}</span></span>
        </div>
        <div class="barra"><span style="width:${pct}%"></span></div>
      </div>

      <div class="tela-topo" style="margin-top:var(--espaco-g)">
        <div class="grupo-titulo" style="margin:0">Seus hábitos</div>
        <button class="icone-botao ${modoEdicao ? "ativo" : ""}" data-edit title="Editar hábitos">${Icons.svg("pencil", 18)}</button>
      </div>`;

    for (const g of GRUPOS) {
      const lista = Store.estado.habitos.filter(h => h.grupo === g.id);
      if (!lista.length && g.id !== "dia") continue;
      html += `<section class="grupo"><div class="grupo-titulo"><span class="gt-ico">${Icons.svg(g.icone, 15)}</span>${g.titulo}</div>`;
      for (const h of lista) html += cardHabito(h, reg);
      if (g.id === "dia") {
        html += addAberto ? formNovoHabito() :
          `<button class="btn-fantasma" data-add>${Icons.svg("plus", 16)} Adicionar hábito</button>`;
      }
      html += `</section>`;
    }

    el().innerHTML = html;
  }

  // -------- Card do personagem (RPG) --------
  function cardRPG() {
    const ego = Store.estado.alterEgo;
    const s = Store.stats();
    const nome = ego.nome ? esc(ego.nome) : "Forjador";
    const classe = esc(ego.classe || "Forjador");
    const avatar = ego.foto ? `<img src="${ego.foto}" alt="">` : Icons.svg("user", 34);

    // ofensiva = maior streak ativo entre os hábitos de check
    let ofensiva = 0;
    Store.estado.habitos.forEach((h) => {
      if (h.tipo === "check" && h.streak) ofensiva = Math.max(ofensiva, streak(h.id));
    });

    const attrs = Store.ATRIBUTOS.map((a) => `
      <div class="rpg-attr attr-${a.id}">
        <span class="rpg-attr-ico">${Icons.svg(a.icone, 18)}</span>
        <span class="rpg-attr-val">${s.atributos[a.id] || 0}</span>
        <span class="rpg-attr-nome">${a.nome}</span>
      </div>`).join("");

    const chip = (ico, val, rot) =>
      `<div class="rpg-stat"><span class="rpg-stat-ico">${Icons.svg(ico, 15)}</span><b>${val}</b><span>${rot}</span></div>`;

    return `
      <section class="rpg-card">
        <div class="rpg-perfil">
          <div class="rpg-avatar">${avatar}<span class="rpg-nivel-badge">${s.nivel}</span></div>
          <div class="rpg-id">
            <div class="rpg-nome">${nome}</div>
            <div class="rpg-classe">${classe} · Nível ${s.nivel}</div>
          </div>
        </div>
        <div class="rpg-xp">
          <div class="rpg-xp-linha"><span>XP</span><span>${s.xpNoNivel} / ${s.custoNivel}</span></div>
          <div class="barra"><span style="width:${s.pct}%"></span></div>
        </div>
        <div class="rpg-stats">
          ${chip("bolt", s.xpTotal, "XP total")}
          ${chip("trophy", s.nivel, "Nível")}
          ${chip("flame", ofensiva, "Ofensiva")}
        </div>
        <div class="rpg-attrs">${attrs}</div>
      </section>`;
  }

  function cardHabito(h, reg) {
    const marcado = h.tipo === "check" && !!reg.checks[h.id];
    const valor = reg.contadores[h.id] || 0;
    const aguaOk = h.tipo === "contador" && h.meta && valor >= h.meta;

    const chip = (ico, txt, cls = "") =>
      `<span class="sub-item ${cls}">${Icons.svg(ico, 13)}${esc(txt)}</span>`;

    const subs = [];
    if (h.alvo) subs.push(chip("clock", h.alvo));
    if (h.metaSemana) subs.push(chip("repeat", `${h.metaSemana}x/sem`));
    if (h.tipo === "contador" && h.meta) subs.push(chip("target", `meta ${h.meta}`));
    if (h.tipo === "check" && h.streak) {
      const s = streak(h.id);
      if (s > 0) subs.push(chip("flame", `${s} ${s === 1 ? "dia" : "dias"}`, "streak"));
    }

    let direita;
    if (modoEdicao) {
      direita = `<button class="excluir" data-del="${h.id}">${Icons.svg("x", 18)}</button>`;
    } else if (h.tipo === "contador") {
      direita = `
        <div class="contador">
          <button data-dec="${h.id}">${Icons.svg("minus", 18)}</button>
          <span class="valor">${valor}</span>
          <button data-inc="${h.id}">${Icons.svg("plus", 18)}</button>
        </div>`;
    } else {
      direita = `<button class="marcar">${Icons.svg("check", 18)}</button>`;
    }

    return `
      <div class="habito ${marcado || aguaOk ? "feito" : ""}" data-id="${h.id}" data-tipo="${h.tipo}">
        <div class="icone">${Icons.svg(h.icone || "dot", 22)}</div>
        <div class="corpo">
          <div class="nome">${esc(h.nome)}</div>
          ${subs.length ? `<div class="sub">${subs.join("")}</div>` : ""}
        </div>
        ${direita}
      </div>`;
  }

  function formNovoHabito() {
    const picker = Icons.escolhas.map(n =>
      `<button type="button" class="pick ${n === iconeNovo ? "sel" : ""}" data-pick="${n}" title="${n}">${Icons.svg(n, 20)}</button>`
    ).join("");
    return `
      <div class="habito form-novo">
        <input id="nh-nome" placeholder="Nome do hábito (ex: Ler 10 páginas)" />
        <div class="campo-rotulo">Ícone</div>
        <div class="picker" id="nh-picker">${picker}</div>
        <div style="display:flex;gap:10px">
          <select id="nh-tipo">
            <option value="check">Marcar (sim/não)</option>
            <option value="contador">Contador (+/−)</option>
          </select>
          <select id="nh-grupo">
            <option value="dia">Dia</option>
            <option value="manha">Manhã</option>
            <option value="noite">Noite</option>
          </select>
        </div>
        <div class="campo-rotulo">Atributo e dificuldade (quanto XP rende)</div>
        <div style="display:flex;gap:10px">
          <select id="nh-area">
            <option value="disciplina">Disciplina</option>
            <option value="corpo">Corpo</option>
            <option value="mente">Mente</option>
          </select>
          <select id="nh-dif">
            <option value="facil">Fácil · +10</option>
            <option value="medio" selected>Médio · +20</option>
            <option value="dificil">Difícil · +40</option>
          </select>
        </div>
        <div class="linha-botoes">
          <button class="btn-sec" data-add-cancel>Cancelar</button>
          <button class="btn" data-add-salvar>Adicionar</button>
        </div>
      </div>`;
  }

  // ======================= ALTER EGO =======================
  function renderEgo() {
    const e = Store.estado.alterEgo;
    const mioloFoto = e.foto ? `<img src="${e.foto}" alt="foto">` : Icons.svg("user", 32);
    el().innerHTML = `
      <div class="secao-titulo">O Alter Ego</div>
      <div class="secao-ajuda">Quem é o cara que você está construindo? Quanto mais específico, mais fácil virar ele.</div>

      <div class="foto-ego">
        <div class="circulo">${mioloFoto}</div>
        <div style="flex:1">
          <label style="font-size:var(--txt-p);color:var(--cor-texto-fraco);display:block;margin-bottom:6px">Foto / referência</label>
          <input type="file" accept="image/*" id="ego-foto" />
        </div>
      </div>

      <div class="campo">
        <label>Nome dele (o que te dá poder)</label>
        <input data-ego="nome" value="${esc(e.nome)}" placeholder="Ex: Mamba" />
      </div>
      <div class="campo">
        <label>Classe (título do personagem)</label>
        <input data-ego="classe" value="${esc(e.classe || "Forjador")}" placeholder="Ex: Forjador, Guerreiro, Monge" />
      </div>
      <div class="campo">
        <label>Mantra / frase de guerra</label>
        <input data-ego="mantra" value="${esc(e.mantra)}" placeholder="Ex: Disciplina é liberdade." />
      </div>
      <div class="campo"><label>Como ele anda</label><textarea data-ego="anda" placeholder="Postura, presença...">${esc(e.anda)}</textarea></div>
      <div class="campo"><label>Como ele fala</label><textarea data-ego="fala" placeholder="Tom, calma, firmeza...">${esc(e.fala)}</textarea></div>
      <div class="campo"><label>Como ele trata as pessoas</label><textarea data-ego="trata">${esc(e.trata)}</textarea></div>
      <div class="campo"><label>As regras dele (nunca faz / sempre faz)</label><textarea data-ego="regras">${esc(e.regras)}</textarea></div>
      <div class="campo"><label>Onde ele está em 1 ano</label><textarea data-ego="umAno">${esc(e.umAno)}</textarea></div>

      <div class="campo">
        <label>Horário do lembrete do meio do dia</label>
        <input type="time" data-ego="lembreteHora" value="${esc(e.lembreteHora || "14:00")}" />
      </div>
      <div class="aviso-fase">${Icons.svg("bell", 16)} O lembrete "lembra quem você está virando" será <b>ativado na Fase 5</b> (notificações). Por enquanto o horário já fica guardado.</div>

      <div style="margin-top:var(--espaco-g)">
        <div class="grupo-titulo">Ajustes</div>
        <div class="linha-botoes">
          <button class="btn-sec" data-reset-habitos>Restaurar hábitos padrão</button>
          <button class="btn-sec" data-zerar-dia>Zerar o dia de hoje</button>
        </div>
      </div>

      <div style="margin-top:var(--espaco-g);color:var(--cor-texto-apagado);font-size:var(--txt-pp);text-align:center">
        Tudo é salvo automaticamente, só no seu aparelho.
      </div>`;
  }

  // ======================= CHEFÕES =======================
  function renderChefoes() {
    const chefoes = Store.estado.chefoes;
    let html = `
      <div class="secao-titulo">Chefões</div>
      <div class="secao-ajuda">Transforme cada vício num chefão. Resista todo dia pra baixar a vida dele: derrotou = XP; caiu demais = punição.</div>`;

    html += criarBossAberto ? formNovoChefao()
      : `<button class="btn" data-boss-novo>${Icons.svg("plus", 16)} Criar novo chefão</button>`;

    if (!chefoes.length && !criarBossAberto) {
      html += `
        <div class="em-breve" style="padding:40px 10px">
          <span class="emoji">${Icons.svg("skull", 44)}</span>
          <p>Nenhum chefão ainda.<br>Qual vício você vai encarar primeiro?</p>
        </div>`;
    }

    const ativos = chefoes.filter((c) => c.status === "ativo");
    const resolvidos = chefoes.filter((c) => c.status !== "ativo");

    if (ativos.length) {
      html += `<div class="grupo-titulo" style="margin-top:var(--espaco-g)"><span class="gt-ico">${Icons.svg("swords", 15)}</span>Em batalha</div>`;
      ativos.forEach((c) => (html += cardChefao(c)));
    }
    if (resolvidos.length) {
      html += `<div class="grupo-titulo" style="margin-top:var(--espaco-g)"><span class="gt-ico">${Icons.svg("trophy", 15)}</span>Histórico</div>`;
      resolvidos.forEach((c) => (html += cardChefao(c)));
    }

    el().innerHTML = html;
  }

  function cardChefao(c) {
    const r = Store.RARIDADES[c.raridade] || Store.RARIDADES.comum;
    const estrelas = "★".repeat(r.estrelas);
    const vidaPct = Math.max(0, 100 - (c.diasLimpos / c.vidaMax) * 100);
    const jaHoje = c.ultimoDia === Store.chaveDia();

    let selo = "";
    if (c.status === "derrotado") selo = `<span class="boss-selo venceu">${Icons.svg("trophy", 14)} Derrotado</span>`;
    else if (c.status === "caiu") selo = `<span class="boss-selo perdeu">${Icons.svg("skull", 14)} Ele venceu</span>`;

    let acoes = "";
    if (c.status === "ativo") {
      acoes = `
        <div class="linha-botoes">
          <button class="btn-sec" data-boss-recai="${c.id}">Recaí</button>
          <button class="btn" data-boss-resisti="${c.id}" ${jaHoje ? "disabled" : ""}>${jaHoje ? "Resisti hoje ✓" : "Resisti hoje"}</button>
        </div>`;
    } else {
      acoes = `<button class="btn-fantasma" data-boss-remover="${c.id}">${Icons.svg("x", 14)} Remover do histórico</button>`;
    }

    return `
      <div class="boss rar-${c.raridade} st-${c.status}">
        <div class="boss-topo">
          <div class="boss-ico">${Icons.svg("skull", 26)}</div>
          <div class="boss-id">
            <div class="boss-nome">${esc(c.nome)}</div>
            <div class="boss-meta"><span class="boss-rar">${estrelas} ${r.nome}</span>${c.vicio ? ` · ${esc(c.vicio)}` : ""}</div>
          </div>
          ${selo}
        </div>
        <div class="boss-vida">
          <div class="boss-vida-linha"><span>Vida do chefão</span><span>${Math.round(vidaPct)}%</span></div>
          <div class="barra vida"><span style="width:${vidaPct}%"></span></div>
          <div class="boss-sub">${c.diasLimpos}/${c.vidaMax} dias resistidos · ${c.falhas}/${c.falhasPermitidas} falhas</div>
        </div>
        <div class="boss-premios">
          <span class="boss-recompensa">${Icons.svg("bolt", 13)} +${c.recompensaXP} XP</span>
          <span class="boss-punicao">${Icons.svg("bolt", 13)} −${c.punicaoXP} XP</span>
        </div>
        ${acoes}
      </div>`;
  }

  function formNovoChefao() {
    const rars = Object.keys(Store.RARIDADES).map((k) => {
      const r = Store.RARIDADES[k];
      return `<option value="${k}">${"★".repeat(r.estrelas)} ${r.nome} · ${r.vida} dias · +${r.recompensa} XP</option>`;
    }).join("");
    return `
      <div class="habito form-novo">
        <input id="boss-nome" placeholder="Nome do chefão (ex: Senhor do Açúcar)" />
        <input id="boss-vicio" placeholder="Qual vício ele é? (ex: doce, cigarro, rolar o feed)" />
        <div class="campo-rotulo">Raridade — define recompensa, punição e dias pra vencer</div>
        <select id="boss-raridade">${rars}</select>
        <div class="campo-rotulo">Dias pra derrotar (vazio = padrão da raridade)</div>
        <input id="boss-vida" type="number" min="1" placeholder="ex: 30" />
        <div class="linha-botoes">
          <button class="btn-sec" data-boss-cancel>Cancelar</button>
          <button class="btn" data-boss-salvar>Criar chefão</button>
        </div>
      </div>`;
  }

  // ======================= STUB (em breve) =======================
  function renderStub(qual) {
    const info = {
      progresso: { icone: "trending", titulo: "Progresso", txt: "Streaks, calendário de quadradinhos e gráficos. Chega na Fase 2." },
      metas:     { icone: "target",   titulo: "Metas & Áreas", txt: "Metas de 1/2/5 anos, área mais fraca e planejamento de domingo. Fase 3." },
    }[qual];
    el().innerHTML = `
      <div class="em-breve">
        <span class="emoji">${Icons.svg(info.icone, 44)}</span>
        <h2>${info.titulo}</h2>
        <p>${info.txt}</p>
      </div>`;
  }

  // ======================= Render + Nav =======================
  function render() {
    if (view === "hoje") renderHoje();
    else if (view === "chefoes") renderChefoes();
    else if (view === "ego") renderEgo();
    else renderStub(view);
    document.querySelectorAll(".nav .item").forEach(b =>
      b.classList.toggle("ativo", b.dataset.view === view));
  }

  function irPara(v) { view = v; modoEdicao = false; addAberto = false; criarBossAberto = false; render(); window.scrollTo(0, 0); }

  // ------- toast de XP / eventos -------
  function toast(msg) {
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = msg;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add("show"));
    setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 300); }, 1700);
  }

  // ======================= Foto (downscale) =======================
  function lerFoto(file, cb) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const max = 320;
        let { width, height } = img;
        if (width > height && width > max) { height = height * max / width; width = max; }
        else if (height > max) { width = width * max / height; height = max; }
        const c = document.createElement("canvas");
        c.width = width; c.height = height;
        c.getContext("2d").drawImage(img, 0, 0, width, height);
        cb(c.toDataURL("image/jpeg", 0.85));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  // ======================= Eventos =======================
  function ligarEventos() {
    // navegação
    document.querySelectorAll(".nav .item").forEach(b =>
      b.addEventListener("click", () => irPara(b.dataset.view)));

    // cliques dentro da tela (delegação)
    el().addEventListener("click", (ev) => {
      const t = ev.target;
      const achar = (attr) => t.closest(`[${attr}]`);

      if (achar("data-ir")) { irPara(achar("data-ir").dataset.ir); return; }
      if (achar("data-edit")) { modoEdicao = !modoEdicao; addAberto = false; render(); return; }
      if (achar("data-add")) { addAberto = true; iconeNovo = "star"; render(); return; }
      if (achar("data-add-cancel")) { addAberto = false; render(); return; }
      if (achar("data-add-salvar")) { salvarNovoHabito(); return; }

      const pick = achar("data-pick");
      if (pick) {
        iconeNovo = pick.dataset.pick;
        el().querySelectorAll("#nh-picker .pick").forEach(b =>
          b.classList.toggle("sel", b.dataset.pick === iconeNovo));
        return;
      }

      const del = achar("data-del"); if (del) { excluirHabito(del.dataset.del); return; }
      const inc = achar("data-inc"); if (inc) { mudarContador(inc.dataset.inc, +1); return; }
      const dec = achar("data-dec"); if (dec) { mudarContador(dec.dataset.dec, -1); return; }

      // chefões
      if (achar("data-boss-novo")) { criarBossAberto = true; render(); return; }
      if (achar("data-boss-cancel")) { criarBossAberto = false; render(); return; }
      if (achar("data-boss-salvar")) { salvarNovoChefao(); return; }
      const res = achar("data-boss-resisti"); if (res) { fazResisti(res.dataset.bossResisti); return; }
      const rec = achar("data-boss-recai"); if (rec) { fazRecai(rec.dataset.bossRecai); return; }
      const rem = achar("data-boss-remover");
      if (rem) {
        if (confirm("Remover este chefão do histórico?")) { Store.removerChefao(rem.dataset.bossRemover); render(); }
        return;
      }

      // toggle de check: clicar no card
      const card = t.closest(".habito");
      if (card && card.dataset.tipo === "check" && !modoEdicao) {
        toggleCheck(card.dataset.id);
      }

      // ajustes
      if (achar("data-reset-habitos")) {
        if (confirm("Restaurar a lista de hábitos padrão? Seus hábitos personalizados serão substituídos.")) {
          Store.resetHabitos(); render();
        }
        return;
      }
      if (achar("data-zerar-dia")) {
        if (confirm("Apagar as marcações de HOJE?")) { Store.zerarDia(); alert("Dia zerado."); }
        return;
      }
    });

    // inputs do Alter Ego (autosave) + foto — delegação no change/input
    el().addEventListener("input", (ev) => {
      const campo = ev.target.closest("[data-ego]");
      if (campo) {
        Store.estado.alterEgo[campo.dataset.ego] = campo.value;
        Store.salvar();
      }
    });
    el().addEventListener("change", (ev) => {
      if (ev.target.id === "ego-foto" && ev.target.files[0]) {
        lerFoto(ev.target.files[0], (dataURL) => {
          Store.estado.alterEgo.foto = dataURL; Store.salvar(); render();
        });
      }
    });
  }

  // ------- ações de hábito -------
  function toggleCheck(id) {
    const reg = Store.registro();
    const h = Store.estado.habitos.find((x) => x.id === id);
    const ligando = !reg.checks[id];
    if (reg.checks[id]) delete reg.checks[id]; else reg.checks[id] = true;
    Store.salvar(); render();
    if (ligando && h) {
      const xp = Store.xpDoHabito(h);
      if (xp > 0) toast(`${Icons.svg("bolt", 15)} +${xp} XP`);
    }
  }
  function mudarContador(id, delta) {
    const reg = Store.registro();
    const h = Store.estado.habitos.find((x) => x.id === id);
    const antes = reg.contadores[id] || 0;
    const novo = Math.max(0, antes + delta);
    reg.contadores[id] = novo;
    Store.salvar(); render();
    if (h && h.meta && !h.menosEhMelhor && antes < h.meta && novo >= h.meta) {
      const xp = Store.xpDoHabito(h);
      if (xp > 0) toast(`${Icons.svg("bolt", 15)} +${xp} XP · meta!`);
    }
  }
  // ------- ações de chefão -------
  function salvarNovoChefao() {
    const nome = (document.getElementById("boss-nome").value || "").trim();
    if (!nome) { document.getElementById("boss-nome").focus(); return; }
    const vicio = document.getElementById("boss-vicio").value;
    const raridade = document.getElementById("boss-raridade").value;
    const vida = parseInt(document.getElementById("boss-vida").value, 10) || 0;
    Store.criarChefao({ nome, vicio, raridade, vida });
    criarBossAberto = false; render();
  }
  function fazResisti(id) {
    const r = Store.resistiHoje(id);
    render();
    if (r.derrotado) toast(`${Icons.svg("trophy", 15)} Chefão derrotado! +${r.xp} XP`);
    else if (r.ok) toast(`${Icons.svg("swords", 15)} Mais um dia resistido`);
  }
  function fazRecai(id) {
    if (!confirm("Marcar uma recaída? Isso conta como falha contra esse chefão.")) return;
    const r = Store.recai(id);
    render();
    if (r.caiu) toast(`${Icons.svg("skull", 15)} O chefão venceu dessa vez… −${Math.abs(r.xp)} XP`);
  }
  function excluirHabito(id) {
    Store.estado.habitos = Store.estado.habitos.filter(h => h.id !== id);
    Store.salvar(); render();
  }
  function salvarNovoHabito() {
    const nome = (document.getElementById("nh-nome").value || "").trim();
    if (!nome) { document.getElementById("nh-nome").focus(); return; }
    const tipo = document.getElementById("nh-tipo").value;
    const grupo = document.getElementById("nh-grupo").value;
    const area = document.getElementById("nh-area").value;
    const dif = document.getElementById("nh-dif").value;
    const base = { id: "h" + Date.now(), nome, icone: iconeNovo, tipo, grupo, area, dif };
    if (tipo === "check") base.streak = true;
    Store.estado.habitos.push(base);
    Store.salvar();
    addAberto = false; render();
  }

  // ------- start -------
  function iniciar() {
    document.querySelectorAll(".nav .item").forEach(b => {
      const ic = b.querySelector(".ico");
      if (ic) ic.innerHTML = Icons.svg(NAV_ICONES[b.dataset.view] || "dot", 20);
    });
    ligarEventos();
    render();
  }

  return { iniciar };
})();

document.addEventListener("DOMContentLoaded", App.iniciar);

/* ============================================================
   FORJA — Armazenamento (localStorage) + dados padrão + RPG
   Tudo fica no próprio aparelho. Nada vai pra internet.
   ============================================================ */

const Store = (() => {
  const CHAVE = "forja_state_v1";

  // ---- Economia de XP (fácil de ajustar depois) ----
  const XP_POR_DIFICULDADE = { facil: 10, medio: 20, dificil: 40 };

  // custo de XP pra sair do nível n -> n+1 (cresce aos poucos)
  function custoNivel(n) {
    return 60 + (n - 1) * 40;
  }

  // atributos do personagem (3 por enquanto; dá pra expandir pra 5 depois)
  const ATRIBUTOS = [
    { id: "corpo",      nome: "Corpo",      icone: "dumbbell" },
    { id: "mente",      nome: "Mente",      icone: "brain" },
    { id: "disciplina", nome: "Disciplina", icone: "shield" },
  ];

  // raridades dos chefões (define recompensa/punição/estrelas padrão)
  const RARIDADES = {
    comum:    { nome: "Comum",    estrelas: 1, recompensa: 400,  punicao: 150, falhas: 3, vida: 14 },
    raro:     { nome: "Raro",     estrelas: 2, recompensa: 800,  punicao: 250, falhas: 2, vida: 21 },
    epico:    { nome: "Épico",    estrelas: 3, recompensa: 1500, punicao: 400, falhas: 1, vida: 30 },
    lendario: { nome: "Lendário", estrelas: 4, recompensa: 2500, punicao: 600, falhas: 1, vida: 45 },
  };

  // ---- Hábitos padrão (a lista inicial já vem pronta) ----
  // area: corpo | mente | disciplina   |   dif: facil | medio | dificil
  function habitosPadrao() {
    return [
      // Ritual da manhã
      { id: "grat-manha", nome: "Gratidão",            icone: "heart",      tipo: "check",    grupo: "manha", streak: true, area: "mente",      dif: "facil" },
      { id: "meditacao",  nome: "Meditação (5min)",    icone: "wind",       tipo: "check",    grupo: "manha", streak: true, area: "mente",      dif: "medio" },
      { id: "sem-cel",    nome: "Sem celular (30min)", icone: "smartphone", tipo: "check",    grupo: "manha", streak: true, area: "disciplina", dif: "medio" },

      // Hábitos do dia
      { id: "acordar",    nome: "Acordar cedo",            icone: "sunrise",  tipo: "check",    grupo: "dia", streak: true,  alvo: "06:00",   area: "disciplina", dif: "medio" },
      { id: "treino",     nome: "Treinar",                 icone: "activity", tipo: "check",    grupo: "dia", streak: true,  metaSemana: 5,   area: "corpo",      dif: "dificil" },
      { id: "sem-alcool", nome: "Sem álcool",              icone: "wine",     tipo: "check",    grupo: "dia", streak: true,                   area: "disciplina", dif: "medio" },
      { id: "comida",     nome: "Só comida de verdade",    icone: "utensils", tipo: "check",    grupo: "dia", streak: true,                   area: "corpo",      dif: "medio" },
      { id: "skill",      nome: "Aprender algo novo",      icone: "book",     tipo: "check",    grupo: "dia", streak: true,                   area: "mente",      dif: "medio" },
      { id: "area-fraca", nome: "1h na área mais fraca",   icone: "target",   tipo: "check",    grupo: "dia", streak: true,                   area: "mente",      dif: "dificil" },
      { id: "agua",       nome: "Água",                    icone: "droplet",  tipo: "contador", grupo: "dia", meta: 8,                         area: "corpo",      dif: "facil" },
      { id: "lanches",    nome: "Deslizes / lanches",      icone: "cookie",   tipo: "contador", grupo: "dia", menosEhMelhor: true },
      { id: "dormir",     nome: "Hora de dormir",          icone: "moon",     tipo: "check",    grupo: "dia", streak: true,  alvo: "23:00",   area: "corpo",      dif: "medio" },

      // Ritual da noite
      { id: "grat-noite", nome: "Gratidão da noite",       icone: "star",     tipo: "check",    grupo: "noite", streak: true, area: "mente",   dif: "facil" },
    ];
  }

  function estadoInicial() {
    return {
      version: 2,
      alterEgo: {
        nome: "",
        classe: "Forjador",
        foto: "",
        anda: "",
        fala: "",
        trata: "",
        regras: "",
        umAno: "",
        mantra: "",
        lembreteHora: "14:00",
      },
      habitos: habitosPadrao(),
      registros: {}, // { "2026-10-22": { checks: {id:true}, contadores: {id:3} } }
      chefoes: [],   // vícios transformados em bosses (o usuário cria)
      premios: [],   // extrato de XP de chefões: { xp, area, tipo, quando }
    };
  }

  let estado = carregar();

  function carregar() {
    try {
      const bruto = localStorage.getItem(CHAVE);
      if (!bruto) return estadoInicial();
      const dados = JSON.parse(bruto);
      // mescla com o inicial pra não quebrar se faltar campo novo
      const estadoM = Object.assign(estadoInicial(), dados);
      if (!estadoM.alterEgo.classe) estadoM.alterEgo.classe = "Forjador";
      if (!Array.isArray(estadoM.chefoes)) estadoM.chefoes = [];
      if (!Array.isArray(estadoM.premios)) estadoM.premios = [];
      migrarIcones(estadoM);
      migrarAreas(estadoM);
      return estadoM;
    } catch (e) {
      console.warn("Forja: não consegui ler o armazenamento, começando do zero.", e);
      return estadoInicial();
    }
  }

  // Converte ícones antigos (emojis) pros novos nomes de ícone SVG.
  function migrarIcones(est) {
    if (!est || !Array.isArray(est.habitos)) return;
    const valido = (typeof Icons !== "undefined" && Icons.existe) ? Icons.existe : () => true;
    const padrao = {};
    habitosPadrao().forEach((h) => { padrao[h.id] = h.icone; });
    est.habitos.forEach((h) => {
      if (!h.icone || !valido(h.icone)) h.icone = padrao[h.id] || "star";
    });
  }

  // Garante area/dif nos hábitos salvos antes da gamificação.
  function migrarAreas(est) {
    if (!est || !Array.isArray(est.habitos)) return;
    const padrao = {};
    habitosPadrao().forEach((h) => { padrao[h.id] = h; });
    est.habitos.forEach((h) => {
      const ref = padrao[h.id];
      if (h.tipo === "check" || (h.tipo === "contador" && !h.menosEhMelhor)) {
        if (!h.area) h.area = ref ? ref.area : "disciplina";
        if (!h.dif)  h.dif  = ref ? ref.dif  : "facil";
      }
    });
  }

  function salvar() {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(estado));
    } catch (e) {
      console.warn("Forja: não consegui salvar.", e);
    }
  }

  // ---- Datas (sempre hora local, pra não dar erro de fuso) ----
  function chaveDia(data = new Date()) {
    const a = data.getFullYear();
    const m = String(data.getMonth() + 1).padStart(2, "0");
    const d = String(data.getDate()).padStart(2, "0");
    return `${a}-${m}-${d}`;
  }

  function registro(chave = chaveDia()) {
    if (!estado.registros[chave]) {
      estado.registros[chave] = { checks: {}, contadores: {} };
    }
    const r = estado.registros[chave];
    if (!r.checks) r.checks = {};
    if (!r.contadores) r.contadores = {};
    return r;
  }

  // ============================================================
  //  RPG — XP, nível e atributos DERIVADOS do histórico
  // ============================================================

  function xpDoHabito(h) {
    if (!h || !h.dif) return 0;
    return XP_POR_DIFICULDADE[h.dif] || 0;
  }

  // Quanto XP um hábito rendeu num dia (check marcado, ou contador que bateu meta)
  function xpNoDia(h, reg) {
    if (!h || !reg) return 0;
    if (h.tipo === "check") {
      return reg.checks[h.id] ? xpDoHabito(h) : 0;
    }
    if (h.tipo === "contador" && !h.menosEhMelhor && h.meta) {
      const v = reg.contadores[h.id] || 0;
      return v >= h.meta ? xpDoHabito(h) : 0;
    }
    return 0;
  }

  // Converte XP total acumulado em nível + progresso dentro do nível
  function nivelDeXP(xpTotal) {
    let nivel = 1;
    let resto = Math.max(0, xpTotal);
    let custo = custoNivel(nivel);
    while (resto >= custo) {
      resto -= custo;
      nivel++;
      custo = custoNivel(nivel);
    }
    return {
      nivel,
      xpNoNivel: Math.floor(resto),
      custoNivel: custo,
      pct: custo > 0 ? Math.min(100, (resto / custo) * 100) : 0,
    };
  }

  // Estatísticas completas do personagem (recalcula tudo dos registros + prêmios)
  function stats() {
    const porHabito = {};
    estado.habitos.forEach((h) => { porHabito[h.id] = h; });

    const atrib = { corpo: 0, mente: 0, disciplina: 0 };
    let xpHabitos = 0;

    Object.keys(estado.registros).forEach((dia) => {
      const reg = estado.registros[dia];
      if (!reg) return;
      estado.habitos.forEach((h) => {
        const ganho = xpNoDia(h, reg);
        if (ganho > 0) {
          xpHabitos += ganho;
          if (h.area && atrib[h.area] != null) atrib[h.area] += ganho;
        }
      });
    });

    // prêmios/punições de chefões entram no XP total e nos atributos
    let xpPremios = 0;
    (estado.premios || []).forEach((p) => {
      xpPremios += p.xp;
      if (p.area && atrib[p.area] != null) atrib[p.area] += p.xp;
    });

    Object.keys(atrib).forEach((k) => { if (atrib[k] < 0) atrib[k] = 0; });

    const xpTotal = Math.max(0, xpHabitos + xpPremios);
    const nv = nivelDeXP(xpTotal);

    return {
      xpTotal,
      nivel: nv.nivel,
      xpNoNivel: nv.xpNoNivel,
      custoNivel: nv.custoNivel,
      pct: nv.pct,
      atributos: atrib,
    };
  }

  // ============================================================
  //  Chefões (vícios como bosses)
  // ============================================================

  function criarChefao({ nome, vicio, raridade, vida }) {
    const r = RARIDADES[raridade] || RARIDADES.comum;
    const ch = {
      id: "boss-" + Date.now().toString(36),
      nome: (nome || "").trim() || "Chefão",
      vicio: (vicio || "").trim(),
      raridade: raridade in RARIDADES ? raridade : "comum",
      vidaMax: vida && vida > 0 ? vida : r.vida,
      diasLimpos: 0,
      falhasPermitidas: r.falhas,
      falhas: 0,
      recompensaXP: r.recompensa,
      punicaoXP: r.punicao,
      ultimoDia: "",
      status: "ativo", // ativo | derrotado | caiu
      criadoEm: chaveDia(),
    };
    estado.chefoes.push(ch);
    salvar();
    return ch;
  }

  function acharChefao(id) {
    return estado.chefoes.find((c) => c.id === id);
  }

  // marca um dia de resistência; derrota o chefão se zerar a vida
  function resistiHoje(id) {
    const ch = acharChefao(id);
    if (!ch || ch.status !== "ativo") return { ok: false };
    const hoje = chaveDia();
    if (ch.ultimoDia === hoje) return { ok: false, jaFeito: true };
    ch.ultimoDia = hoje;
    ch.diasLimpos++;
    let derrotado = false;
    if (ch.diasLimpos >= ch.vidaMax) {
      ch.status = "derrotado";
      derrotado = true;
      estado.premios.push({ xp: ch.recompensaXP, area: "disciplina", tipo: "recompensa", quando: hoje, chefao: ch.id });
    }
    salvar();
    return { ok: true, derrotado, xp: derrotado ? ch.recompensaXP : 0 };
  }

  // registra uma recaída; se passar das falhas permitidas, o chefão vence
  function recai(id) {
    const ch = acharChefao(id);
    if (!ch || ch.status !== "ativo") return { ok: false };
    ch.falhas++;
    let caiu = false;
    if (ch.falhas > ch.falhasPermitidas) {
      ch.status = "caiu";
      caiu = true;
      estado.premios.push({ xp: -ch.punicaoXP, area: "disciplina", tipo: "punicao", quando: chaveDia(), chefao: ch.id });
    }
    salvar();
    return { ok: true, caiu, xp: caiu ? -ch.punicaoXP : 0 };
  }

  function removerChefao(id) {
    estado.chefoes = estado.chefoes.filter((c) => c.id !== id);
    estado.premios = estado.premios.filter((p) => p.chefao !== id);
    salvar();
  }

  return {
    get estado() { return estado; },
    salvar,
    chaveDia,
    registro,
    habitosPadrao,
    resetHabitos() { estado.habitos = habitosPadrao(); salvar(); },
    zerarDia(chave = chaveDia()) { estado.registros[chave] = { checks: {}, contadores: {} }; salvar(); },

    // RPG
    ATRIBUTOS,
    RARIDADES,
    xpDoHabito,
    stats,
    nivelDeXP,
    criarChefao,
    resistiHoje,
    recai,
    removerChefao,
  };
})();

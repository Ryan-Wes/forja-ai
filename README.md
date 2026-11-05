# 🔥 FORJA

App pessoal de hábitos pra virar a melhor versão de mim mesmo — não é um habit tracker comum. O núcleo é um **Alter Ego** que eu defino, e cada hábito é a prova diária de que estou virando esse cara. Gamificado no estilo RPG: o Alter Ego é o **personagem**, hábitos são **missões** que dão XP, e os vícios viram **chefões** que preciso derrotar.

> PWA, roda no PC e no celular. Offline, sem conta, sem servidor — tudo salvo só no aparelho.

---

## ✨ O que tem

- **Tela Hoje** — hábitos separados por ritual (manhã / dia / noite), com streaks, contadores (água, deslizes) e barra de progresso do dia.
- **Alter Ego** — o personagem que estou construindo: nome, classe, foto, mantra, como ele anda/fala/trata as pessoas, as regras dele e onde ele está em 1 ano.
- **Gamificação RPG**
  - **Nível** e **XP** que sobem conforme cumpro os hábitos.
  - **Atributos** — Corpo, Mente e Disciplina, cada hábito alimenta um deles.
  - XP e atributos são **derivados do histórico** (recalculados dos registros), então sempre batem com o que eu fiz.
- **Chefões** — transformo cada vício num boss com **vida** (dias pra resistir), **raridade** (Comum → Lendário), **recompensa** e **punição** em XP. Resisti todo dia = a vida dele cai; derrotou = XP; recaiu demais = ele vence.

## 🎨 Visual

Dark + dourado/âmbar — o "fogo da forja". Todo o visual mora em variáveis CSS (`css/theme.css`), dá pra trocar o tema inteiro mexendo só num arquivo.

Os ícones são uma biblioteca própria de SVG de linha (estilo minimalista), embutida no projeto — sem CDN, funciona offline.

## 🧱 Stack

HTML, CSS e JavaScript puro. Sem framework, sem build, sem dependência.

```
forja/
├── index.html
├── css/
│   ├── theme.css   # tokens: cores, fontes, espaços (mexe aqui pra trocar o tema)
│   └── app.css     # estilos das telas
├── js/
│   ├── icons.js    # biblioteca de ícones SVG
│   ├── storage.js  # dados + localStorage + regras de XP/nível/chefões
│   └── app.js      # telas e interações
└── CONCEITO.md     # a "planta baixa" do app
```

## ▶️ Rodando

É só abrir o `index.html` no navegador. Pra rodar como app local (recomendado, pra PWA funcionar direito):

```bash
python -m http.server 5173
```

Depois abre `http://localhost:5173`.

## 🗺️ Próximos passos

- Progresso: calendário de quadradinhos e gráficos de streak
- Metas & áreas (1/2/5 anos, área mais fraca, planejamento de domingo)
- Lembrete do meio do dia (notificações)
- Instalável como PWA

---

Projeto pessoal, feito no meu ritmo. A planta completa está em [`CONCEITO.md`](CONCEITO.md).

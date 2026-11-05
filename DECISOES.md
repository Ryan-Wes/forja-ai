# 📓 Diário de decisões — FORJA

Registro das decisões importantes do projeto, pra não esquecer o porquê de cada escolha.
Mais recente em cima. Toda mudança decidida entra aqui com a data.

---

## 2026-11-05

- **Nome confirmado: FORJA** (descartado "Sistema"). Forja conta a história num nome só (fogo que molda metal = disciplina moldando o alter ego), é único/ownável e casa com o tema dark+dourado. Ideia guardada: o "narrador" dentro do app pode falar no estilo *Sistema* (mensagens de missão/level up) pra manter a piscadela ao Solo Leveling sem perder a alma da Forja.

- **Gamificação RPG adicionada.** Escopo da v1 = **"Núcleo + Chefões"**:
  - **Núcleo:** Alter Ego vira personagem com **Nível**, **XP** e **atributos**.
  - **Chefões:** vícios viram bosses pra derrotar.
  - Referências: Life Reset (66 Day Habit) e o app do "Matheus Guerreiro".

- **Atributos: 3 simples — Corpo, Mente, Disciplina.** Escolhido por simplicidade (as referências tinham 5). Ficou *config-driven* pra expandir pra 5 depois (Físico/Mental/Espiritual/Profissional/Financeiro) se valer a pena.

- **Card do personagem = estilo da referência:** foto do alter ego no anel, nome + classe, nível, barra de XP e os 3 atributos, no topo da tela Hoje.

- **Regras de XP:**
  - Cada hábito tem dificuldade: **fácil / médio / difícil = 10 / 20 / 40 XP**.
  - XP e atributos são **derivados do histórico** (recalculados dos registros), nunca um contador solto — assim sempre bate com o que foi feito.
  - Nível com custo crescente: `60 + (n-1)*40` de XP por nível.

- **Chefões (modelo):** raridade **Comum / Raro / Épico / Lendário** (define recompensa, punição e dias pra vencer), **vida** em dias resistidos, **falhas permitidas**. Resistir baixa a vida; derrotar dá XP; estourar as falhas = o chefão vence e pune.

- **Git / versionamento:**
  - Repositório criado: `github.com/Ryan-Wes/forja-ai`.
  - **Commits têm que parecer do Wesley** — nenhuma atribuição ao Claude/IA.
  - **O push é sempre do Wesley** (eu não dou push).
  - Atalho **`git st`** criado (= `git status -sb`); mostrar status + mensagem antes de cada commit.

- **Criado este `DECISOES.md`** pra registrar as decisões daqui pra frente, com datas.

---

## ~2026-10-22 — Base do projeto

- **App = PWA pessoal**, roda no PC e no celular, **offline**, sem conta e sem servidor.
- **Stack:** HTML/CSS/JS puro — **sem framework, sem build**, sem dependência.
- **Persistência:** `localStorage` (chave `forja_state_v1`), dados só no aparelho.
- **Visual:** dark + dourado/âmbar (o "fogo da forja"). **Tudo em variáveis CSS** (`css/theme.css`) pra trocar o tema inteiro num arquivo só.
- **Ícones minimalistas:** biblioteca própria de **SVG de linha** embutida (sem CDN), no lugar dos emojis — o visual com emoji ficava "vibe codado".
- **Dev server:** `python -m http.server 5173`.
- **Núcleo conceitual:** não é habit tracker comum — o centro é o **Alter Ego** e os hábitos são a prova diária de estar virando esse cara (filosofia tipo Atomic Habits / Mamba).

# 🎮 Setup Inventory

Aplicação web para **gerenciamento de inventário, controle financeiro e planejamento de setup multi-plataforma** (PC Gamer, Consoles/PS5, Periféricos, Áudio, Ergonomia e Mobiliário).

Cadastre tudo que você já possui para calcular o **valor total acumulado** com **datas exatas de compra (DD/MM/AAAA)** e mantenha uma **Lista de Desejos** para acompanhar quanto pretende investir nos próximos upgrades.

---

## ✨ Funcionalidades

### Dashboard financeiro
- 🟢 **Total já gasto** — soma exclusiva dos itens comprados.
- 🟡 **Total previsto (wishlist)** — soma dos itens desejados.
- 🔵 **Setup completo** — gasto atual + investimento planejado.
- **Resumo por ecossistema** — quanto foi investido em PC, PS5/Consoles, periféricos, mobiliário e áudio, com barra de progresso gasto × previsto.

### Inventário e wishlist
- Dois status: **Comprado** (inventário atual) e **Desejado** (lista de desejos).
- Campos por status:
  - **Comprado** → preço pago (BRL) + data da compra obrigatória (dia, mês e ano).
  - **Desejado** → preço estimado (BRL), prioridade (Alta/Média/Baixa) e link do produto.
- Plataforma/ecossistema, categoria, imagem (URL externa **ou** upload local convertido em Base64) e observações/loja.
- Botão **“Comprei este item!”** nos cards de desejo: pede o valor final pago e a data exata, e move o item para o inventário automaticamente (mostrando economia ou custo acima do estimado).

### Interface
- Abas rápidas: **Todos**, **Meu Setup (Comprados)** e **Lista de Desejos**, com contadores.
- Cards visuais com foto, tags de ecossistema/categoria, badge de prioridade, data formatada e preço.
- Filtros por plataforma e categoria, busca por nome/loja/categoria (ignora acentos e maiúsculas) e ordenação por data ou valor.
- Dark mode moderno, 100% responsivo (testado a partir de 390 px).

### Persistência e backup
- Dados salvos no **`localStorage`** do navegador, com carregamento feito apenas no cliente para **evitar erros de hidratação/SSR**.
- **Exportar backup (.json)** e **Importar backup (.json)**, com sanitização dos dados importados e mesclagem sem duplicar itens já existentes.

---

## 💻 Stack

| Camada | Tecnologia |
| --- | --- |
| Framework | Next.js 14 (App Router) |
| Linguagem | TypeScript (`strict`) |
| Estilização | Tailwind CSS 3 (dark mode) |
| Ícones | `lucide-react` |
| Deploy | Vercel |

Sem banco de dados, sem variáveis de ambiente e sem dependência de fontes ou APIs externas em build time — o projeto builda e roda offline.

---

## 🚀 Rodando localmente

Requisitos: **Node.js 18.17+**.

```bash
git clone https://github.com/degocardoso/buildpc.git
cd buildpc
npm install
npm run dev
```

Acesse **http://localhost:3000**.

### Scripts

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm start` | Serve o build de produção |
| `npm run lint` | ESLint (`next lint`) |
| `npm run typecheck` | Checagem de tipos (`tsc --noEmit`) |

---

## ▲ Deploy na Vercel

1. Faça o push do repositório para o GitHub.
2. Em [vercel.com/new](https://vercel.com/new), importe o repositório.
3. A Vercel detecta o Next.js automaticamente — **não é preciso configurar nada**:
   - Framework Preset: `Next.js`
   - Build Command: `next build`
   - Output Directory: `.next`
   - Nenhuma variável de ambiente é necessária.
4. Clique em **Deploy**.

A página é renderizada estaticamente (`○ Static`) e toda a lógica roda no cliente, então o app funciona no plano gratuito (Hobby) sem funções serverless.

> ℹ️ Como os dados ficam no `localStorage`, o inventário é **por navegador/dispositivo**. Use **Exportar backup** para levar os dados para outro dispositivo e **Importar backup** para restaurá-los.

---

## 📁 Estrutura

```
app/
  layout.tsx              # Metadata, viewport e tema escuro
  page.tsx                # Página principal: estado da UI, filtros e modais
  globals.css             # Tailwind + classes utilitárias (.field, .btn, .card)
  icon.svg                # Favicon
components/
  Header.tsx              # Cabeçalho, importar/exportar backup e "Novo item"
  Dashboard.tsx           # Cartões financeiros + resumo por ecossistema
  FiltersBar.tsx          # Abas, busca, filtros e ordenação
  ItemCard.tsx            # Card do item e suas ações
  ItemFormModal.tsx       # Formulário de cadastro/edição (campos condicionais)
  PurchaseModal.tsx       # Fluxo "Comprei este item!"
  ConfirmDialog.tsx       # Confirmação de exclusão
  Modal.tsx               # Modal base (ESC, backdrop, trava de scroll)
  Toast.tsx               # Notificações
  EmptyState.tsx          # Estados vazios
hooks/
  useSetupInventory.ts    # Fonte da verdade + persistência segura para SSR
lib/
  analytics.ts            # Totais, resumo por plataforma, filtros e ordenação
  storage.ts              # localStorage, sanitização, backup e Base64
  format.ts               # BRL, datas DD/MM/AAAA e parsing de moeda
  constants.ts            # Opções, estilos e chave do storage
types/
  setup.ts                # Contratos de domínio da aplicação
```

---

## ✅ Qualidade

O projeto foi validado com:

- `npm run build` — build de produção sem erros e **sem warnings**.
- `npm run lint` — “No ESLint warnings or errors”.
- `npm run typecheck` — sem erros de tipo (`strict: true`).
- Teste end-to-end no navegador cobrindo: cadastro de item comprado e desejado, validação da data obrigatória, totais do dashboard, conversão pelo botão “Comprei este item!”, filtros e busca, persistência após reload, exportação/importação de backup, exclusão e responsividade em 390 px — **sem erros no console e sem avisos de hidratação**.

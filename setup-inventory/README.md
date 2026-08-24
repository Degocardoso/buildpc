# 🎮 Setup Inventory

Aplicação web para **gerenciamento de inventário, controle financeiro e planejamento de setup multi-plataforma** (PC Gamer, Consoles/PS5, Periféricos, Áudio, Ergonomia e Mobiliário).

Cadastre tudo que você já possui para calcular o **valor total acumulado** com **datas exatas de compra (DD/MM/AAAA)**, mantenha uma **Lista de Desejos** dos próximos upgrades e **acesse tudo de qualquer dispositivo** com sua conta.

---

## 📖 Índice

- [Funcionalidades](#-funcionalidades)
- [🚀 PASSO A PASSO: acessar de qualquer lugar](#-passo-a-passo-acessar-de-qualquer-lugar) ← **comece por aqui**
- [Rodando localmente](#-rodando-localmente)
- [Como funciona a sincronização](#-como-funciona-a-sincronização)
- [Estrutura do projeto](#-estrutura-do-projeto)
- [Solução de problemas](#-solução-de-problemas)

---

## ✨ Funcionalidades

### Dashboard financeiro
- 🟢 **Total já gasto** — soma exclusiva dos itens comprados.
- 🟡 **Total previsto (wishlist)** — soma dos itens desejados.
- 🔵 **Setup completo** — gasto atual + investimento planejado.
- **Resumo por ecossistema** — quanto foi investido em PC, PS5/Consoles, periféricos, mobiliário e áudio.

### Inventário e wishlist
- Dois status: **Comprado** e **Desejado**, com campos específicos para cada um.
- **Comprado** → preço pago (BRL) + data da compra obrigatória (dia, mês e ano).
- **Desejado** → preço estimado, prioridade (Alta/Média/Baixa) e link do produto.
- Imagem por URL externa **ou** upload local convertido em Base64.
- Botão **"Comprei este item!"** converte um desejo em item do inventário, pedindo o valor final pago e a data.

### ☁️ Acesso de qualquer dispositivo
- Conta com **e-mail e senha** (Supabase Auth).
- O inventário fica salvo na nuvem e sincroniza entre celular, notebook e qualquer navegador.
- **Cada conta enxerga apenas os próprios itens**, garantido por Row Level Security no banco.
- Sem conta configurada, o app funciona normalmente salvando no navegador (modo local).
- Migração com um clique: ao entrar, o app oferece **enviar os itens locais para a nuvem**.

### Interface
- Abas: **Todos**, **Meu Setup** e **Lista de Desejos**, com contadores.
- Filtros por plataforma e categoria, busca que ignora acentos e ordenação por data ou valor.
- Exportar/importar backup `.json`.
- Dark mode moderno e 100% responsivo.

---

## 🚀 PASSO A PASSO: acessar de qualquer lugar

Tempo estimado: **~20 minutos**. Tudo em planos gratuitos, sem cartão de crédito.

Você vai fazer três coisas: criar o banco (Supabase), publicar o site (Vercel) e conectar os dois.

---

### PARTE 1 — Criar o banco de dados (Supabase)

#### Passo 1.1 — Criar a conta e o projeto

1. Acesse **https://supabase.com** e clique em **Start your project**.
2. Entre com sua conta do GitHub.
3. Clique em **New project** e preencha:
   - **Name**: `setup-inventory`
   - **Database Password**: clique em **Generate a password** e **guarde essa senha** num lugar seguro.
   - **Region**: `South America (São Paulo)` — o mais próximo do Brasil.
4. Clique em **Create new project**.

> ⏳ O projeto leva de 1 a 2 minutos para ficar pronto. Aguarde a barra de progresso terminar.

#### Passo 1.2 — Criar a tabela

1. No menu lateral esquerdo, clique em **SQL Editor** (ícone `</>`).
2. Clique em **New query**.
3. Abra o arquivo **`supabase/schema.sql`** deste projeto, **copie todo o conteúdo** e cole no editor.
4. Clique em **Run** (ou pressione `Ctrl + Enter`).

✅ Deve aparecer **"Success. No rows returned"**. Isso é o esperado.

> Esse script cria a tabela `setup_items` e — muito importante — as políticas de segurança que impedem uma conta de ler os itens de outra.

#### Passo 1.3 — Liberar o cadastro sem confirmação de e-mail (recomendado)

Por padrão o Supabase envia um e-mail de confirmação antes de liberar o login. Como esse app é seu, dá para pular essa etapa:

1. No menu lateral, vá em **Authentication** → **Sign In / Providers**.
2. Clique em **Email**.
3. **Desmarque** a opção **Confirm email**.
4. Clique em **Save**.

> 💡 Se preferir manter a confirmação ligada, tudo bem — só lembre de clicar no link que chega no seu e-mail antes do primeiro login.

#### Passo 1.4 — Copiar as chaves de conexão

1. No menu lateral, clique na engrenagem **Project Settings** → **API Keys**.
2. Deixe esta aba aberta. Você vai copiar dois valores no Passo 3.2:
   - **Project URL** — algo como `https://abcdefghijk.supabase.co`
   - **anon public** (ou **publishable**) — uma chave longa

> ⚠️ **Nunca** use a chave `service_role` no app. Ela ignora todas as regras de segurança. Use apenas a `anon`.

---

### PARTE 2 — Publicar o site (Vercel)

#### Passo 2.1 — Subir o código para o GitHub

Se o projeto ainda não está no GitHub:

```bash
cd setup-inventory
git init
git add .
git commit -m "Setup Inventory"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/buildpc.git
git push -u origin main
```

#### Passo 2.2 — Importar na Vercel

1. Acesse **https://vercel.com/new** e entre com o GitHub.
2. Ao lado do repositório `buildpc`, clique em **Import**.
3. A Vercel detecta o Next.js sozinho — **não altere Build Command nem Output Directory**.
4. **Ainda não clique em Deploy.** Siga para o Passo 3.1.

---

### PARTE 3 — Conectar o site ao banco

#### Passo 3.1 — Abrir as variáveis de ambiente

Na mesma tela de importação da Vercel, expanda a seção **Environment Variables**.

#### Passo 3.2 — Cadastrar as duas variáveis

Adicione **exatamente** estes dois nomes (copie e cole para não errar):

| Name | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | o **Project URL** do Passo 1.4 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | a chave **anon public** do Passo 1.4 |

> ⚠️ Os nomes precisam começar com `NEXT_PUBLIC_`. Sem esse prefixo o navegador não enxerga as variáveis e o app cai no modo local.

#### Passo 3.3 — Publicar

Clique em **Deploy** e aguarde 1 a 2 minutos.

Ao final você recebe um endereço como `https://buildpc-seu-usuario.vercel.app`. **Esse é o link do seu app.**

#### Passo 3.4 — Autorizar o endereço no Supabase

Volte ao Supabase para que os links de e-mail apontem para o seu site:

1. **Authentication** → **URL Configuration**.
2. Em **Site URL**, cole o endereço da Vercel (ex.: `https://buildpc-seu-usuario.vercel.app`).
3. Em **Redirect URLs**, clique em **Add URL** e cole o mesmo endereço.
4. Clique em **Save**.

---

### PARTE 4 — Usar no dia a dia

#### No computador
1. Abra o link da Vercel.
2. Clique em **Entrar / criar conta** na faixa azul.
3. Escolha **Criar conta**, informe e-mail e senha (mínimo 6 caracteres) e confirme.
4. Cadastre seus itens normalmente.

> Se você já tinha itens salvos no navegador, aparece um aviso oferecendo **Enviar para a nuvem**. Clique nele para levar tudo para a sua conta.

#### No celular
1. Abra **o mesmo link** no navegador do celular.
2. Clique em **Entrar** e use o **mesmo e-mail e senha**.
3. ✨ Seus itens aparecem automaticamente.

**Dica:** para virar um ícone na tela inicial, use *Adicionar à tela de início* (Safari) ou *Instalar aplicativo* (Chrome). Fica com cara de app nativo.

✅ **Pronto.** Qualquer item cadastrado num dispositivo aparece nos outros — é só recarregar a página.

---

## 💻 Rodando localmente

Requisitos: **Node.js 18.17+**.

```bash
npm install
npm run dev
```

Acesse **http://localhost:3000**.

Sem configuração, o app roda em **modo local** (dados só no navegador) — ótimo para testar.

Para testar a sincronização na sua máquina, crie um arquivo `.env.local` na raiz:

```bash
cp .env.example .env.local
```

Preencha com os valores do Passo 1.4 e rode `npm run dev` de novo.

> O `.env.local` já está no `.gitignore` e nunca vai para o GitHub.

### Scripts

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm start` | Serve o build de produção |
| `npm run lint` | ESLint |
| `npm run typecheck` | Checagem de tipos |

---

## 🔄 Como funciona a sincronização

| | Sem conta (modo local) | Com conta (modo nuvem) |
| --- | --- | --- |
| Onde os dados ficam | `localStorage` do navegador | Banco Postgres no Supabase |
| Acesso de outro aparelho | ❌ | ✅ |
| Precisa de internet | ❌ | ✅ para sincronizar |
| Backup `.json` | ✅ | ✅ |

O app decide o modo sozinho: **logado → nuvem; deslogado → navegador**. O indicador no topo mostra qual está ativo.

**Segurança:** a chave `anon` é pública por design — a proteção real são as políticas de Row Level Security do `schema.sql`, aplicadas dentro do banco. Toda consulta é filtrada por `auth.uid()`, então uma conta jamais recebe as linhas de outra, mesmo que alguém altere o código do navegador.

**Alterações são otimistas:** a tela atualiza na hora e a gravação vai para o banco em seguida. Se a gravação falhar (sem internet, por exemplo), a alteração é desfeita e um aviso explica o motivo — a tela nunca mostra algo que não foi salvo.

---

## 📁 Estrutura do projeto

```
app/
  layout.tsx              # Metadata, viewport e tema escuro
  page.tsx                # Página principal: estado da UI, filtros e modais
  globals.css             # Tailwind + classes utilitárias
  icon.svg                # Favicon
components/
  Header.tsx              # Cabeçalho, status da sincronização, conta e backup
  AuthModal.tsx           # Login, cadastro e recuperação de senha
  SyncBanner.tsx          # Convite para entrar / migrar itens locais
  Dashboard.tsx           # Cartões financeiros + resumo por ecossistema
  FiltersBar.tsx          # Abas, busca, filtros e ordenação
  ItemCard.tsx            # Card do item e suas ações
  ItemFormModal.tsx       # Formulário de cadastro/edição
  PurchaseModal.tsx       # Fluxo "Comprei este item!"
  ConfirmDialog.tsx       # Confirmação de exclusão
  Modal.tsx               # Modal base (ESC, backdrop, trava de scroll)
  Toast.tsx               # Notificações
  EmptyState.tsx          # Estados vazios
hooks/
  useAuth.ts              # Sessão do Supabase Auth
  useSetupInventory.ts    # Fonte da verdade + escolha do repositório
lib/
  repository.ts           # Abstração local ↔ nuvem
  supabase.ts             # Cliente Supabase e tradução de erros
  mappers.ts              # Conversão SetupItem ↔ linha do banco
  analytics.ts            # Totais, resumo por plataforma, filtros e ordenação
  storage.ts              # localStorage, sanitização, backup e Base64
  format.ts               # BRL, datas DD/MM/AAAA e parsing de moeda
  constants.ts            # Opções, estilos e chave do storage
types/
  setup.ts                # Contratos de domínio da aplicação
supabase/
  schema.sql              # Tabela + políticas de segurança (rode no Supabase)
```

---

## 🩺 Solução de problemas

**O app diz "Salvo neste navegador" mesmo depois do deploy**
As variáveis não chegaram ao build. Confira em **Vercel → Settings → Environment Variables** se os nomes estão escritos exatamente como `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Depois vá em **Deployments**, clique nos três pontinhos do último deploy e escolha **Redeploy** — variáveis novas só valem em builds novos.

**"A tabela setup_items não foi encontrada"**
O `schema.sql` não rodou. Refaça o Passo 1.2 colando o arquivo inteiro.

**"Confirme seu e-mail antes de entrar"**
A confirmação está ativa. Clique no link que chegou no seu e-mail, ou desligue a opção conforme o Passo 1.3.

**"Acesso negado pelas políticas de segurança"**
O `schema.sql` rodou pela metade. Execute o arquivo completo de novo — ele foi feito para poder ser reexecutado sem problemas.

**Meus itens antigos sumiram depois do login**
Não sumiram. Os itens locais continuam no navegador; o app mostra os da conta. Use o botão **Enviar para a nuvem** na faixa azul para juntar os dois.

**Item com foto não sincroniza**
Imagens enviadas do computador viram Base64 e podem ficar grandes demais. Prefira colar a **URL da imagem** do site da loja.

---

## ✅ Qualidade

Validado com:

- `npm run build` — produção sem erros e **sem warnings**, com e sem as variáveis do Supabase.
- `npm run lint` — "No ESLint warnings or errors".
- `npm run typecheck` — sem erros de tipo (`strict: true`).
- **Teste end-to-end no modo local** (16 verificações): cadastro, validação de data obrigatória, totais, conversão de desejo em compra, filtros, busca, persistência, backup e responsividade em 390 px.
- **Teste end-to-end da nuvem com dois navegadores independentes** (12 verificações): cadastro e login, item criado no "notebook" aparecendo no "celular", alteração no celular refletida no notebook, exclusão sincronizada, **isolamento entre contas**, logout voltando ao modo local e mensagens de erro traduzidas.

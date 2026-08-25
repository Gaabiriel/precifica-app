# Precifica — Resumo do Projeto

## 1. Visão geral

Sistema SaaS de precificação e controle de estoque para negócios de produção própria
(artesanato, confecção, confeitaria etc.). Nasceu de uma necessidade real: a mãe do
usuário tem um ateliê de bolsas e controlava tudo em uma planilha Excel
(`CUSTOS_BOLSAS.xlsx`, com 21 abas, uma por produto/coleção). O objetivo é substituir
essa planilha por um app web multiusuário, e no futuro vender por assinatura para
outros nichos (o primeiro caso de expansão já mapeado: a cunhada do usuário, que vende
doces finos).

**Stack escolhida (100% gratuita no tier atual):**

- Frontend: React + Vite
- Backend: Supabase (Postgres + Auth + Row Level Security), free tier
- Sem servidor próprio, sem custo de infraestrutura por enquanto

**Pessoas envolvidas:**

- Usuário (dono do projeto) — será administrador do sistema
- Mãe do usuário — primeira usuária real, nicho "Ateliê de Bolsas & Acessórios"
- Cunhada do usuário — segunda usuária prevista, nicho "Confeitaria & Doces Finos"

---

## 2. Modelo de negócio / arquitetura multiusuário

- **Cada usuário escolhe um nicho no cadastro** (dropdown na tela de signup). O nicho
  determina o tema visual (cores) do app inteiro para aquele usuário.
- **Os dados são isolados por usuário** via Row Level Security no Postgres: toda tabela
  de dados de negócio tem uma coluna `owner_id`, e as policies do RLS garantem que
  `owner_id = auth.uid()` (ou seja, cada um só vê os próprios materiais/produtos).
  Isso significa que a mãe e a cunhada podem usar o **mesmo sistema, mesmo banco de
  dados**, sem nunca ver os dados uma da outra.
- **Existe um papel de administrador** (`profiles.role = 'admin'`), que enxerga todos
  os usuários e pode gerenciar nicho, plano e status de assinatura de qualquer um pelo
  painel Admin dentro do próprio app (não é um admin do Supabase, é uma tela do
  aplicativo).
- **Planos de assinatura já modelados** na tabela `subscription_plans` (`free` e `pro`,
  com limites de `max_products` / `max_materials`), pensando em cobrança futura — mas
  **hoje esse limite não é checado em lugar nenhum do código**, é só a estrutura de
  dados pronta para quando isso for implementado.
- **Status de assinatura** (`trialing`, `active`, `past_due`, `canceled`) existe no
  banco e é editável no painel Admin (com rótulos em português na tela: "Em teste",
  "Ativa", "Pagamento atrasado", "Cancelada"), mas **também não bloqueia nada ainda** —
  é só rótulo, à espera de um gateway de pagamento (Stripe, Mercado Pago etc.) que um
  dia vai atualizar isso via webhook e um middleware que vai checar antes de liberar
  ações no app.

---

## 3. Modelo de dados (Postgres / Supabase)

Arquivo: `schema.sql`. Principais tabelas:

| Tabela | Para que serve |
|---|---|
| `niches` | Nichos disponíveis (slug, nome, `theme` em jsonb com as cores) |
| `subscription_plans` | Planos (free/pro), preço, limites |
| `profiles` | 1 linha por usuário do Supabase Auth: nicho, papel (user/admin), plano, status de assinatura, trial |
| `settings` | Parâmetros de precificação, 1 linha por usuário (mão de obra/h, despesas fixas mensais, capacidade de produção mensal, % manutenção, % taxa de cartão, margem padrão, arredondamento ,90) |
| `materials` | Estoque: nome, categoria, unidade de medida, preço/unidade, estoque atual, estoque mínimo, **% de perda/desperdício**, fornecedor, imagem (URL), medida de referência (texto livre vindo da planilha) |
| `material_price_history` | Histórico de preço de cada material, alimentado automaticamente por trigger sempre que `materials.price` muda |
| `products` | Produto/ficha técnica: nome, imagem, tempo de produção (min), notas, margem (override do padrão), preço de venda manual (override do calculado), `is_kit` (booleano), contagem de produzidos |
| `product_materials` | Itens da ficha técnica (BOM): produto × material × quantidade |
| `product_kit_items` | Quando `is_kit = true`: quais outros produtos compõem o kit e em que quantidade |
| `production_log` | Histórico de produção (baixa de estoque), snapshot de custo na hora |
| `quotes` | Orçamentos salvos para clientes (nome, contato, itens em jsonb, total) |

**Funções/triggers importantes:**

- `handle_new_user()` — dispara ao criar usuário no Supabase Auth; lê `niche_slug` e
  `full_name` dos metadados do signup e já cria a linha em `profiles` e `settings`
  automaticamente, com 14 dias de trial.
- `log_material_price_change()` — dispara **AFTER INSERT/UPDATE** em `materials`
  (⚠️ já corrigimos um bug em que estava como `BEFORE`, o que quebrava a foreign key
  porque o material ainda não existia na tabela no momento do trigger — ver seção 6).
- `is_admin()` — função usada nas policies de RLS para liberar acesso total a quem tem
  `role = 'admin'`.

**RLS:** habilitado em todas as tabelas de negócio. Regra geral: `owner_id = auth.uid()
OR is_admin()`. `niches` e `subscription_plans` são de leitura livre para qualquer
autenticado, escrita só por admin.

---

## 4. Motor de precificação (`src/pricing.js`)

Lógica de cálculo, parametrizada pelas configurações de cada usuário (`settings`):

```
custo materiais = Σ (preço do material × quantidade usada × (1 + % de perda/100))
mão de obra      = (minutos de produção / 60) × custo da hora configurado
manutenção       = (custo materiais + mão de obra) × % de manutenção configurado
rateio despesas  = despesas fixas mensais ÷ capacidade de produção mensal (unidades)
─────────────────────────────────────────────
custo total (subtotal) = soma de tudo acima
margem = % configurado no produto (ou o padrão do usuário, se não sobrescrito)
preço antes de taxas = custo total × (1 + margem/100)
taxa de cartão/marketplace = preço antes de taxas × % configurado
preço sugerido = preço antes de taxas + taxa de cartão
preço arredondado = arredonda pra baixo terminando em ",90" (se a opção estiver ligada)
preço final = preço de venda manual, se o produto tiver um override; senão, o arredondado
lucro = preço final − custo total
margem real = lucro / custo total (em %)
```

**Kits:** quando `product.is_kit = true`, em vez de somar o preço de venda dos produtos
componentes, o sistema soma o **custo (subtotal)** de cada produto componente × sua
quantidade no kit — evitando cobrar margem em cascata (margem sobre margem). O kit pode
ainda ter materiais próprios (ex.: embalagem específica do kit) somados a esse custo.
Isso é calculado recursivamente por `computeProductCost()`.

---

## 5. Frontend — estrutura e funcionalidades

```
src/
  supabaseClient.js     → cliente Supabase, lê variáveis de ambiente VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
  pricing.js             → motor de cálculo descrito acima
  theme.js                → paleta de fallback + lista de nichos disponíveis no cadastro
  App.jsx                 → autenticação (via Supabase Auth), carregamento de todos os dados do usuário logado, navegação por abas
  components/ui.jsx        → componentes visuais reutilizáveis (Card, Button, Modal, Field, StatCard, Row, inputStyle, iconBtn)
  pages/
    Login.jsx              → tela de login/cadastro (cadastro pede nome, nicho e cria a conta via supabase.auth.signUp)
    Dashboard.jsx           → cards de resumo (produtos, valor em estoque, margem média, alertas de estoque baixo) + gráfico de barras custo×venda por produto
    Materials.jsx           → CRUD de materiais, campo de % de perda, botão de histórico de preço (abre gráfico de linha com os dados de material_price_history)
    Products.jsx            → CRUD de produtos, ficha técnica (adicionar/remover materiais com quantidade), toggle "é um kit" (troca pra selecionar outros produtos + quantidade), botão "Produzir" que dá baixa no estoque
    Quotes.jsx               → montar orçamento (produto + quantidade), gerar PDF via jsPDF, salvar orçamento no banco, lista dos últimos orçamentos
    SettingsPage.jsx          → formulário dos parâmetros de precificação (settings)
    Admin.jsx                 → (só visível para role='admin') lista de usuários com nicho/plano/status/papel editáveis, e lista dos planos disponíveis
```

**Tema por nicho:** cada nicho tem uma paleta de cores própria (guardada em
`niches.theme` como jsonb), pensada para ser sóbria e "sem cores fortes" (pedido
explícito do usuário) mas ainda assim reforçar a identidade do segmento:

- **Ateliê de Bolsas & Acessórios**: tons terracota/areia/marrom (elegante, "premium")
- **Confeitaria & Doces Finos**: tons rosé/caramelo suaves (não vermelho saturado tipo
  fast-food — a decisão consciente foi usar uma paleta "boutique/gourmet", já que o
  usuário pediu cores discretas)
- **Genérico**: tons neutros verde-acinzentado, para qualquer outro nicho futuro

**PWA:** `public/manifest.json` + `public/sw.js` (service worker simples de cache) para
permitir "instalar" o app no celular. Sem ícones customizados ainda (array `icons`
ficou vazio de propósito para não gerar warning no console — precisa gerar/adicionar
ícones reais depois).

---

## 6. Migração dos dados da planilha original

Um script Python (não faz parte do app, rodado uma única vez) leu as 21 abas de
`CUSTOS_BOLSAS.xlsx` e extraiu:

- **81 materiais únicos** (deduplicados por nome), com preço, unidade estimada e
  categoria (inferida por palavras-chave: Tecido/Sintético, Aviamento/Metal, Alças,
  Embalagem)
- **48 produtos/variações** (cada aba podia ter mais de um produto — ex.: a aba "Kit
  Sintético" continha "Necessaire Box", "Necessaire Carteira" e "Bolsa de Praia" como
  itens separados), cada um com sua ficha técnica completa (quais materiais usa e em
  que quantidade) e o preço de venda que já estava na planilha

Isso virou o arquivo `seed_bolsas.sql` — um script SQL que insere tudo isso pronto para
um usuário específico (`OWNER_UUID` precisa ser substituído pelo ID real do usuário
depois que a conta é criada).

**Limitação conhecida da migração:** a planilha original não registrava "tempo de
produção" em minutos reais, só uma fração proporcional ao custo. Por isso, todo produto
migrado entrou com **30 minutos fixos** de mão de obra (placeholder) e **estoque
zerado** — isso precisa ser revisado manualmente pela usuária final antes de confiar
100% nos preços sugeridos pelo sistema.

---

## 7. Bugs já encontrados e corrigidos

1. **Trigger de histórico de preço quebrando a FK** — o trigger
   `log_material_price_change()` estava configurado como `BEFORE INSERT`, tentando
   gravar em `material_price_history` uma referência a um material que ainda não
   tinha sido persistido na tabela `materials` (a FK só é satisfeita depois que a
   linha existe de fato). Corrigido trocando para `AFTER INSERT OR UPDATE`, e o
   `updated_at` foi separado para seu próprio trigger `BEFORE UPDATE`. Existe um
   script `fix_price_history_trigger.sql` para quem já tinha rodado o schema antigo.
2. **`.env` não configurado** — erro `supabaseUrl is required` na primeira execução;
   resolvido com o passo a passo de criar `.env` a partir do `.env.example` com as
   credenciais reais do projeto Supabase.
3. **Warning de ícone do manifest** — `icon-192.png` não existia; resolvido deixando
   `icons: []` no `manifest.json` até existirem ícones reais.

---

## 8. O que já está pronto (features implementadas)

- [x] Autenticação multiusuário (Supabase Auth) com nicho escolhido no cadastro
- [x] Isolamento de dados por usuário via Row Level Security
- [x] Painel Admin (gerenciar nicho/plano/status/papel de qualquer usuário)
- [x] Estrutura de planos de assinatura (sem cobrança real ainda)
- [x] CRUD de materiais com controle de estoque e estoque mínimo (alerta no dashboard)
- [x] % de perda/desperdício por material, considerado no cálculo de custo
- [x] Histórico de preço por material (gráfico)
- [x] CRUD de produtos com ficha técnica (BOM) e cálculo de preço em tempo real
- [x] Produtos do tipo kit (compostos por outros produtos, sem margem em cascata)
- [x] Registrar produção → baixa automática de estoque dos materiais usados
- [x] Motor de precificação parametrizável (mão de obra, manutenção, despesas fixas
      rateadas, taxa de cartão/marketplace, margem, arredondamento ,90)
- [x] Geração de orçamento em PDF para cliente (jsPDF) + histórico de orçamentos salvos
- [x] Dashboard com gráfico de custo × preço de venda e alertas de estoque baixo
- [x] Tema visual diferente por nicho
- [x] PWA instalável (manifest + service worker básico)
- [x] Dados reais da planilha migrados (81 materiais, 48 produtos)

## 9. O que ainda falta (próximos passos sugeridos, não implementados)

- [ ] **Checagem real de limite de plano** — hoje `max_products`/`max_materials` da
      tabela `subscription_plans` não bloqueia nada; falta o código que compara e
      impede cadastrar mais do que o plano permite
- [ ] **Bloqueio por status de assinatura** — `past_due`/`canceled` hoje não restringem
      acesso; é só um rótulo
- [ ] **Checkout de pagamento de verdade** (Stripe, Mercado Pago ou similar) integrado
      via webhook, atualizando `subscription_status` automaticamente
- [ ] **Upload de imagem real** — hoje materiais/produtos só aceitam URL de imagem;
      falta integrar Supabase Storage (também free tier) para upload de arquivo
- [ ] **Notificação de estoque baixo** por e-mail/WhatsApp
- [ ] **Relatórios exportáveis** (lucro mensal, produtos mais vendidos) em PDF/Excel
- [ ] **Ícones reais do PWA** (hoje `icons: []` no manifest)
- [ ] Revisar manualmente o **tempo de produção** e o **estoque inicial** de cada
      produto/material migrado da planilha (hoje com valores placeholder)

---

## 10. Estrutura de arquivos do projeto

```
precifica-app/
  schema.sql                      → schema completo do banco (rodar primeiro, no SQL Editor do Supabase)
  fix_price_history_trigger.sql    → correção do bug do trigger (só necessário se já rodou o schema antigo)
  seed_bolsas.sql                  → dados migrados da planilha (rodar depois de criar o 1º usuário, substituindo OWNER_UUID)
  package.json
  vite.config.js
  index.html
  .env.example                     → modelo de variáveis de ambiente (copiar para .env com valores reais)
  public/
    manifest.json                  → configuração do PWA
    sw.js                          → service worker (cache básico offline)
  src/
    main.jsx                       → bootstrap do React + registro do service worker
    supabaseClient.js
    pricing.js
    theme.js
    App.jsx
    components/ui.jsx
    pages/
      Login.jsx
      Dashboard.jsx
      Materials.jsx
      Products.jsx
      Quotes.jsx
      SettingsPage.jsx
      Admin.jsx
  README.md                        → passo a passo completo de setup (criar projeto Supabase, rodar schema, configurar .env, migrar dados, criar admin)
```

## 11. Como rodar do zero (resumo do README)

1. Criar projeto no Supabase (free tier)
2. Rodar `schema.sql` no SQL Editor
3. `npm install` → copiar `.env.example` para `.env` com URL e chave anon reais →
   `npm run dev`
4. Criar a primeira conta pelo próprio app (tela de cadastro), escolhendo o nicho
5. Pegar o `id` desse usuário em `select id, email from auth.users;`, colar em
   `seed_bolsas.sql` no lugar de `OWNER_UUID`, rodar o script
6. Tornar alguém admin: `update public.profiles set role = 'admin' where email = '...'`

---

## 12. Decisões de design importantes (para manter consistência ao continuar o projeto)

- **Paleta de cores sóbria por nicho** — pedido explícito do usuário foi "sem cores
  fortes". Evitar tons saturados tipo vermelho puro, mesmo em nichos onde isso seria
  comum no mercado (ex.: fast-food/doces geralmente usam vermelho vibrante — aqui foi
  usado rosé/caramelo suave de propósito).
- **Margem calculada como markup sobre o custo** (`custo × (1 + margem%)`), não como
  margem sobre o preço de venda — isso replica a lógica original da planilha da mãe do
  usuário (coluna "Margem" era um multiplicador tipo 1.0 = 100% de markup).
- **Kits não compõem margem em cascata** — decisão de design para evitar preços
  irreais quando um kit reúne vários produtos que já têm sua própria margem embutida.
- **Tudo parametrizável por usuário**, nunca hardcoded — reflete o pedido original de
  "um sistema todo parametrizado aonde eu possa configurar tudo".

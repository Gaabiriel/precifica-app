# Precifica

Sistema de precificação e controle de estoque para negócios artesanais/produção própria
(bolsas, doces finos, e qualquer outro nicho). Multiusuário, com nicho definido no
cadastro, painel de admin para gerenciar assinaturas, e todos os dados da planilha
`CUSTOS_BOLSAS.xlsx` já migrados.

Stack 100% gratuita: **React + Vite** (frontend) e **Supabase** (Postgres + Auth,
free tier). Sem custo de servidor.

---

## 1. Criar o banco de dados (Supabase — grátis)

1. Crie uma conta em [supabase.com](https://supabase.com) e um novo projeto (free tier).
2. No painel do projeto, abra **SQL Editor** → **New query**.
3. Cole e rode o conteúdo de `schema.sql` (cria tabelas, RLS, triggers, nichos e planos).
4. Ainda não rode `seed_bolsas.sql` — ele precisa do ID de um usuário que ainda não existe.

## 2. Configurar o frontend

```bash
npm install
cp .env.example .env
```

Edite `.env` com a URL e a chave `anon` do seu projeto (Project Settings → API):

```
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
```

```bash
npm run dev
```

Abra o link que aparecer (geralmente `http://localhost:5173`).

## 3. Criar a primeira conta (sua mãe) e migrar os dados

1. Na tela de cadastro, crie a conta dela escolhendo o nicho **"Ateliê de Bolsas & Acessórios"**.
2. Se o Supabase pedir confirmação por e-mail, confirme (ou desative essa exigência em
   **Authentication → Providers → Email → Confirm email**, útil para testes).
3. No **SQL Editor** do Supabase, rode:
   ```sql
   select id, email from auth.users;
   ```
   Copie o `id` da conta dela.
4. Abra `seed_bolsas.sql`, troque `OWNER_UUID` por esse id, e rode o script inteiro no
   SQL Editor. Isso cadastra os **81 materiais** e **48 produtos** extraídos da planilha
   (com ficha técnica/BOM completa).
5. Faça login no app com essa conta — os dados já aparecem em Materiais e Produtos.

> Os produtos migrados vêm com **tempo de produção estimado em 30 min** (a planilha
> original não registrava minutos reais, só uma proporção de custo) e **estoque
> zerado** — ajuste esses dois campos conforme a realidade antes de confiar 100% nos
> números.

## 4. Tornar alguém admin

```sql
update public.profiles set role = 'admin' where email = 'seu-email@exemplo.com';
```

Quem for admin vê a aba **Admin**: lista de usuários, nicho, plano e status de
assinatura de cada um, e pode alterar qualquer um desses campos.

## 5. Cadastrar sua cunhada (nicho de doces)

Ela cria a própria conta escolhendo **"Confeitaria & Doces Finos"** — os dados dela
ficam completamente isolados dos da sua mãe (cada linha das tabelas tem `owner_id`,
protegido por Row Level Security), mas o mesmo sistema, com um tema visual diferente,
atende as duas.

---

## O que já está implementado

- **Multiusuário real** — Supabase Auth + RLS; cada usuário só vê seus próprios dados.
- **Nicho definido no cadastro**, controla o tema visual (cores por `niches.theme`).
- **Painel Admin** — gerencia usuários, nicho, plano e status de assinatura.
- **Planos de assinatura** (`subscription_plans`) — free e pro já cadastrados, prontos
  para conectar um checkout (Stripe, Mercado Pago etc.) no futuro.
- **Materiais com estoque, % de perda/desperdício e histórico de preço** automático.
- **Produtos com ficha técnica (BOM)**, cálculo de custo parametrizado (mão de obra,
  manutenção, rateio de despesas fixas, taxa de cartão, margem, arredondamento).
- **Kits** — produtos compostos por outros produtos, sem cobrar margem em cascata.
- **Registrar produção** — baixa automática de estoque dos materiais usados.
- **Orçamentos em PDF** para enviar ao cliente, com histórico salvo.
- **PWA básico** (`manifest.json` + service worker) — dá para "instalar" no celular.
- **Dados reais migrados** da planilha (81 materiais, 48 produtos/variações).

## Próximos passos sugeridos (não implementados ainda)

- Checkout de assinatura de verdade (Stripe/Mercado Pago) ligado a `subscription_plans`.
- Upload de imagem real (Supabase Storage, free tier) em vez de URL manual.
- Notificação por e-mail/WhatsApp quando um material atingir o estoque mínimo.
- Exportar relatório mensal (lucro, produtos mais vendidos) em PDF/Excel.
- App mobile nativo (hoje é PWA instalável, o que já cobre boa parte do caso de uso).

## Estrutura do projeto

```
schema.sql              → banco de dados completo (rode primeiro)
seed_bolsas.sql          → dados migrados da planilha (rode depois de criar 1 usuário)
src/
  supabaseClient.js      → conexão com o Supabase
  pricing.js             → motor de cálculo de custo/preço (materiais, kits, desperdício)
  theme.js               → paleta de fallback + nichos disponíveis no cadastro
  App.jsx                → autenticação, carregamento de dados, navegação
  components/ui.jsx       → componentes visuais reutilizáveis
  pages/
    Login.jsx
    Dashboard.jsx
    Materials.jsx        → estoque + histórico de preço
    Products.jsx         → ficha técnica, kits, registrar produção
    Quotes.jsx           → orçamento em PDF
    SettingsPage.jsx      → parâmetros de precificação
    Admin.jsx            → gestão de usuários/planos
```

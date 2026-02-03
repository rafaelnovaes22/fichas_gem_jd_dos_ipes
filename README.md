# GEM - Sistema de Gestão de Ensino Musical

Sistema web para acompanhamento de alunos de música da Congregação Cristã no Brasil, baseado na Ficha de Acompanhamento M11.

## 🚀 Tecnologias

- **Frontend**: Next.js 14 + TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui
- **Backend**: Next.js API Routes
- **Banco de Dados**: PostgreSQL + Prisma ORM
- **Autenticação**: NextAuth.js
- **Deploy**: Railway

## 📋 Funcionalidades

- ✅ Autenticação com email/senha
- ✅ CRUD de Alunos
- ✅ CRUD de Instrutores
- ✅ Fichas de Acompanhamento (M11)
- ✅ Registro de Aulas Teóricas
- ✅ Registro de Avaliações
- ✅ Dashboard Administrativo
- 🔲 Relatórios em PDF
- 🔲 Exportação Excel

## 🏃‍♂️ Como Executar

### Pré-requisitos

- Node.js 18+
- PostgreSQL (ou conta no Railway)

### Instalação

```bash
# Clonar o repositório
git clone https://github.com/seu-usuario/fichas-gem.git

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas configurações

# Gerar cliente Prisma
npm run postinstall

# Executar migrations
npm run db:push

# Popular banco com dados iniciais
npm run db:seed

# Iniciar servidor de desenvolvimento
npm run dev
```

### Variáveis de Ambiente

```env
DATABASE_URL="postgresql://user:password@host:port/database"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua-chave-secreta"
```

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── (auth)/login/       # Página de login
│   ├── api/                # API Routes
│   │   ├── auth/           # NextAuth
│   │   ├── alunos/         # CRUD alunos
│   │   └── fichas/         # Fichas e aulas
│   └── dashboard/          # Área autenticada
│       ├── alunos/         # Gestão de alunos
│       ├── fichas/         # Fichas de acompanhamento
│       ├── instrutores/    # Gestão de instrutores
│       └── relatorios/     # Relatórios
├── components/
│   ├── layout/             # Sidebar, Header
│   ├── providers/          # Auth Provider
│   └── ui/                 # Componentes Shadcn
├── lib/
│   ├── auth.ts             # Configuração NextAuth
│   ├── prisma.ts           # Cliente Prisma
│   └── utils.ts            # Utilitários
└── types/                  # TypeScript types
```

## 👤 Credenciais de Teste

Após executar o seed:

```
Admin: admin@gem.com.br / admin123
Instrutor: instrutor@gem.com.br / admin123
```

## 📄 Licença

Este projeto é de uso interno da Congregação Cristã no Brasil.

---

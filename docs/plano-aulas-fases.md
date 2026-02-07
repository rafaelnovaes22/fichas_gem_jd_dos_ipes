# Plano de Implementação - Telas de Fases e Aulas

## Visão Geral

Criação das telas iniciais para gerenciamento de:
1. **Fases** - Fases do método MSA (Música e Solfejo para Adultos)
2. **Aulas** - Cadastro de aulas teóricas disponíveis

---

## PARTE 1: TELAS DE FASES (Fases MSA)

### Contexto
As fases são os níveis do método MSA (ex: Fase 1 - Iniciação, Fase 2 - Aprendizagem, etc). Cada fase possui tópicos associados.

### Modelo de Dados Existente
```prisma
model Fase {
  id        String  @id @default(cuid())
  nome      String  @unique
  descricao String?
  ordem     Int
  ativo     Boolean @default(true)
  alunos    Aluno[]
  topicos   TopicoMSA[]
}
```

### APIs Existentes
- ✅ `GET /api/fases` - Listar fases
- ✅ `POST /api/fases` - Criar fase
- ✅ `GET /api/fases/[id]` - Buscar fase
- ✅ `PUT /api/fases/[id]` - Atualizar fase
- ✅ `DELETE /api/fases/[id]` - Desativar fase

### Telas a Criar

#### 1.1 - Listagem de Fases
**Arquivo:** `src/app/dashboard/fases/page.tsx`

**Funcionalidades:**
- Lista de fases em ordem crescente (por campo `ordem`)
- Card por fase mostrando:
  - Número da fase (círculo com ordem)
  - Nome da fase
  - Descrição (se houver)
  - Quantidade de alunos nesta fase
  - Quantidade de tópicos cadastrados
- Botão "Nova Fase" (apenas ADMIN)
- Ações: Editar, Desativar (apenas ADMIN)

**Layout:**
```
┌─────────────────────────────────────────────┐
│ Fases MSA                              [+] │
├─────────────────────────────────────────────┤
│                                             │
│  ┌────┐  Fase 1 - Iniciação            [⋯] │
│  │ 01 │  Introdução à música                │
│  └────┘  12 alunos • 8 tópicos              │
│                                             │
│  ┌────┐  Fase 2 - Aprendizagem         [⋯] │
│  │ 02 │  Desenvolvimento musical            │
│  └────┘  8 alunos • 12 tópicos              │
│                                             │
└─────────────────────────────────────────────┘
```

---

#### 1.2 - Nova Fase
**Arquivo:** `src/app/dashboard/fases/novo/page.tsx`

**Campos do Formulário:**
| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| Ordem | Number | Sim | Único, mínimo 1 |
| Nome | String | Sim | Mínimo 3 caracteres |
| Descrição | Textarea | Não | Máximo 500 caracteres |

**Regras:**
- Campo "Ordem" deve verificar se já existe fase com mesmo número
- Sugerir próxima ordem automaticamente

---

#### 1.3 - Editar Fase
**Arquivo:** `src/app/dashboard/fases/[id]/page.tsx` ou `src/app/dashboard/fases/[id]/editar/page.tsx`

**Funcionalidades:**
- Formulário pré-preenchido com dados da fase
- Seção para gerenciar tópicos da fase:
  - Listar tópicos existentes
  - Adicionar novo tópico
  - Editar tópico
  - Remover tópico

**Tópicos MSA (sub-entidade):**
```prisma
model TopicoMSA {
  id        String @id @default(cuid())
  faseId    String
  numero    String // Ex: "1.1", "2.3"
  titulo    String
  descricao String?
}
```

**Layout da Aba de Tópicos:**
```
┌─────────────────────────────────────────────┐
│ Editar Fase 1 - Iniciação                   │
├─────────────────────────────────────────────┤
│ [Dados da Fase] [Tópicos]                   │
├─────────────────────────────────────────────┤
│                                             │
│ Tópicos da Fase                        [+] │
│                                             │
│ ┌─────────────────────────────────────┐    │
│ │ 1.1 - Música e Som             [✎][🗑]  │
│ │ 1.2 - Ritmo e Movimento        [✎][🗑]  │
│ │ 1.3 - Altura Musical           [✎][🗑]  │
│ └─────────────────────────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

---

## PARTE 2: TELAS DE AULAS (Aulas Teóricas)

### Contexto
Cadastro de aulas teóricas disponíveis no sistema. Cada aula pode ser associada a uma ou mais fichas de alunos.

### Modelo de Dados a Criar
```prisma
model Aula {
  id          String   @id @default(cuid())
  numero      Int      @unique // Número sequencial da aula
  titulo      String   // Título da aula
  descricao   String?  // Descrição detalhada
  conteudo    String?  // Conteúdo programático
  cargaHoraria Int     @default(60) // Em minutos

  // Relacionamentos
  fichas      FichaAcompanhamento[]

  ativo       Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("aulas")
}
```

### APIs a Criar
- `GET /api/aulas` - Listar aulas
- `POST /api/aulas` - Criar aula
- `GET /api/aulas/[id]` - Buscar aula
- `PUT /api/aulas/[id]` - Atualizar aula
- `DELETE /api/aulas/[id]` - Desativar aula

### Telas a Criar

#### 2.1 - Listagem de Aulas
**Arquivo:** `src/app/dashboard/aulas/page.tsx`

**Funcionalidades:**
- Lista de aulas em ordem numérica
- Card por aula mostrando:
  - Número da aula
  - Título
  - Descrição resumida
  - Carga horária
  - Quantidade de fichas usando esta aula
- Botão "Nova Aula" (ADMIN/INSTRUTOR)
- Busca por título
- Ações: Ver, Editar, Desativar

**Layout:**
```
┌─────────────────────────────────────────────┐
│ Aulas Teóricas                         [+] │
├─────────────────────────────────────────────┤
│ [🔍 Buscar por título...]                   │
├─────────────────────────────────────────────┤
│                                             │
│ ┌─────────────────────────────────────┐     │
│ │ AULA 01                        [⋯]  │     │
│ │ Introdução à Teoria Musical           │     │
│ │ Conceitos básicos de música...        │     │
│ │ 60 min • 5 fichas                     │     │
│ └─────────────────────────────────────┘     │
│                                             │
│ ┌─────────────────────────────────────┐     │
│ │ AULA 02                        [⋯]  │     │
│ │ Notas e Escalas                       │     │
│ │ Apresentação das notas musicais...    │     │
│ │ 60 min • 3 fichas                     │     │
│ └─────────────────────────────────────┘     │
│                                             │
└─────────────────────────────────────────────┘
```

---

#### 2.2 - Nova Aula
**Arquivo:** `src/app/dashboard/aulas/novo/page.tsx`

**Campos do Formulário:**
| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| Número | Number | Sim | Único, auto-sugerido |
| Título | String | Sim | Mínimo 3 caracteres |
| Descrição | Textarea | Não | Máximo 255 caracteres |
| Conteúdo | Rich Text | Não | Editor simples |
| Carga Horária | Number | Sim | Min: 15, Max: 180 min |

---

#### 2.3 - Visualizar Aula
**Arquivo:** `src/app/dashboard/aulas/[id]/page.tsx`

**Funcionalidades:**
- Exibir todos os dados da aula
- Histórico de fichas que usaram esta aula
- Estatísticas de aprovação/reprovação
- Botões: Editar, Voltar

---

#### 2.4 - Editar Aula
**Arquivo:** `src/app/dashboard/aulas/[id]/editar/page.tsx`

**Funcionalidades:**
- Formulário pré-preenchido
- Validações iguais ao cadastro
- Opção de desativar aula

---

## PARTE 3: INTEGRAÇÕES COM FICHAS

### Associar Aula à Ficha
Na tela de fichas (`/dashboard/fichas/[id]`), adicionar:
- Select para escolher a aula teórica associada
- Mostrar conteúdo da aula em um modal/expansão

### Associar Tópico MSA à Aula
Na ficha de acompanhamento, permitir:
- Selecionar tópico MSA baseado na fase do aluno
- Filtrar tópicos por fase automaticamente

---

## PARTE 4: ESTRUTURA DE ARQUIVOS

```
src/
├── app/
│   ├── api/
│   │   ├── fases/
│   │   │   └── [id]/
│   │   │       └── route.ts      # GET, PUT, DELETE (já existe)
│   │   └── aulas/
│   │       ├── route.ts           # GET, POST (NOVO)
│   │       └── [id]/
│   │           └── route.ts       # GET, PUT, DELETE (NOVO)
│   │
│   └── dashboard/
│       ├── fases/
│       │   ├── page.tsx           # Listagem (NOVO)
│       │   ├── novo/
│       │   │   └── page.tsx       # Criar fase (NOVO)
│       │   └── [id]/
│       │       ├── page.tsx       # Detalhes/Editar (NOVO)
│       │       └── topicos/
│       │           └── route.ts   # API de tópicos (NOVO)
│       │
│       └── aulas/
│           ├── page.tsx           # Listagem (NOVO)
│           ├── novo/
│           │   └── page.tsx       # Criar aula (NOVO)
│           └── [id]/
│               ├── page.tsx       # Detalhes (NOVO)
│               └── editar/
│                   └── page.tsx   # Editar aula (NOVO)
```

---

## PARTE 5: ORDEM DE IMPLEMENTAÇÃO SUGERIDA

### Fase 1: Fases MSA (Mais simples, API já existe)
1. ✅ Criar tela de listagem de fases
2. ✅ Criar tela de nova fase
3. ✅ Criar tela de editar fase
4. ✅ Adicionar gerenciamento de tópicos na edição

### Fase 2: Aulas (Requer nova API e modelos)
1. ⬜ Criar migração do modelo `Aula`
2. ⬜ Criar APIs de aulas
3. ⬜ Criar tela de listagem de aulas
4. ⬜ Criar tela de nova aula
5. ⬜ Criar tela de visualizar aula
6. ⬜ Criar tela de editar aula

### Fase 3: Integrações
1. ⬜ Integrar seleção de tópico MSA nas fichas
2. ⬜ Integrar seleção de aula nas fichas

---

## PARTE 6: ESTIMATIVA DE TEMPO

| Tarefa | Tempo Estimado |
|--------|----------------|
| **Fases MSA** | 3-4 horas |
| - Listagem | 1h |
| - Nova Fase | 45min |
| - Editar Fase | 45min |
| - Gerenciar Tópicos | 1-1.5h |
| **Aulas** | 5-6 horas |
| - Migração + APIs | 1.5h |
| - Listagem | 1h |
| - Nova Aula | 1h |
| - Visualizar Aula | 45min |
| - Editar Aula | 45min |
| **Integrações** | 2-3 horas |
| **Total** | **10-13 horas** |

---

## PARTE 7: DECISÕES PENDENTES

Preciso da sua confirmação em:

1. **Modelo de Aulas:** O modelo proposto atende ou precisa de mais campos?
   - Precisa de relação com instrumento?
   - Precisa de relação com fase?

2. **Permissões:** Quem pode criar/editar aulas?
   - Apenas ADMIN?
   - ADMIN e INSTRUTOR?

3. **Tópicos MSA:** Já existe API para tópicos?
   - Verificar se precisa criar CRUD completo de tópicos

4. **Integração:** Como a aula se relaciona com a ficha?
   - Uma ficha tem uma aula ou várias?
   - A aula substitui o campo "Tópico MSA" ou complementa?

---

## Anexos

### Schema Prisma Atual (Fases)
```prisma
model Fase {
  id        String  @id @default(cuid())
  nome      String  @unique
  descricao String?
  ordem     Int
  ativo     Boolean @default(true)
  alunos    Aluno[]
  topicos   TopicoMSA[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@map("fases")
}

model TopicoMSA {
  id        String @id @default(cuid())
  faseId    String
  fase      Fase   @relation(fields: [faseId], references: [id])
  numero    String // Ex: "1.1", "2.3"
  titulo    String
  descricao String?
  aulas     AulaRegistro[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@map("topicos_msa")
}
```

### Schema Prisma Proposto (Aulas)
```prisma
model Aula {
  id           String  @id @default(cuid())
  numero       Int     @unique
  titulo       String
  descricao    String?
  conteudo     String?
  cargaHoraria Int     @default(60)
  ativo        Boolean @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  @@map("aulas")
}
```

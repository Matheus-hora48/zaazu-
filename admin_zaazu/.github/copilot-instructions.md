# Instruções para Copilot - Admin Zaazu

## Como Usar Este Template

1. Este arquivo contém diretrizes específicas para o projeto Admin Zaazu
2. Mantenha as convenções globais intactas
3. Sempre consulte este arquivo antes de implementar mudanças

## Diretrizes Operacionais para AI Agents

### Abordagem de Trabalho

1. **Comunicação direta**: Evitar comandos desnecessários como `echo` - ir direto ao ponto
2. **Gestão de tarefas complexas**: Para problemas complexos, criar e manter uma lista de tarefas, executando e atualizando conforme progresso
3. **Análise proativa**: Sempre buscar e ler arquivos relevantes para entender problemas antes de propor soluções
4. **Análise detalhada**: Para novos problemas, fornecer análise completa incluindo causa e potenciais soluções ou implementações
5. **⚠️ APROVAÇÃO OBRIGATÓRIA**: NUNCA implementar soluções sem aprovação explícita do usuário. Sempre apresentar análise + opções de solução + pedir confirmação antes de qualquer implementação

### Metodologia de Análise de Sistema (SPEED Framework)

**S**can → **P**attern → **E**valuate → **E**xecute → **D**eliver

#### 1. SCAN - Reconhecimento Rápido (30 segundos)

```bash
# Primeira varredura obrigatória - executar em paralelo:
- Estrutura de diretórios principais
- Arquivos de configuração (.env.local, package.json, next.config.ts, etc.)
- README.md e documentação principal
- Logs de erro recentes (se existirem)
```

#### 2. PATTERN - Identificação de Padrões (60 segundos)

- **Arquitetura**: Next.js 15.4.5 com App Router, Firebase Backend
- **Tecnologias**: React 19, TypeScript, Tailwind CSS, Firebase, Google APIs
- **Convenções**: Sistema de ContentTag fixo, estrutura modular de componentes
- **Dependências**: Firebase (auth/firestore/storage), Google Drive API, Lucide Icons

#### 3. EVALUATE - Avaliação de Contexto (90 segundos)

- **Estado atual**: Sistema de tags fixas implementado, modais de CRUD funcionais
- **Riscos**: Configuração Firebase, uploads de thumbnails, integração Google Drive
- **Constraints**: Tags limitadas a 3 tipos, estrutura de types.ts rígida
- **Impacto**: Mudanças em types.ts afetam todo o sistema

#### 4. EXECUTE - Execução Estratégica

- **⚠️ STOP - APROVAÇÃO NECESSÁRIA**: Antes de qualquer implementação, apresentar:
  - Resumo do problema identificado
  - 2-3 opções de solução com prós/contras
  - Recomendação e justificativa
  - Solicitar aprovação explícita: "Qual abordagem você prefere?"
- **Após aprovação**: Priorização → Implementação incremental → Validação contínua

#### 5. DELIVER - Entrega com Contexto

- **Solução**: Código/configuração implementada
- **Explicação**: Por que esta abordagem foi escolhida
- **Próximos passos**: Melhorias ou considerações futuras

### Heurísticas de Troubleshooting

1. **Regra 80/20**: 80% dos problemas vêm de 20% das causas - focar nas mais prováveis primeiro
2. **Logs primeiro**: Sempre verificar logs antes de assumir causas
3. **Reproduzir antes de corrigir**: Confirmar o problema antes de implementar solução
4. **Mudança mínima**: Fazer a menor alteração que resolve o problema
5. **Rollback ready**: Sempre ter plano de reversão para mudanças críticas

### Protocolos de Análise Rápida

#### Checklist de Sistema Admin Zaazu (Execute em paralelo - 2 minutos)

```bash
# Arquivos de entrada obrigatórios:
├── package.json                   # Dependências Next.js e Firebase
├── .env.local                     # Configurações Firebase e Google APIs
├── next.config.ts                 # Configuração imagens Firebase Storage
├── lib/types.ts                   # Sistema ContentTag e interfaces
├── lib/firebase.ts                # Configuração Firebase
├── lib/services.ts                # Services para CRUD e uploads
└── components/                    # Estrutura modular de componentes
```

#### Mapeamento de Dependências (30 segundos)

- **Banco de dados**: Firebase Firestore
- **Storage**: Firebase Storage (thumbnails)
- **Auth**: Firebase Authentication
- **External APIs**: Google Drive API, Google Apps Script
- **UI**: Tailwind CSS, Lucide Icons, Radix UI
- **Forms**: React Hook Form + Zod validation

#### Pontos Críticos de Falha (Verificar sempre)

1. **Configuração Firebase**: Variáveis .env.local configuradas
2. **Google APIs**: Credenciais e permissões corretas
3. **Next.js Images**: Domínios permitidos em next.config.ts
4. **ContentTag System**: Consistência entre types.ts e componentes
5. **Upload de thumbnails**: Ordem correta de parâmetros nos services

### Estratégias de Implementação

#### Approach Selection Matrix

```
Problema Simples + UI = Implementação Direta (5-15 min)
Problema Simples + Backend = Verificar Firebase + Implementação (15-30 min)
Problema Complexo + Types = Análise de impacto + Implementação (30-60 min)
Problema Complexo + Integração = Full SPEED Framework (60+ min)
```

#### Code Quality Gates (Sempre verificar)

1. **TypeScript**: Sem erros de compilação
2. **ContentTag**: Usar apenas "entretenimento" | "atividade" | "educativo"
3. **Firebase**: Verificar configuração antes de usar services
4. **Uploads**: Ordem correta: (id: string, file: File)
5. **Modais**: Padrão Add/Edit/View consistente

### 🚨 Protocolo de Aprovação Obrigatório

#### Template para Solicitação de Aprovação

```
## Análise do Problema
- **Problema**: [Descrição clara do que foi identificado]
- **Causa**: [Causa raiz identificada]
- **Impacto**: [Consequências se não for resolvido]

## Opções de Solução

### Opção 1: [Nome da abordagem]
- **Implementação**: [Como será feito]
- **Prós**: [Vantagens]
- **Contras**: [Desvantagens/riscos]
- **Tempo estimado**: [Duração]

### Opção 2: [Nome da abordagem alternativa]
- **Implementação**: [Como será feito]
- **Prós**: [Vantagens]
- **Contras**: [Desvantagens/riscos]
- **Tempo estimado**: [Duração]

## Recomendação
**Recomendo a Opção X** porque [justificativa baseada em contexto do projeto]

## ❓ Qual abordagem você prefere? ou você tem outra sugestão?
```

#### Situações que SEMPRE Requerem Aprovação

- ❌ Qualquer mudança de código
- ❌ Alterações em lib/types.ts (afeta sistema inteiro)
- ❌ Modificações em services.ts (Firebase operations)
- ❌ Mudanças no sistema ContentTag
- ❌ Alterações de configuração Firebase
- ✅ **Exceção**: Apenas leitura e análise de arquivos

## Arquitetura do Projeto Admin Zaazu

### Componentes Principais

```
app/                              # Next.js App Router
├── (dashboard)/                  # Rotas do painel admin
│   ├── atividades/              # Gestão de atividades
│   ├── videos/                  # Gestão de vídeos
│   ├── jogos/                   # Gestão de jogos
│   ├── usuarios/                # Gestão de usuários
│   └── configuracoes/           # Configurações sistema
├── api/                         # API Routes
│   ├── google-drive/            # Integração Google Drive
│   └── logs/                    # Sistema de logging
components/
├── auth/                        # Componentes autenticação
├── layout/                      # Layout e navegação
├── modals/                      # Modais CRUD (padrão Add/Edit/View)
└── ui/                          # Componentes base (Button, Input, etc.)
lib/
├── types.ts                     # Tipos TypeScript e ContentTag
├── firebase.ts                  # Configuração Firebase
├── services.ts                  # Services CRUD e uploads
├── auth-context.tsx             # Context de autenticação
└── logging.ts                   # Sistema de logs
```

### Fluxo de Dados

1. **Autenticação**: Firebase Auth → auth-context → proteção de rotas
2. **CRUD Operations**: UI → services.ts → Firebase Firestore
3. **File Uploads**: Modal → services.uploadThumbnail → Firebase Storage
4. **Content Management**: ContentTagSelector → tipos fixos → Firestore

### Sistema ContentTag

```typescript
// Sistema de categorização fixa - NÃO ALTERAR
export type ContentTag = "entretenimento" | "atividade" | "educativo";

// Todas as entidades usam esta tipagem
interface Video {
  tag: ContentTag;
}
interface Game {
  tag: ContentTag;
}
interface Activity {
  tag: ContentTag;
}
```

## Configuração de Serviços Externos

### Variáveis de Ambiente (.env.local)

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google APIs
GOOGLE_CLIENT_EMAIL=your_service_account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_FOLDER_ID=your_google_drive_folder_id
```

### Configurações Firebase

1. **Authentication**: Email/Password habilitado
2. **Firestore**: Collections: users, videos, games, activities, logs
3. **Storage**: Bucket configurado para uploads de thumbnails
4. **Security Rules**: Configuradas para admin access

### Integração Google Drive

- **Service Account**: Configurada para acesso ao Drive
- **Permissions**: Pasta específica com permissões adequadas
- **API**: Google Drive API v3 habilitada

## Comandos Específicos do Projeto

### Setup Inicial

```bash
# Instalação e setup
npm install
cp .env.example .env.local  # Configure as variáveis
npm run dev                 # Desenvolvimento

# Build e deploy
npm run build
npm run start
```

### Desenvolvimento

```bash
npm run dev          # Servidor desenvolvimento (localhost:3000)
npm run lint         # Verificar código
npm run build        # Build produção
```

### Firebase Setup

```bash
# Instalar Firebase CLI (se necessário)
npm install -g firebase-tools

# Login e configuração
firebase login
firebase use your-project-id
```

## Padrões Específicos do Admin Zaazu

### Estrutura de Modais (OBRIGATÓRIO)

```typescript
// Padrão para todos os modais CRUD
interface AddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Callback para reload
}

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item: ItemType | null; // Item sendo editado
}

interface ViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ItemType | null; // Item sendo visualizado
}
```

### Sistema de Upload de Thumbnails

```typescript
// SEMPRE usar esta ordem de parâmetros
await videoService.uploadThumbnail(videoId: string, file: File)
await gameService.uploadThumbnail(gameId: string, file: File)
await activityService.uploadThumbnail(activityId: string, file: File)

// NUNCA: uploadThumbnail(file, id) - ordem incorreta
```

### ContentTagSelector Component

```typescript
// Componente padrão para seleção de tags
<ContentTagSelector
  value={formData.tag}
  onChange={(tag) => setFormData({ ...formData, tag })}
/>

// Opções disponíveis:
// 🎪 entretenimento - Conteúdo divertido e recreativo
// 📝 atividade - Exercícios e práticas
// 🎓 educativo - Conteúdo de aprendizado
```

### Tratamento de Erros Firebase

```typescript
// Padrão para verificação Firebase
const checkFirebase = () => {
  if (!isFirebaseConfigured || !db) {
    console.warn("Firebase não está configurado - usando modo demo");
    return false;
  }
  return true;
};

// Tratamento em services
try {
  if (!checkFirebase()) return [];
  // ... operação Firebase
} catch (error) {
  console.error("Error in service:", error);
  throw error;
}
```

### Sistema de Logging

```typescript
// Padrão para logs de admin
await logAdminAction({
  action: "item_created" | "item_updated" | "item_deleted",
  details: "Descrição da ação",
  admin: currentAdmin?.email || "unknown",
  level: "info" | "warning" | "error",
  metadata: {
    // Dados relevantes da operação
    timestamp: new Date().toISOString(),
  },
});
```

### Validação de Formulários

```typescript
// Usar React Hook Form + Zod quando necessário
const formSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  tag: z.enum(["entretenimento", "atividade", "educativo"]),
});
```

## Troubleshooting Common Issues

### Firebase Configuration

1. **Erro "Firebase not configured"**: Verificar .env.local
2. **Auth errors**: Verificar Firebase Auth settings
3. **Storage errors**: Verificar Security Rules e permissions

### Upload Issues

1. **Thumbnail não salva**: Verificar ordem de parâmetros uploadThumbnail
2. **Next/Image error**: Adicionar domínio em next.config.ts
3. **File object error**: Verificar se está passando File object correto

### ContentTag Issues

1. **Type errors**: Verificar se usa apenas as 3 tags permitidas
2. **Modal inconsistency**: Verificar se todos os modais usam ContentTagSelector
3. **Database mismatch**: Verificar migração de tags[] para tag

### Performance Optimization

1. **Large thumbnails**: Implementar resize antes do upload
2. **Many API calls**: Implementar cache quando necessário
3. **Slow loading**: Verificar indexes do Firestore

## Security Considerations

### Firebase Security Rules

```javascript
// Exemplo de regras para admin only
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### Environment Variables

- **NUNCA** commitar .env.local
- Sempre usar NEXT*PUBLIC* para variáveis client-side
- Manter service account keys seguras

### Content Validation

- Sempre validar uploads (tipo, tamanho)
- Sanitizar inputs de usuário
- Verificar permissões antes de operações CRUD

---

**Lembre-se**: Este é um projeto de painel administrativo para gestão de conteúdo educativo. Toda mudança deve manter a integridade do sistema ContentTag e a experiência consistente dos administradores.

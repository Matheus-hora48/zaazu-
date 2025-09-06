# Sistema de Logs Zaazu Kids

Este documento descreve o sistema completo de logging implementado para a plataforma Zaazu Kids, incluindo logs do painel administrativo e do aplicativo Flutter.

## 📋 Visão Geral

O sistema de logs permite:
- **Visualizar logs** diretamente na página de configurações
- **Filtrar logs** por tipo (Admin/App) e termo de busca
- **Baixar logs** em formato CSV
- **Criar logs de exemplo** para demonstração
- **Registrar ações** tanto do painel admin quanto do app Flutter

## 🗂️ Estrutura de Arquivos

```
├── lib/
│   ├── logging.ts              # Serviço principal de logging
│   └── logging-examples.ts     # Exemplos de uso
├── app/
│   ├── configuracoes/
│   │   └── page.tsx           # Página com visualização de logs
│   └── api/
│       └── logs/
│           └── route.ts       # API para receber logs do Flutter
```

## 🔧 Funcionalidades Implementadas

### 1. Visualização de Logs (Página de Configurações)

**Localização:** `app/configuracoes/page.tsx`

**Recursos:**
- Seção dedicada aos logs do sistema
- Botão "Carregar Logs" para buscar logs recentes
- Botão "Mostrar/Ocultar" para exibir/esconder a tabela
- Filtros por tipo (Todos, Admin, App)
- Campo de busca para filtrar por ação, detalhes ou usuário
- Download em CSV
- Estatísticas (contadores por tipo)
- Criação de logs de exemplo

**Interface:**
```tsx
// Controles principais
<Button onClick={loadLogs}>Carregar Logs</Button>
<Button onClick={() => setLogsVisible(!logsVisible)}>Mostrar/Ocultar</Button>

// Filtros
<Input placeholder="Buscar nos logs..." value={searchTerm} onChange={...} />
<select value={logFilter} onChange={...}>
  <option value="all">Todos os Logs</option>
  <option value="admin">Apenas Admin</option>
  <option value="app">Apenas App</option>
</select>

// Ações
<Button onClick={downloadLogs}>Baixar CSV</Button>
<Button onClick={createSampleLogs}>Criar Logs de Exemplo</Button>
```

### 2. Serviço de Logging

**Localização:** `lib/logging.ts`

**Principais funções:**
- `logAdminAction()` - Registra ações do painel admin
- `logAppAction()` - Registra ações do aplicativo Flutter
- `loadSystemLogs()` - Carrega logs do Firebase
- `exportLogsToCSV()` - Exporta logs para CSV
- `filterLogs()` - Filtra logs por critérios

**Exemplo de uso:**
```typescript
import { logAdminAction, logAppAction, LOG_ACTIONS } from '@/lib/logging';

// Log de ação do admin
await logAdminAction({
  action: LOG_ACTIONS.ADMIN.USER_CREATED,
  details: "Usuário João Silva criado",
  admin: "admin@zaazu.app",
});

// Log de ação do app
await logAppAction({
  action: LOG_ACTIONS.APP.VIDEO_WATCHED,
  details: "Vídeo 'Matemática Básica' assistido",
  user: "crianca@email.com",
  userId: "user123",
});
```

### 3. API para Flutter

**Localização:** `app/api/logs/route.ts`

**Endpoint:** `POST /api/logs`

**Exemplo de requisição:**
```json
{
  "action": "video_watched",
  "details": "Vídeo 'Cores e Formas' assistido",
  "user": "crianca@email.com",
  "userId": "user123",
  "sessionId": "session456",
  "deviceInfo": "Android 13, Samsung Galaxy"
}
```

**Resposta de sucesso:**
```json
{
  "success": true,
  "message": "Log registrado com sucesso"
}
```

## 📱 Integração com Flutter

### Código Dart Exemplo

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class LoggingService {
  static const String baseUrl = 'https://zaazu.app';
  
  // Registrar login do usuário
  static Future<void> logUserLogin(String userEmail, String userId) async {
    await _sendLog({
      'action': 'user_login',
      'details': 'Usuário fez login no aplicativo',
      'user': userEmail,
      'userId': userId,
    });
  }
  
  // Registrar visualização de vídeo
  static Future<void> logVideoWatched(
    String userEmail, 
    String userId, 
    String videoTitle
  ) async {
    await _sendLog({
      'action': 'video_watched',
      'details': 'Vídeo assistido: $videoTitle',
      'user': userEmail,
      'userId': userId,
    });
  }
  
  // Função privada para enviar log
  static Future<void> _sendLog(Map<String, dynamic> logData) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/logs'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(logData),
      );
      
      if (response.statusCode != 200) {
        print('Erro ao enviar log: ${response.statusCode}');
      }
    } catch (e) {
      print('Erro ao enviar log: $e');
    }
  }
}
```

### Uso no Flutter

```dart
// Login do usuário
await LoggingService.logUserLogin('crianca@email.com', 'user123');

// Vídeo assistido
await LoggingService.logVideoWatched(
  'crianca@email.com', 
  'user123', 
  'Matemática Básica'
);

// Atividade concluída
await LoggingService.logActivityCompleted(
  'crianca@email.com',
  'user123',
  'Quiz de Cores',
  85 // pontuação
);
```

## 🗃️ Estrutura do Firebase

### Coleções de Logs

```
system/
├── logs/
│   ├── admin_actions/          # Logs do painel admin
│   │   ├── doc1: {
│   │   │   action: "user_created",
│   │   │   details: "Usuário João criado",
│   │   │   admin: "admin@zaazu.app",
│   │   │   timestamp: Timestamp
│   │   │ }
│   │   └── ...
│   └── app_actions/            # Logs do aplicativo
│       ├── doc1: {
│       │   action: "video_watched",
│       │   details: "Vídeo assistido: Cores",
│       │   user: "crianca@email.com",
│       │   userId: "user123",
│       │   sessionId: "session456",
│       │   deviceInfo: "Android 13",
│       │   timestamp: Timestamp
│       │ }
│       └── ...
```

## 🎯 Tipos de Ações Disponíveis

### Ações do Admin (`LOG_ACTIONS.ADMIN`)
- `USER_CREATED` - Usuário criado
- `USER_UPDATED` - Usuário atualizado
- `USER_DELETED` - Usuário excluído
- `VIDEO_APPROVED` - Vídeo aprovado
- `VIDEO_REJECTED` - Vídeo rejeitado
- `GAME_APPROVED` - Jogo aprovado
- `GAME_REJECTED` - Jogo rejeitado
- `ACTIVITY_APPROVED` - Atividade aprovada
- `ACTIVITY_REJECTED` - Atividade rejeitada
- `SETTINGS_UPDATED` - Configurações atualizadas
- `BACKUP_CREATED` - Backup criado
- `CACHE_CLEARED` - Cache limpo
- `CDN_CONFIGURED` - CDN configurado
- `LOGIN` - Login do admin
- `LOGOUT` - Logout do admin

### Ações do App (`LOG_ACTIONS.APP`)
- `USER_LOGIN` - Login do usuário
- `USER_LOGOUT` - Logout do usuário
- `USER_REGISTER` - Registro de usuário
- `VIDEO_WATCHED` - Vídeo assistido
- `VIDEO_COMPLETED` - Vídeo concluído
- `GAME_STARTED` - Jogo iniciado
- `GAME_COMPLETED` - Jogo concluído
- `ACTIVITY_STARTED` - Atividade iniciada
- `ACTIVITY_COMPLETED` - Atividade concluída
- `QUIZ_COMPLETED` - Quiz concluído
- `PROGRESS_UPDATED` - Progresso atualizado
- `SESSION_STARTED` - Sessão iniciada
- `SESSION_ENDED` - Sessão encerrada
- `ERROR_OCCURRED` - Erro ocorrido
- `CRASH_REPORTED` - Crash reportado

## 📊 Visualização dos Logs

### Tabela de Logs
A tabela exibe:
- **Tipo**: Badge colorido (Admin/App)
- **Ação**: Nome da ação realizada
- **Detalhes**: Descrição detalhada da ação
- **Usuário**: Email do usuário/admin
- **Data/Hora**: Timestamp formatado (pt-BR)

### Estatísticas
- **Logs Admin**: Contador de logs administrativos
- **Logs App**: Contador de logs do aplicativo
- **Total**: Total geral de logs

### Funcionalidades
- **Busca em tempo real**: Filtra enquanto digita
- **Filtro por tipo**: Admin, App ou Todos
- **Export CSV**: Download completo dos logs
- **Auto-refresh**: Atualização automática ao carregar

## 🚀 Como Usar

### 1. Visualizar Logs na Interface
1. Acesse a página de **Configurações**
2. Role até a seção **"Logs do Sistema"**
3. Clique em **"Carregar Logs"**
4. Use os filtros para refinar a busca
5. Clique em **"Baixar CSV"** para exportar

### 2. Registrar Logs do Admin
```typescript
import { logAdminAction, LOG_ACTIONS } from '@/lib/logging';

await logAdminAction({
  action: LOG_ACTIONS.ADMIN.USER_CREATED,
  details: "Novo usuário Maria Silva criado",
  admin: "admin@zaazu.app",
});
```

### 3. Registrar Logs do App (via API)
```bash
curl -X POST https://zaazu.app/api/logs \
  -H "Content-Type: application/json" \
  -d '{
    "action": "video_watched",
    "details": "Vídeo Matemática Básica assistido",
    "user": "crianca@email.com",
    "userId": "user123"
  }'
```

## 🔍 Benefícios do Sistema

1. **Rastreabilidade Completa**: Todos os eventos importantes são registrados
2. **Debugging Facilitado**: Logs detalhados ajudam na identificação de problemas
3. **Análise de Uso**: Compreender como os usuários interagem com a plataforma
4. **Auditoria**: Registro de todas as ações administrativas
5. **Monitoramento**: Acompanhar a saúde do sistema em tempo real

## 🛠️ Próximos Passos

- [ ] Implementar alertas automáticos para erros críticos
- [ ] Adicionar dashboard de analytics baseado nos logs
- [ ] Implementar retenção automática de logs (limpeza após X dias)
- [ ] Criar métricas de performance baseadas nos logs
- [ ] Implementar logs estruturados com mais metadados

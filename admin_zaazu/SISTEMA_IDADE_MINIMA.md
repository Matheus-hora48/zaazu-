# Sistema de Idade Mínima - Zaazu Admin

## Visão Geral

O sistema de idade mínima foi implementado para controlar qual conteúdo (vídeos, jogos e atividades) uma criança pode acessar baseado na sua idade.

## Como Funciona

### Para Administradores

Ao criar ou editar conteúdo, agora há um campo **"Idade Mínima"** que permite selecionar de 2 a 9 anos:

- **Vídeos**: Campo disponível nos modais de adicionar/editar vídeo
- **Jogos**: Campo disponível nos modais de adicionar/editar jogo  
- **Atividades**: Campo disponível nos modais de adicionar/editar atividade

### Para o Sistema

O sistema filtra automaticamente o conteúdo baseado na idade da criança:

- Criança de 5 anos → vê apenas conteúdo com idade mínima ≤ 5
- Criança de 7 anos → vê apenas conteúdo com idade mínima ≤ 7
- Criança de 9 anos → vê todo o conteúdo (2-9 anos)

## Estrutura de Dados

### Antes
```typescript
interface Video {
  // ... outros campos
  ageGroup: string; // "3-6 anos"
}
```

### Depois
```typescript
interface Video {
  // ... outros campos
  ageGroup: string; // "3-6 anos" (mantido para compatibilidade)
  minAge: number;   // 3 (idade mínima para acessar)
}
```

## Componente MinAgeSelector

Um novo componente foi criado para padronizar a seleção de idade:

```tsx
<MinAgeSelector
  value={formData.minAge}
  onChange={(age) => setFormData({ ...formData, minAge: age })}
  required
/>
```

## Filtragem de Conteúdo

Use as funções utilitárias em `lib/age-filter.ts`:

```typescript
import { filterVideosByAge, filterGamesByAge, filterActivitiesByAge } from '@/lib/age-filter';

const childAge = 7;
const availableVideos = filterVideosByAge(allVideos, childAge);
const availableGames = filterGamesByAge(allGames, childAge);
const availableActivities = filterActivitiesByAge(allActivities, childAge);
```

## Exemplo Prático

```typescript
// Criança de 6 anos tentando acessar conteúdo
const child = { age: 6 };

const videos = [
  { title: "Vídeo Infantil", minAge: 3 },     // ✅ Pode acessar
  { title: "Vídeo Educativo", minAge: 5 },   // ✅ Pode acessar  
  { title: "Vídeo Avançado", minAge: 8 }     // ❌ Não pode acessar
];

const accessibleVideos = filterVideosByAge(videos, child.age);
// Resultado: 2 vídeos (minAge 3 e 5)
```

## Migração de Dados

Para dados existentes sem o campo `minAge`, o sistema usa valor padrão 2:

```typescript
minAge: content.minAge || 2
```

## Benefícios

1. **Controle Preciso**: Administradores definem exatamente a partir de que idade o conteúdo é apropriado
2. **Filtragem Automática**: Sistema filtra automaticamente baseado na idade da criança
3. **Flexibilidade**: Idades de 2 a 9 anos cobrem toda a faixa etária do público-alvo
4. **Compatibilidade**: Mantém o campo `ageGroup` existente para não quebrar funcionalidades antigas

## Próximos Passos

1. Implementar a filtragem no frontend da aplicação das crianças
2. Adicionar relatórios por faixa etária no dashboard admin
3. Permitir configuração de idades máximas se necessário

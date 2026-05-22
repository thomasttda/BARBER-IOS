# Barber Premium SaaS - Agents Configuration

Este projeto utiliza 3 agents especializados trabalhando em paralelo para acelerar o desenvolvimento.

## Agents Configurados

### 1. @frontend
**Especialista em UI/UX e Componentes React**
- Design system com TailwindCSS
- Componentes reutilizáveis
- Páginas responsivas mobile-first
- Animações e transições

### 2. @backend
**Especialista em API, Database e Integrações**
- Schema Prisma e PostgreSQL
- API Routes Next.js
- NextAuth.js autenticação
- Mercado Pago, WhatsApp, Push Notifications

### 3. @devops
**Especialista em Infraestrutura e Deploy**
- Git e sistema de backup
- Deploy Vercel
- CI/CD e monitoramento
- Segurança e performance

## Como Usar

### Invocação Manual
```
@frontend crie o componente de header
@backend configure o schema do Prisma
@devops setup o sistema de backup
```

### Invocação Automática
O agent principal pode invocar subagents automaticamente via Task tool para:
- Desenvolvimento paralelo de features
- Code review especializado
- Testes e validação

## Workflow Paralelo

1. **Agent Principal** coordena e divide tarefas
2. **Subagents** trabalham em paralelo em suas especialidades
3. **Integração** automática via Git
4. **Testes** e validação antes de merge

## Estrutura de Trabalho

```
Fase 1: Setup → @devops (infra) + @backend (schema)
Fase 2: Auth → @backend (NextAuth) + @frontend (login UI)
Fase 3: Tenant → @backend (multi-tenant) + @frontend (branding)
Fase 4: Admin → @frontend (painel) + @backend (APIs)
Fase 5: Público → @frontend (páginas) + @backend (APIs)
Fase 6: Loja → @frontend (e-commerce) + @backend (Mercado Pago)
Fase 7: Notificações → @backend (WhatsApp/Push) + @devops (config)
```

## Backup e Versionamento

Cada fase completada gera:
- Commit com tag de versão
- Screenshots na pasta PROGRESSO
- Atualização do CHANGELOG.md
- Ponto de restauração seguro
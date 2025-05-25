# Guia do Sistema de Permissões

## Introdução

O sistema de permissões foi projetado para permitir um controle granular sobre o que cada membro da equipe pode ver e fazer no aplicativo de gerenciamento de projetos. Este documento explica como utilizar o sistema e suas principais funcionalidades.

## Funções de Usuário

O sistema suporta três funções principais:

1. **Administrador**: Acesso completo a todas as funcionalidades do sistema
2. **Gerente**: Pode gerenciar projetos e tarefas atribuídas a ele
3. **Membro**: Acesso limitado apenas aos recursos atribuídos diretamente

## Componentes Principais

### 1. PermissionGuard

O componente `PermissionGuard` protege rotas e componentes com base nas permissões do usuário.

```tsx
<PermissionGuard
  requiredPermission="project" // ou "task", "calendar", "tracking"
  action="view" // ou "edit", "manage_members"
  resourceId="id-opcional-do-recurso"
  fallbackPath="/dashboard"
>
  {/* Conteúdo protegido */}
</PermissionGuard>
```

### 2. PermissionFilter

O componente `PermissionFilter` filtra dados (projetos, tarefas, etc.) com base nas permissões do usuário.

```tsx
<PermissionFilter
  resourceType="projects" // ou "tasks", "calendar", "tracking"
  data={arrayDeDados}
  action="view" // ou "edit", "manage_members"
>
  {(filteredData) => (
    // Renderizar os dados filtrados
  )}
</PermissionFilter>
```

### 3. Hooks Personalizados

O sistema inclui os seguintes hooks para verificar permissões:

- **usePermissions**: Verificações gerais de permissões
- **useProjectAccess**: Gerencia acesso a projetos
- **useTaskAccess**: Gerencia acesso a tarefas
- **useCalendarAccess**: Gerencia acesso ao calendário
- **useTrackingAccess**: Gerencia acesso ao sistema de tracking

## Gerenciando Permissões de Usuário

As permissões dos usuários podem ser gerenciadas através do formulário de permissões na página de Equipe.

### Atribuindo Permissões

1. Acesse a página de Equipe
2. Selecione um usuário
3. Atribua projetos e tarefas específicas
4. Configure acesso ao calendário e tracking
5. Salve as alterações

## Exemplos de Uso

### Verificando Permissões em Código

```tsx
const { hasPermission, hasRole } = usePermissions();

// Verificar se o usuário é administrador
if (hasRole('admin')) {
  // Código para administradores
}

// Verificar permissões específicas
if (hasPermission('project', 'edit', { id: projectId })) {
  // Permitir edição do projeto
}
```

### Filtrando Projetos por Permissões

```tsx
const { userProjects, managedProjects } = useProjectAccess();

// userProjects contém todos os projetos que o usuário tem acesso
// managedProjects contém apenas os projetos que o usuário gerencia
```

### Verificando Acesso a Tarefas

```tsx
const { hasTaskAccess, canEditTask } = useTaskAccess();

// Verificar se o usuário pode acessar uma tarefa
if (hasTaskAccess(taskId)) {
  // Mostrar detalhes da tarefa
}

// Verificar se o usuário pode editar uma tarefa
if (canEditTask(taskId)) {
  // Mostrar botões de edição
}
```

## Políticas de Segurança no Banco de Dados

O sistema utiliza políticas de segurança em nível de linha (RLS) no Supabase para garantir que os usuários só possam acessar os dados aos quais têm permissão.

## Demonstração do Sistema

Para ver uma demonstração completa do sistema de permissões, acesse a página de exemplo em `/permissions-example` (apenas administradores).

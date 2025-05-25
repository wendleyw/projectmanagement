/**
 * Definiu00e7u00e3o de papeu00eds (roles) e permissu00f5es do sistema
 */

export type UserRole = 'admin' | 'project_manager' | 'team_lead' | 'developer';

export interface RolePermissions {
  dashboard: {
    view: boolean;
    viewAll: boolean;
  };
  clients: {
    view: boolean;
    viewAll: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
  projects: {
    view: boolean;
    viewAll: boolean;
    viewAssigned: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
  tasks: {
    view: boolean;
    viewAll: boolean;
    viewAssigned: boolean;
    viewTeam: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    assign: boolean;
  };
  calendar: {
    view: boolean;
    viewAll: boolean;
    viewAssigned: boolean;
    create: boolean;
    edit: boolean;
  };
  timeTracking: {
    view: boolean;
    viewAll: boolean;
    viewTeam: boolean;
    create: boolean;
    edit: boolean;
  };
  team: {
    view: boolean;
    viewAll: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
}

/**
 * Permissu00f5es padrpu00e3o para cada papel (role)
 */
export const defaultRolePermissions: Record<UserRole, RolePermissions> = {
  // CEO/Admin - Acesso total a tudo
  admin: {
    dashboard: { view: true, viewAll: true },
    clients: { view: true, viewAll: true, create: true, edit: true, delete: true },
    projects: { view: true, viewAll: true, viewAssigned: true, create: true, edit: true, delete: true },
    tasks: { view: true, viewAll: true, viewAssigned: true, viewTeam: true, create: true, edit: true, delete: true, assign: true },
    calendar: { view: true, viewAll: true, viewAssigned: true, create: true, edit: true },
    timeTracking: { view: true, viewAll: true, viewTeam: true, create: true, edit: true },
    team: { view: true, viewAll: true, create: true, edit: true, delete: true }
  },
  
  // Project Manager - Acesso aos projetos designados
  project_manager: {
    dashboard: { view: true, viewAll: false },
    clients: { view: true, viewAll: true, create: true, edit: true, delete: false },
    projects: { view: true, viewAll: false, viewAssigned: true, create: true, edit: true, delete: false },
    tasks: { view: true, viewAll: false, viewAssigned: true, viewTeam: true, create: true, edit: true, delete: true, assign: true },
    calendar: { view: true, viewAll: false, viewAssigned: true, create: true, edit: true },
    timeTracking: { view: true, viewAll: false, viewTeam: true, create: true, edit: true },
    team: { view: true, viewAll: false, create: false, edit: true, delete: false }
  },
  
  // Team Lead/Senior - Acesso aos projetos de sua u00e1rea/equipe
  team_lead: {
    dashboard: { view: true, viewAll: false },
    clients: { view: true, viewAll: false, create: false, edit: false, delete: false },
    projects: { view: true, viewAll: false, viewAssigned: true, create: false, edit: false, delete: false },
    tasks: { view: true, viewAll: false, viewAssigned: true, viewTeam: true, create: true, edit: true, delete: false, assign: true },
    calendar: { view: true, viewAll: false, viewAssigned: true, create: false, edit: true },
    timeTracking: { view: true, viewAll: false, viewTeam: true, create: true, edit: true },
    team: { view: true, viewAll: false, create: false, edit: false, delete: false }
  },
  
  // Developer/Designer - Acesso apenas u00e0s suas tarefas
  developer: {
    dashboard: { view: true, viewAll: false },
    clients: { view: true, viewAll: false, create: false, edit: false, delete: false },
    projects: { view: true, viewAll: false, viewAssigned: true, create: false, edit: false, delete: false },
    tasks: { view: true, viewAll: false, viewAssigned: true, viewTeam: false, create: false, edit: true, delete: false, assign: false },
    calendar: { view: true, viewAll: false, viewAssigned: true, create: false, edit: false },
    timeTracking: { view: true, viewAll: false, viewTeam: false, create: true, edit: true },
    team: { view: true, viewAll: false, create: false, edit: false, delete: false }
  }
};

/**
 * Verifica se um usuu00e1rio tem uma permissu00e3o especu00edfica com base no seu papel
 * @param role Papel do usuu00e1rio
 * @param module Mu00f3dulo (dashboard, clients, projects, etc)
 * @param action Au00e7u00e3o (view, create, edit, etc)
 * @returns true se o usuu00e1rio tem permissu00e3o, false caso contru00e1rio
 */
export const hasPermissionByRole = (
  role: UserRole,
  module: keyof RolePermissions,
  action: string
): boolean => {
  const permissions = defaultRolePermissions[role];
  if (!permissions || !permissions[module]) return false;
  
  return (permissions[module] as any)[action] === true;
};

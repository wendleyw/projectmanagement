import { useCallback } from 'react';
import useAuthStore from '../store/authStore';
import { defaultRolePermissions, UserRole, RolePermissions } from '../types/roles';
import { Project, Task } from '../types';

// Mapeamento de tipos de role existentes para o novo sistema
const roleMapping = {
  'admin': 'admin',
  'manager': 'project_manager',
  'member': 'developer'
} as const;

// Tipo de utilidade para mapear tipos existentes para novos tipos
type MappedRole = typeof roleMapping[keyof typeof roleMapping];

/**
 * Hook for managing role-based access control
 * Provides functions to check if user has access to specific resources based on their role
 */
export const useRoleBasedAccess = () => {
  const { user, userProjects, userTasks } = useAuthStore();
  
  /**
   * Maps the current user role to the new RBAC system role
   */
  const getMappedRole = useCallback((): UserRole => {
    if (!user) return 'developer'; // Default to lowest access
    
    switch(user.role) {
      case 'admin': return 'admin';
      case 'manager': return 'project_manager';
      case 'member': return 'developer';
      default: return 'developer';
    }
  }, [user]);

  /**
   * Get the user's role-based permissions
   */
  const getRolePermissions = useCallback((): RolePermissions | null => {
    if (!user) return null;
    
    // Convert current user role to new RBAC role type
    const mappedRole = getMappedRole();
    return defaultRolePermissions[mappedRole] || null;
  }, [user, getMappedRole]);

  /**
   * Check if user has a specific permission based on their role
   */
  const hasRolePermission = useCallback(
    (module: keyof RolePermissions, action: string): boolean => {
      if (!user) return false;
      
      const permissions = getRolePermissions();
      if (!permissions || !permissions[module]) return false;
      
      return (permissions[module] as any)[action] === true;
    },
    [user, getRolePermissions]
  );

  /**
   * Check if the current user can view a specific project
   */
  const canViewProject = useCallback(
    (projectId: string): boolean => {
      if (!user) return false;
      
      // Get mapped role and permissions
      const mappedRole = getMappedRole();
      const permissions = getRolePermissions();
      if (!permissions) return false;
      
      // Admin can view all projects
      if (mappedRole === 'admin') return true;
      
      // Project Manager and Team Lead can view their assigned projects
      if (
        (mappedRole === 'project_manager' || mappedRole === 'team_lead') &&
        permissions.projects.viewAssigned
      ) {
        // Check if the project is in user's projects
        return userProjects.some(p => p.id === projectId);
      }
      
      // Developer can view only projects where they have assigned tasks
      if (mappedRole === 'developer' && permissions.projects.viewAssigned) {
        const projectTasks = userTasks.filter(t => t.project_id === projectId);
        return projectTasks.length > 0;
      }
      
      return false;
    },
    [user, getRolePermissions, userProjects, userTasks]
  );

  /**
   * Check if the current user can edit a specific project
   */
  const canEditProject = useCallback(
    (projectId: string): boolean => {
      if (!user) return false;
      
      // Get mapped role and permissions
      const mappedRole = getMappedRole();
      const permissions = getRolePermissions();
      if (!permissions) return false;
      
      // Admin can edit all projects
      if (mappedRole === 'admin') return true;
      
      // Project Manager can edit their assigned projects
      if (mappedRole === 'project_manager' && permissions.projects.edit) {
        // Check if the project is in user's projects
        return userProjects.some(p => p.id === projectId);
      }
      
      // Team Lead and Developer cannot edit projects
      return false;
    },
    [user, getRolePermissions, userProjects]
  );

  /**
   * Check if the current user can view a specific task
   */
  const canViewTask = useCallback(
    (taskId: string): boolean => {
      if (!user) return false;
      
      // Get mapped role and permissions
      const mappedRole = getMappedRole();
      const permissions = getRolePermissions();
      if (!permissions) return false;
      
      // Admin can view all tasks
      if (mappedRole === 'admin') return true;
      
      // Find the task
      const task = userTasks.find(t => t.id === taskId);
      if (!task) return false;
      
      // Project Manager can view all tasks in their projects
      if (mappedRole === 'project_manager' && permissions.tasks.viewAssigned) {
        return userProjects.some(p => p.id === task.project_id);
      }
      
      // Team Lead can view tasks in their team's projects
      if (mappedRole === 'team_lead' && permissions.tasks.viewTeam) {
        // This would require additional logic to check if the task is in their team
        // For simplicity, we'll just check if it's in their projects
        return userProjects.some(p => p.id === task.project_id);
      }
      
      // Developer can view only their assigned tasks
      if (mappedRole === 'developer' && permissions.tasks.viewAssigned) {
        return task.assignee_id === user.id;
      }
      
      return false;
    },
    [user, getRolePermissions, userProjects, userTasks]
  );

  /**
   * Check if the current user can edit a specific task
   */
  const canEditTask = useCallback(
    (taskId: string): boolean => {
      if (!user) return false;
      
      // Get mapped role and permissions
      const mappedRole = getMappedRole();
      const permissions = getRolePermissions();
      if (!permissions) return false;
      
      // Admin can edit all tasks
      if (mappedRole === 'admin') return true;
      
      // Find the task
      const task = userTasks.find(t => t.id === taskId);
      if (!task) return false;
      
      // Project Manager can edit all tasks in their projects
      if (mappedRole === 'project_manager' && permissions.tasks.edit) {
        return userProjects.some(p => p.id === task.project_id);
      }
      
      // Team Lead can edit tasks in their team's projects
      if (mappedRole === 'team_lead' && permissions.tasks.edit) {
        // This would require additional logic to check if the task is in their team
        // For simplicity, we'll just check if it's in their projects
        return userProjects.some(p => p.id === task.project_id);
      }
      
      // Developer can edit only their assigned tasks
      if (mappedRole === 'developer' && permissions.tasks.edit) {
        return task.assignee_id === user.id;
      }
      
      return false;
    },
    [user, getRolePermissions, userProjects, userTasks]
  );

  /**
   * Filter projects based on user's role and permissions
   */
  const filterProjects = useCallback(
    (projects: Project[]): Project[] => {
      if (!user) return [];
      
      // Get mapped role and permissions
      const mappedRole = getMappedRole();
      const permissions = getRolePermissions();
      if (!permissions) return [];
      
      // Admin can see all projects
      if (mappedRole === 'admin') return projects;
      
      // Project Manager can see all projects they manage
      if (mappedRole === 'project_manager' && permissions.projects.viewAssigned) {
        // This assumes userProjects is already filtered for the PM
        const projectIds = userProjects.map(p => p.id);
        return projects.filter(p => projectIds.includes(p.id));
      }
      
      // Team Lead can see projects for their team
      if (mappedRole === 'team_lead' && permissions.projects.viewAssigned) {
        // This assumes userProjects is already filtered for the Team Lead
        const projectIds = userProjects.map(p => p.id);
        return projects.filter(p => projectIds.includes(p.id));
      }
      
      // Developer can see only projects where they have assigned tasks
      if (mappedRole === 'developer' && permissions.projects.viewAssigned) {
        // Get project IDs from assigned tasks
        const projectIds = [...new Set(userTasks
          .filter(task => task.assignee_id === user.id)
          .map(task => task.project_id)
        )];
        
        return projects.filter(project => projectIds.includes(project.id));
      }
      
      return [];
    },
    [user, getRolePermissions, userProjects, userTasks]
  );

  /**
   * Filter tasks based on user's role and permissions
   */
  const filterTasks = useCallback(
    (tasks: Task[]): Task[] => {
      if (!user) return [];
      
      // Get mapped role and permissions
      const mappedRole = getMappedRole();
      const permissions = getRolePermissions();
      if (!permissions) return [];
      
      // Admin can see all tasks
      if (mappedRole === 'admin') return tasks;
      
      // Project Manager can see all tasks in their projects
      if (mappedRole === 'project_manager' && permissions.tasks.viewAssigned) {
        const projectIds = userProjects.map(p => p.id);
        return tasks.filter(task => projectIds.includes(task.project_id));
      }
      
      // Team Lead can see all tasks in their team's projects
      if (mappedRole === 'team_lead' && permissions.tasks.viewTeam) {
        // Get project IDs managed by the team lead
        const projectIds = userProjects.map(p => p.id);
        // Get all tasks in those projects
        return tasks.filter(task => projectIds.includes(task.project_id));
      }
      
      // Developer can see only their assigned tasks
      if (mappedRole === 'developer' && permissions.tasks.viewAssigned) {
        return tasks.filter(task => task.assignee_id === user.id);
      }
      
      return [];
    },
    [user, getRolePermissions, userProjects]
  );

  /**
   * Check if user can access a specific module
   */
  const canAccessModule = useCallback(
    (module: keyof RolePermissions): boolean => {
      if (!user) return false;
      
      const permissions = getRolePermissions();
      if (!permissions || !permissions[module]) return false;
      
      return (permissions[module] as any).view === true;
    },
    [user, getRolePermissions]
  );

  return {
    hasRolePermission,
    canViewProject,
    canEditProject,
    canViewTask,
    canEditTask,
    filterProjects,
    filterTasks,
    canAccessModule,
    getRolePermissions,
    getMappedRole
  };
};

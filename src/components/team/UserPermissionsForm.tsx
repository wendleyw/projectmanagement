import React, { useState, useEffect } from 'react';
import { User, UserPermissions, ProjectMember, TaskAssignment } from '../../store/userStore';
import useUserStore from '../../store/userStore';
import useProjectStore from '../../store/projectStore';
import useTaskStore from '../../store/taskStore';
import Button from '../ui/Button';
import { Briefcase, CheckSquare, Calendar, Clock } from 'lucide-react';
import { showNotification } from '../../utils/notifications';

interface UserPermissionsFormProps {
  user: User;
  onClose: () => void;
}

const UserPermissionsForm: React.FC<UserPermissionsFormProps> = ({ user, onClose }) => {
  const { updateUserPermissions, addProjectMember, removeProjectMember, assignTask, unassignTask } = useUserStore();
  const { projects } = useProjectStore();
  const { tasks } = useTaskStore();
  
  // State for permissions being edited
  const [permissions, setPermissions] = useState<UserPermissions>({
    projectIds: user.permissions?.projectIds || [],
    taskIds: user.permissions?.taskIds || [],
    calendarAccess: user.permissions?.calendarAccess || false,
    trackingAccess: user.permissions?.trackingAccess || false,
    projectMemberships: user.permissions?.projectMemberships || [],
    taskAssignments: user.permissions?.taskAssignments || []
  });
  
  // Mapping IDs to objects for easier lookup
  const [projectMembershipsMap, setProjectMembershipsMap] = useState<Record<string, ProjectMember>>({});
  const [taskAssignmentsMap, setTaskAssignmentsMap] = useState<Record<string, TaskAssignment>>({});
  
  // State to control which projects are expanded to show their tasks
  const [expandedProjects, setExpandedProjects] = useState<string[]>([]);
  
  // Function to toggle project expansion
  const toggleProjectExpansion = (projectId: string) => {
    setExpandedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId) 
        : [...prev, projectId]
    );
  };
  
  // Effect to initialize maps when component mounts or when permissions change
  useEffect(() => {
    // Create project membership map for easier lookup
    const projectMembershipsMapTemp: Record<string, ProjectMember> = {};
    permissions.projectMemberships?.forEach(membership => {
      // Use project_id if available, otherwise use projectId for compatibility
      const projectId = membership.project_id || membership.projectId;
      if (projectId) {
        projectMembershipsMapTemp[projectId] = membership;
      }
    });
    setProjectMembershipsMap(projectMembershipsMapTemp);
    
    // Create task assignments map for easier lookup
    const taskAssignmentsMapTemp: Record<string, TaskAssignment> = {};
    permissions.taskAssignments?.forEach(assignment => {
      // Use task_id if available, otherwise use taskId for compatibility
      const taskId = assignment.task_id || assignment.taskId;
      if (taskId) {
        taskAssignmentsMapTemp[taskId] = assignment;
      }
    });
    setTaskAssignmentsMap(taskAssignmentsMapTemp);
  }, [permissions.projectMemberships, permissions.taskAssignments]);

  // Function to toggle project selection
  const toggleProjectSelection = async (projectId: string) => {
    const isSelected = permissions.projectIds.includes(projectId);
    
    if (isSelected) {
      // If removing a project, remove the association in the new system
      const membership = projectMembershipsMap[projectId];
      if (membership) {
        const success = await removeProjectMember(membership.id);
        if (success) {
          // Atualizar o estado local
          setPermissions(prev => {
            // If removing a project, also remove all its tasks
            const projectTasks = tasks.filter(task => task.project_id === projectId).map(task => task.id);
            return {
              ...prev,
              projectIds: prev.projectIds.filter(id => id !== projectId),
              taskIds: prev.taskIds.filter(id => !projectTasks.includes(id)),
              projectMemberships: (prev.projectMemberships || []).filter(m => (m.project_id || m.projectId) !== projectId)
            };
          });
        }
      } else {
        // If there is no association in the new system yet, just update the local state
        setPermissions(prev => {
          const projectTasks = tasks.filter(task => task.project_id === projectId).map(task => task.id);
          return {
            ...prev,
            projectIds: prev.projectIds.filter(id => id !== projectId),
            taskIds: prev.taskIds.filter(id => !projectTasks.includes(id))
          };
        });
      }
    } else {
      // If adding a project, create the association in the new system
      const success = await addProjectMember(user.id, projectId, 'member');
      if (success) {
        // Atualizar o estado local
        setPermissions(prev => ({
          ...prev,
          projectIds: [...prev.projectIds, projectId]
        }));
      }
    }
  };
  
  // Function to toggle task selection
  const toggleTaskSelection = async (taskId: string, projectId: string) => {
    const isSelected = permissions.taskIds.includes(taskId);
    
    if (isSelected) {
      // If removing a task, remove the assignment in the new system
      const assignment = taskAssignmentsMap[taskId];
      if (assignment) {
        const success = await unassignTask(assignment.id);
        if (success) {
          // Atualizar o estado local
          setPermissions(prev => ({
            ...prev,
            taskIds: prev.taskIds.filter(id => id !== taskId),
            taskAssignments: (prev.taskAssignments || []).filter(a => a.task_id !== taskId)
          }));
        }
      } else {
        // If there is no assignment in the new system yet, just update the local state
        setPermissions(prev => ({
          ...prev,
          taskIds: prev.taskIds.filter(id => id !== taskId)
        }));
      }
    } else {
      // If adding a task, create the assignment in the new system
      // First, make sure the project is also selected
      if (!permissions.projectIds.includes(projectId)) {
        await toggleProjectSelection(projectId);
      }
      
      const success = await assignTask(taskId, user.id);
      if (success) {
        // Atualizar o estado local
        setPermissions(prev => ({
          ...prev,
          taskIds: [...prev.taskIds, taskId]
        }));
      }
    }
  };
  
  // Function to toggle calendar access
  const toggleCalendarAccess = () => {
    setPermissions(prev => ({
      ...prev,
      calendarAccess: !prev.calendarAccess
    }));
  };
  
  // Function to toggle tracking access
  const toggleTrackingAccess = () => {
    setPermissions(prev => ({
      ...prev,
      trackingAccess: !prev.trackingAccess
    }));
  };
  
  // Function to select all tasks of a project
  const selectAllProjectTasks = async (projectId: string) => {
    const projectTasks = tasks.filter(task => task.project_id === projectId).map(task => task.id);
    
    // First, make sure the project is selected
    if (!permissions.projectIds.includes(projectId)) {
      await toggleProjectSelection(projectId);
    }
    
    // For each task that is not yet selected, assign it to the user
    for (const taskId of projectTasks) {
      if (!permissions.taskIds.includes(taskId)) {
        await assignTask(taskId, user.id);
      }
    }
    
    // Update local state
    setPermissions(prev => {
      // Add all project tasks that are not yet selected
      const currentTaskIds = new Set(prev.taskIds);
      projectTasks.forEach(taskId => currentTaskIds.add(taskId));
      
      return {
        ...prev,
        projectIds: prev.projectIds.includes(projectId) ? prev.projectIds : [...prev.projectIds, projectId],
        taskIds: Array.from(currentTaskIds)
      };
    });
  };
  
  // Function to deselect all tasks of a project
  const deselectAllProjectTasks = async (projectId: string) => {
    const projectTasks = tasks.filter(task => task.project_id === projectId).map(task => task.id);
    
    // For each selected task, remove the assignment
    for (const taskId of projectTasks) {
      if (permissions.taskIds.includes(taskId)) {
        const assignment = taskAssignmentsMap[taskId];
        if (assignment) {
          await unassignTask(assignment.id);
        }
      }
    }
    
    // Atualizar o estado local
    setPermissions(prev => ({
      ...prev,
      taskIds: prev.taskIds.filter(id => !projectTasks.includes(id)),
      taskAssignments: (prev.taskAssignments || []).filter(a => !projectTasks.includes(a.task_id))
    }));
  };
  
  // Function to save permissions
  const handleSavePermissions = async () => {
    try {
      // Save permissions in the old system to maintain compatibility
      const success = await updateUserPermissions(user.id, {
        projectIds: permissions.projectIds,
        taskIds: permissions.taskIds,
        calendarAccess: permissions.calendarAccess,
        trackingAccess: permissions.trackingAccess
      });
      
      if (success) {
        showNotification(`Permissões de ${user.firstName} ${user.lastName} atualizadas com sucesso`, 'success');
        onClose();
      }
    } catch (error) {
      console.error('Erro ao salvar permissões:', error);
      showNotification('Erro ao salvar permissões', 'error');
    }
  };
  
  return (
    <div className="p-3 sm:p-6">
      <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
        Manage Permissions - {user.firstName} {user.lastName}
      </h2>
      
      <div className="space-y-4 sm:space-y-6">
        {/* Projects Section */}
        <div className="bg-gray-50 p-3 sm:p-4 rounded-md sm:rounded-lg border border-gray-200">
          <h3 className="text-sm sm:text-md font-medium text-gray-800 flex items-center mb-2 sm:mb-3">
            <Briefcase size={16} className="sm:w-[18px] sm:h-[18px] mr-1.5 sm:mr-2 text-blue-600 flex-shrink-0" />
            Project Access
          </h3>
          
          <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-60 overflow-y-auto pr-1 sm:pr-2">
            {projects.length === 0 ? (
              <p className="text-xs sm:text-sm text-gray-500">No projects available</p>
            ) : (
              projects.map(project => (
                <div key={project.id} className="border border-gray-200 rounded-md sm:rounded-lg bg-white">
                  <div className="p-2 sm:p-3 flex items-center justify-between flex-wrap sm:flex-nowrap gap-2">
                    <div className="flex items-center min-w-0">
                      <input
                        type="checkbox"
                        id={`project-${project.id}`}
                        checked={permissions.projectIds.includes(project.id)}
                        onChange={() => toggleProjectSelection(project.id)}
                        className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 flex-shrink-0"
                      />
                      <label htmlFor={`project-${project.id}`} className="ml-1.5 sm:ml-2 text-xs sm:text-sm font-medium text-gray-700 truncate">
                        {project.name}
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-1.5 sm:space-x-2 ml-auto">
                      <button
                        type="button"
                        onClick={() => selectAllProjectTasks(project.id)}
                        className="text-[10px] sm:text-xs bg-blue-50 text-blue-600 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded hover:bg-blue-100 transition-colors"
                      >
                        All
                      </button>
                      <button
                        type="button"
                        onClick={() => deselectAllProjectTasks(project.id)}
                        className="text-[10px] sm:text-xs bg-gray-100 text-gray-600 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded hover:bg-gray-200 transition-colors"
                      >
                        None
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleProjectExpansion(project.id)}
                        className="text-gray-500 hover:text-gray-700 flex-shrink-0"
                      >
                        <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          {expandedProjects.includes(project.id) ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          )}
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Project tasks list */}
                  {expandedProjects.includes(project.id) && (
                    <div className="border-t border-gray-100 p-2 sm:p-3 bg-gray-50">
                      <h4 className="text-[10px] sm:text-xs font-medium text-gray-500 mb-1.5 sm:mb-2 flex items-center">
                        <CheckSquare size={12} className="sm:w-[14px] sm:h-[14px] mr-1 flex-shrink-0" /> Tasks
                      </h4>
                      
                      <div className="space-y-1.5 sm:space-y-2 max-h-32 sm:max-h-40 overflow-y-auto pl-2 sm:pl-4">
                        {tasks.filter(task => task.project_id === project.id).length === 0 ? (
                          <p className="text-[10px] sm:text-xs text-gray-500">No tasks available</p>
                        ) : (
                          tasks
                            .filter(task => task.project_id === project.id)
                            .map(task => (
                              <div key={task.id} className="flex items-center min-w-0">
                                <input
                                  type="checkbox"
                                  id={`task-${task.id}`}
                                  checked={permissions.taskIds.includes(task.id)}
                                  onChange={() => toggleTaskSelection(task.id, project.id)}
                                  className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 flex-shrink-0"
                                />
                                <label htmlFor={`task-${task.id}`} className="ml-1.5 sm:ml-2 text-[10px] sm:text-xs text-gray-700 truncate">
                                  {task.title}
                                </label>
                              </div>
                            ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Calendar and Tracking Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-gray-50 p-3 sm:p-4 rounded-md sm:rounded-lg border border-gray-200">
            <h3 className="text-sm sm:text-md font-medium text-gray-800 flex items-center mb-2 sm:mb-3">
              <Calendar size={16} className="sm:w-[18px] sm:h-[18px] mr-1.5 sm:mr-2 text-indigo-600 flex-shrink-0" />
              Calendar Access
            </h3>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="calendar-access"
                checked={permissions.calendarAccess}
                onChange={toggleCalendarAccess}
                className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 flex-shrink-0"
              />
              <label htmlFor="calendar-access" className="ml-1.5 sm:ml-2 text-xs sm:text-sm text-gray-700">
                Allow calendar view
              </label>
            </div>
            
            <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-gray-500">
              User will be able to see calendar events related to assigned projects and tasks.
            </p>
          </div>
          
          <div className="bg-gray-50 p-3 sm:p-4 rounded-md sm:rounded-lg border border-gray-200">
            <h3 className="text-sm sm:text-md font-medium text-gray-800 flex items-center mb-2 sm:mb-3">
              <Clock size={16} className="sm:w-[18px] sm:h-[18px] mr-1.5 sm:mr-2 text-emerald-600 flex-shrink-0" />
              Tracking Access
            </h3>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="tracking-access"
                checked={permissions.trackingAccess}
                onChange={toggleTrackingAccess}
                className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 flex-shrink-0"
              />
              <label htmlFor="tracking-access" className="ml-1.5 sm:ml-2 text-xs sm:text-sm text-gray-700">
                Allow time tracking
              </label>
            </div>
            
            <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-gray-500">
              User will be able to record time and progress on assigned tasks.
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 sm:mt-6 flex justify-end space-x-2 sm:space-x-3">
        <Button
          variant="outline"
          onClick={onClose}
          className="text-xs sm:text-sm py-1.5 sm:py-2 px-2.5 sm:px-3"
        >
          Cancel
        </Button>
        
        <Button
          variant="primary"
          onClick={handleSavePermissions}
          className="text-xs sm:text-sm py-1.5 sm:py-2 px-2.5 sm:px-3"
        >
          Save Permissions
        </Button>
      </div>
    </div>
  );
};

export default UserPermissionsForm;

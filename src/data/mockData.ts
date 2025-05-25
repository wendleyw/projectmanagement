import { User, Client, Project, Task, TimeEntry, CalendarEvent } from '../types';

// Funu00e7u00e3o para gerar IDs aleatou00f3rios (utilizada no notificationStore)
// Mantida aqui como referencia para futura implementau00e7u00e3o de novos itens

// Gerar uma data dentro de um intervalo específico de dias (passados ou futuros)
const generateDateInRange = (minDays: number, maxDays: number): string => {
  const date = new Date();
  const daysToAdd = minDays + Math.floor(Math.random() * (maxDays - minDays));
  date.setDate(date.getDate() + daysToAdd);
  return date.toISOString();
};

// Gerar uma data recente (nos últimos 30 dias)
const generateRecentDate = (): string => {
  return generateDateInRange(-30, -1);
};

// Gerar uma data futura (nos próximos 60 dias)
const generateFutureDate = (): string => {
  return generateDateInRange(1, 60);
};

// Gerar um par de datas onde a primeira é sempre anterior à segunda
export const generateDatePair = (): [string, string] => {
  const startDate = generateDateInRange(-30, 0); // Data de início entre 30 dias atrás e hoje
  const endDateObj = new Date(startDate);
  endDateObj.setDate(endDateObj.getDate() + Math.floor(Math.random() * 90) + 30); // Pelo menos 30 dias depois da data de início
  return [startDate, endDateObj.toISOString()];
};

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'user1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
    role: 'admin',
    createdAt: generateRecentDate(),
    updatedAt: generateRecentDate(),
  },
  {
    id: 'user2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
    role: 'manager',
    createdAt: generateRecentDate(),
    updatedAt: generateRecentDate(),
  },
  {
    id: 'user3',
    firstName: 'Michael',
    lastName: 'Johnson',
    email: 'michael.johnson@example.com',
    avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150',
    role: 'member',
    createdAt: generateRecentDate(),
    updatedAt: generateRecentDate(),
  },
  {
    id: 'user4',
    firstName: 'Emily',
    lastName: 'Brown',
    email: 'emily.brown@example.com',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
    role: 'member',
    createdAt: generateRecentDate(),
    updatedAt: generateRecentDate(),
  },
  {
    id: 'user5',
    firstName: 'David',
    lastName: 'Wilson',
    email: 'david.wilson@example.com',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
    role: 'client',
    createdAt: generateRecentDate(),
    updatedAt: generateRecentDate(),
  },
];

// Mock Clients
export const mockClients: Client[] = [
  {
    id: 'client1',
    name: 'Acme Corporation',
    contactName: 'Robert Johnson',
    email: 'robert@acmecorp.com',
    phone: '555-123-4567',
    address: '123 Main St, New York, NY 10001',
    createdAt: generateRecentDate(),
    status: 'active',
  },
  {
    id: 'client2',
    name: 'GlobalTech Solutions',
    contactName: 'Maria Garcia',
    email: 'maria@globaltech.com',
    phone: '555-987-6543',
    address: '456 Tech Ave, San Francisco, CA 94105',
    createdAt: generateRecentDate(),
    status: 'active',
  },
  {
    id: 'client3',
    name: 'Northern Designs',
    contactName: 'James Smith',
    email: 'james@northerndesigns.com',
    phone: '555-456-7890',
    address: '789 Design Blvd, Chicago, IL 60601',
    createdAt: generateRecentDate(),
    status: 'inactive',
  },
];

// Mock Projects
export const mockProjects: Project[] = [
  {
    id: 'project1',
    name: 'Website Redesign',
    description: 'Complete redesign of company website with modern UI/UX',
    clientId: 'client1',
    ...(() => {
      const [start, end] = generateDatePair();
      return { startDate: start, endDate: end };
    })(),
    status: 'in-progress',
    budget: 15000,
    managerId: 'user2',
    createdAt: generateRecentDate(),
    updatedAt: generateRecentDate(),
  },
  {
    id: 'project2',
    name: 'Mobile App Development',
    description: 'Create a native mobile app for iOS and Android',
    clientId: 'client2',
    ...(() => {
      const [start, end] = generateDatePair();
      return { startDate: start, endDate: end };
    })(),
    status: 'planned',
    budget: 25000,
    managerId: 'user2',
    createdAt: generateRecentDate(),
    updatedAt: generateRecentDate(),
  },
  {
    id: 'project3',
    name: 'Marketing Campaign',
    description: 'Digital marketing campaign for Q4 product launch',
    clientId: 'client1',
    ...(() => {
      const [start, end] = generateDatePair();
      return { startDate: start, endDate: end };
    })(),
    status: 'on-hold',
    budget: 10000,
    managerId: 'user2',
    createdAt: generateRecentDate(),
    updatedAt: generateRecentDate(),
  },
  {
    id: 'project4',
    name: 'CRM Integration',
    description: 'Integrate new CRM system with existing platform',
    clientId: 'client3',
    ...(() => {
      const [start, end] = generateDatePair();
      // Para projetos completos, a data de término real é anterior à data de término planejada
      const actualEnd = new Date(start);
      actualEnd.setDate(actualEnd.getDate() + Math.floor((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24) * 0.8));
      return { 
        startDate: start, 
        endDate: end,
        actualEndDate: actualEnd.toISOString()
      };
    })(),
    status: 'completed',
    budget: 8000,
    managerId: 'user2',
    createdAt: generateRecentDate(),
    updatedAt: generateRecentDate(),
  },
];

// Mock Tasks
export const mockTasks: Task[] = [
  {
    id: 'task1',
    projectId: 'project1',
    title: 'Create wireframes',
    description: 'Design initial wireframes for homepage and key pages',
    assigneeId: 'user3',
    priority: 'high',
    status: 'completed',
    createdAt: generateRecentDate(),
    startDate: generateRecentDate(),
    dueDate: generateRecentDate(),
    estimatedHours: 10,
  },
  {
    id: 'task2',
    projectId: 'project1',
    title: 'Develop frontend components',
    description: 'Implement React components based on approved designs',
    assigneeId: 'user3',
    priority: 'high',
    status: 'in-progress',
    createdAt: generateRecentDate(),
    startDate: generateRecentDate(),
    dueDate: generateFutureDate(),
    estimatedHours: 20,
  },
  {
    id: 'task3',
    projectId: 'project1',
    title: 'Set up API endpoints',
    description: 'Create RESTful API endpoints for frontend integration',
    assigneeId: 'user4',
    priority: 'medium',
    status: 'todo',
    createdAt: generateRecentDate(),
    dueDate: generateFutureDate(),
    estimatedHours: 15,
  },
  {
    id: 'task4',
    projectId: 'project2',
    title: 'Design app UI',
    description: 'Create UI design mockups for mobile app',
    assigneeId: 'user3',
    priority: 'medium',
    status: 'in-progress',
    createdAt: generateRecentDate(),
    startDate: generateRecentDate(),
    dueDate: generateFutureDate(),
    estimatedHours: 25,
  },
  {
    id: 'task5',
    projectId: 'project2',
    title: 'Implement authentication',
    description: 'Develop user authentication and authorization',
    assigneeId: 'user4',
    priority: 'high',
    status: 'todo',
    createdAt: generateRecentDate(),
    dueDate: generateFutureDate(),
    estimatedHours: 15,
  },
  {
    id: 'task6',
    projectId: 'project3',
    title: 'Create marketing assets',
    description: 'Design graphics and assets for campaign',
    assigneeId: 'user3',
    priority: 'medium',
    status: 'blocked',
    createdAt: generateRecentDate(),
    startDate: generateRecentDate(),
    dueDate: generateFutureDate(),
    estimatedHours: 12,
  },
  {
    id: 'task7',
    projectId: 'project4',
    title: 'API integration',
    description: 'Connect CRM API with existing systems',
    assigneeId: 'user4',
    priority: 'high',
    status: 'completed',
    createdAt: generateRecentDate(),
    startDate: generateRecentDate(),
    dueDate: generateRecentDate(),
    estimatedHours: 18,
  },
  {
    id: 'task8',
    projectId: 'project4',
    title: 'Data migration',
    description: 'Migrate data from old system to new CRM',
    assigneeId: 'user4',
    priority: 'high',
    status: 'completed',
    createdAt: generateRecentDate(),
    startDate: generateRecentDate(),
    dueDate: generateRecentDate(),
    estimatedHours: 20,
  },
  {
    id: 'task9',
    projectId: 'project1',
    title: 'Revisar design do sistema',
    description: 'Revisar e aprovar os componentes de design do sistema',
    assigneeId: 'user2',
    priority: 'high',
    status: 'review',
    createdAt: generateRecentDate(),
    startDate: generateRecentDate(),
    dueDate: generateFutureDate(),
    estimatedHours: 8,
  },
];

// Mock Time Entries
export const mockTimeEntries: TimeEntry[] = [
  {
    id: 'time1',
    userId: 'user3',
    taskId: 'task1',
    projectId: 'project1',
    date: generateRecentDate(),
    hours: 2.5,
    description: 'Created initial wireframes for homepage',
    billable: true,
  },
  {
    id: 'time2',
    userId: 'user3',
    taskId: 'task1',
    projectId: 'project1',
    date: generateRecentDate(),
    hours: 3,
    description: 'Finalized wireframes and shared with team',
    billable: true,
  },
  {
    id: 'time3',
    userId: 'user3',
    taskId: 'task2',
    projectId: 'project1',
    date: generateRecentDate(),
    hours: 4,
    description: 'Started implementing header and footer components',
    billable: true,
  },
  {
    id: 'time4',
    userId: 'user4',
    taskId: 'task7',
    projectId: 'project4',
    date: generateRecentDate(),
    hours: 6,
    description: 'Integrated API and tested endpoints',
    billable: true,
  },
  {
    id: 'time5',
    userId: 'user4',
    taskId: 'task8',
    projectId: 'project4',
    date: generateRecentDate(),
    hours: 5,
    description: 'Started data migration process',
    billable: true,
  },
];

// Mock Calendar Events
export const mockCalendarEvents: CalendarEvent[] = [
  {
    id: 'event1',
    title: 'Website Design Review',
    description: 'Review website design mockups with client',
    startTime: generateFutureDate(),
    endTime: generateFutureDate(),
    type: 'task',
    userId: 'user2',
    projectId: 'project1',
  },
  {
    id: 'event2',
    title: 'Mobile App Feature Planning',
    description: 'Plan features for the next sprint',
    startTime: generateFutureDate(),
    endTime: generateFutureDate(),
    type: 'event',
    userId: 'user2',
    projectId: 'project2',
  },
  {
    id: 'event3',
    title: 'Project Deadline',
    description: 'Website Redesign project due date',
    startTime: generateFutureDate(),
    endTime: generateFutureDate(),
    type: 'milestone',
    userId: 'user2',
    projectId: 'project1',
  },
];

// Current logged in user
export const currentUser: User = mockUsers[0]; // Admin user
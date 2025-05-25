import { Meeting } from '../store/meetingStore';

// Funu00e7u00e3o para gerar datas aleatou00f3rias
const generateRandomDate = (start: Date, end: Date): string => {
  const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return randomDate.toISOString().split('T')[0];
};

// Datas para os prou00f3ximos 30 dias
const today = new Date();
const nextMonth = new Date();
nextMonth.setDate(today.getDate() + 30);

// Dados mockados para reuniu00f5es
export const mockMeetings: Meeting[] = [
  {
    id: 'meeting1',
    title: 'Reuniu00e3o de Kickoff - Website Redesign',
    description: 'Reuniu00e3o inicial para discutir os objetivos e escopo do projeto de redesign do website.',
    date: generateRandomDate(today, nextMonth),
    time: '09:00',
    duration: 60,
    projectId: 'project1',
    clientId: 'client1',
    location: 'Sala de Conferencia 1',
    meetingType: 'presencial',
    createdAt: new Date().toISOString()
  },
  {
    id: 'meeting2',
    title: 'Review de Design - App Mobile',
    description: 'Apresentau00e7u00e3o dos mockups do aplicativo mobile para aprovau00e7u00e3o do cliente.',
    date: generateRandomDate(today, nextMonth),
    time: '14:30',
    duration: 90,
    projectId: 'project2',
    clientId: 'client2',
    location: 'Online',
    meetingType: 'online',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    createdAt: new Date().toISOString()
  },
  {
    id: 'meeting3',
    title: 'Planejamento de Sprint',
    description: 'Definiu00e7u00e3o das tarefas para o prou00f3ximo sprint do projeto CRM.',
    date: generateRandomDate(today, nextMonth),
    time: '10:00',
    duration: 120,
    projectId: 'project4',
    clientId: 'client3',
    location: 'Sala de Reuniu00f5es 2',
    meetingType: 'presencial',
    createdAt: new Date().toISOString()
  },
  {
    id: 'meeting4',
    title: 'Demo de Funcionalidades',
    description: 'Demonstrau00e7u00e3o das novas funcionalidades implementadas no sistema.',
    date: generateRandomDate(today, nextMonth),
    time: '15:00',
    duration: 60,
    projectId: 'project3',
    clientId: 'client4',
    location: 'Online',
    meetingType: 'online',
    meetingLink: 'https://zoom.us/j/123456789',
    createdAt: new Date().toISOString()
  },
  {
    id: 'meeting5',
    title: 'Reuniu00e3o de Status Semanal',
    description: 'Atualizau00e7u00e3o do progresso e discussu00e3o de bloqueios.',
    date: generateRandomDate(today, nextMonth),
    time: '11:00',
    duration: 45,
    projectId: 'project1',
    clientId: 'client1',
    location: 'Online',
    meetingType: 'online',
    meetingLink: 'https://teams.microsoft.com/l/meetup-join/123',
    createdAt: new Date().toISOString()
  }
];

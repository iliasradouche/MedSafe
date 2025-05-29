import {
  UserOutlined,
  TeamOutlined,
  ReadOutlined,
  CalendarOutlined,
  FileTextOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';

export const menuItemsByRole = [
  {
    key: 'profile',
    label: 'Profile',
    icon: <UserOutlined />,
    to: '/profile',
    roles: ['ADMIN','MEDECIN','PATIENT']
  },
  {
    key: 'patients',
    label: 'Patients',
    icon: <TeamOutlined />,
    to: '/patients',
    roles: ['ADMIN','MEDECIN']
  },
  {
    key: 'consultations',
    label: 'Consultations',
    icon: <ReadOutlined />,          // consultations → book of notes
    to: '/consultations',
    roles: ['ADMIN','MEDECIN']
  },
  {
    key: 'appointments',
    label: 'Appointments',
    icon: <CalendarOutlined />,      // appointments → calendar
    to: '/appointments',
    roles: ['ADMIN','MEDECIN','PATIENT']
  },
  {
    key: 'ordonnances',
    label: 'Ordonnances',
    icon: <FileTextOutlined />,      // prescriptions → text file
    to: '/ordonnances',
    roles: ['ADMIN','MEDECIN']
  },
  {
    key: 'availability',
    label: 'Availability',
    icon: <ClockCircleOutlined />,   // availability → clock
    to: '/availability',
    roles: ['ADMIN','MEDECIN']
  }
];

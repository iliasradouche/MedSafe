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
    label: 'Profil',
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
    icon: <ReadOutlined />,
    to: '/consultations',
    roles: ['ADMIN','MEDECIN','PATIENT']
  },
  {
    key: 'appointments',
    label: 'Rendez-vous',
    icon: <CalendarOutlined />,
    to: '/appointments',
    roles: ['ADMIN','MEDECIN','PATIENT']
  },
  {
    key: 'ordonnances',
    label: 'Ordonnances',
    icon: <FileTextOutlined />,
    to: '/ordonnances',
    roles: ['ADMIN','MEDECIN','PATIENT']
  },
  {
    key: 'availability',
    label: 'Disponibilités',
    icon: <ClockCircleOutlined />,
    to: '/availability',
    roles: ['ADMIN','MEDECIN']
  }
];
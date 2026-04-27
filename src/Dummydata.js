// DummyData.js - Mock visitor database for Visitor Management System

export const VISITOR_STATUS = {
  PRE_REGISTERED: 'PRE_REGISTERED',
  ON_PREMISES: 'ON_PREMISES',
  SIGNED_OFF: 'SIGNED_OFF',
  EXITED: 'EXITED',
};

export const DUMMY_VISITORS = [
  {
    id: 'VIS-2025-001',
    name: 'Rahul Sharma',
    company: 'TechNova Solutions Pvt. Ltd.',
    phone: '+91 98201 45678',
    purpose: 'Product Demo & Partnership Discussion',
    department: 'Business Development',
    host: 'Anjali Mehta',
    status: VISITOR_STATUS.PRE_REGISTERED,
    preRegisteredAt: '2025-07-15T09:00:00.000Z',
    checkInAt: null,
    signedOffAt: null,
    exitedAt: null,
    photo: null,
    signature: null,
    gatepassNumber: null,
    otp: null,
  },
  {
    id: 'VIS-2025-002',
    name: 'Priya Nair',
    company: 'InfraBuild Corp.',
    phone: '+91 91234 56789',
    purpose: 'Annual Audit Review',
    department: 'Finance & Accounts',
    host: 'Vikram Rao',
    status: VISITOR_STATUS.ON_PREMISES,
    preRegisteredAt: '2025-07-15T08:30:00.000Z',
    checkInAt: '2025-07-15T10:15:00.000Z',
    signedOffAt: null,
    exitedAt: null,
    photo: null,
    signature: null,
    gatepassNumber: 'GP-20250715-0042',
    otp: null,
  },
  {
    id: 'VIS-2025-003',
    name: 'Aditya Kulkarni',
    company: 'Zenith HR Consulting',
    phone: '+91 87654 32109',
    purpose: 'Interview Panel – Senior Engineer Role',
    department: 'Human Resources',
    host: 'Sneha Patil',
    status: VISITOR_STATUS.SIGNED_OFF,
    preRegisteredAt: '2025-07-15T07:00:00.000Z',
    checkInAt: '2025-07-15T09:00:00.000Z',
    signedOffAt: '2025-07-15T11:45:00.000Z',
    exitedAt: null,
    photo: null,
    signature: null,
    gatepassNumber: 'GP-20250715-0031',
    otp: null,
  },
  {
    id: 'VIS-2025-004',
    name: 'Meera Joshi',
    company: 'PixelCraft Studios',
    phone: '+91 99887 66554',
    purpose: 'UX Design Workshop',
    department: 'Product & Design',
    host: 'Rohan Desai',
    status: VISITOR_STATUS.EXITED,
    preRegisteredAt: '2025-07-14T08:00:00.000Z',
    checkInAt: '2025-07-14T09:30:00.000Z',
    signedOffAt: '2025-07-14T12:00:00.000Z',
    exitedAt: '2025-07-14T12:22:00.000Z',
    photo: null,
    signature: null,
    gatepassNumber: 'GP-20250714-0018',
    otp: null,
  },
];

export const generateGatepassNumber = () => {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randPart = String(Math.floor(Math.random() * 9000) + 1000);
  return `GP-${datePart}-${randPart}`;
};

export const generateOTP = () => {
  return String(Math.floor(100000 + Math.random() * 900000));
};
// src/utils/constants.ts
import type { Column, Patient } from '@/types/worklist';

export const initialColumns: Column[] = [
  { key: 'name', label: 'Patient Name', type: 'text' },
  { key: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
  { key: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'] },
  { key: 'tasks', label: 'Tasks', type: 'tasks' }
];

export const initialData: Patient[] = [
  {
    id: '1',
    name: 'John Doe',
    dateOfBirth: '1990-01-01',
    gender: 'Male',
    tasks: ['Lab Review', 'Follow-up']
  },
  {
    id: '2',
    name: 'Jane Smith',
    dateOfBirth: '1985-05-15',
    gender: 'Female',
    tasks: ['Initial Consultation']
  }
];
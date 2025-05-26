// src/utils/constants.ts
import type { ColumnDefinition, Patient } from '@/types/worklist';

export const initialColumns: ColumnDefinition[] = [
  { key: 'name', name: 'Patient Name', type: 'string', id: 'name' },
  { key: 'dateOfBirth', name: 'Date of Birth', type: 'date', id: 'dateOfBirth' },
  { key: 'gender', name: 'Gender', type: 'select', options: [{ value: 'Male', color: '#000000' }, { value: 'Female', color: '#000000' }, { value: 'Other', color: '#000000' }], id: 'gender' },
  { key: 'tasks', name: 'Tasks', type: 'tasks', id: 'tasks' }
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
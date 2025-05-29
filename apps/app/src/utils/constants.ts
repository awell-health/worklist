// src/utils/constants.ts
import type { ColumnDefinition, Patient, WorklistDefinition } from '@/types/worklist';

export const DEFAULT_WORKLIST_PATIENT_VIEW: WorklistDefinition = {
  title: "New Patient Worklist",
  columns: [
    {
      name: "Patient Name",
      type: "string",
      key: "name",
      description: "Patient's full name",
      id: "name",
    },
    {
      name: "Date of Birth",
      type: "date",
      key: "birthDate",
      description: "Patient's date of birth",
      id: "birthDate",
    },
    {
      name: "Gender",
      type: "string",
      key: "gender",
      description: "Patient's gender",  
      id: "gender",
    },
    {
      name: "Tasks",
      type: "string",
      key: "taskDescriptionsSummary",
      description: "Tasks for this patient",
      id: "taskDescriptionsSummary",
    },
  ],
}

export const DEFAULT_WORKLIST_TASK_VIEW: WorklistDefinition = {
  title: "New Task Worklist",
  columns: [
    {
      name: "Task ID",
      type: "string",
      key: "id",
      description: "Task ID",
      id: "taskId",
    },
    {
      name: "Patient Name",
      type: "string",
      key: "patientName",
      description: "Patient's full name",
      id: "patientName",
    },  
    {
      name: "Description",
      type: "string",
      key: "description",
      description: "Task description",
      id: "description",
    },
    {
      name: "Status",
      type: "string",
      key: "status",
      description: "Task status",
      id: "status",
    },
    {
      name: "Priority",
      type: "string",
      key: "priority",
      description: "Task priority",
      id: "priority"
    },
    {
      name: "Due Date",
      type: "date",
      key: "executionPeriod.end",
      description: "Task due date",
      id: "executionPeriod.end"
    },
    {
      name: "Assignee",
      type: "assignee",
      key: "owner.display",
      description: "Task assignee",
      id: "assignee"
    }
  ],
}

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
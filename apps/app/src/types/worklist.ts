// src/types/worklist.ts

export type Filter = {
  fhirPathFilter: string[]
}

export interface Patient {
  id: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  tasks?: string[];
  // For dynamic columns, allow additional properties
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  [key: string]: any;
}

export type ColumnDefinition = {
  id: string;
  key: string;
  name: string
  type: "string" | "number" | "date" | "boolean" | "tasks" | "select" | "array" | "assignee"
  description?: string
  source?: string
  options?: Array<{ value: string; color: string }>
}

// TODO remove it or make it private or refator it, should contain views as optional
export type WorklistDefinition = {
  id: string
  title: string
  filters: Filter[]
  taskViewColumns: ColumnDefinition[]
  patientViewColumns: ColumnDefinition[]
  createdAt: string
  views?: ViewDefinition[]
}

export type PanelDefinition = WorklistDefinition
export type ViewDefinition = WorklistDefinition

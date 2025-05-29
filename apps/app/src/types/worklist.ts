// src/types/worklist.ts

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

export type WorklistDefinition = {
  title: string
  columns: ColumnDefinition[]
}

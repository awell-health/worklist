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

export interface Column {
  key: string;
  label: string;
  type: "text" | "date" | "select" | "tasks";
  options?: string[]; // Only for 'select' type
}

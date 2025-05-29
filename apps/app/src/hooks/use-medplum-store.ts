import { useState, useEffect, useMemo } from 'react';
import { Bot, Patient, Practitioner, Task } from '@medplum/fhirtypes';
import { medplumStore } from '@/lib/medplum';

// Types for our worklist data
export type WorklistPatient = {
  id: string;
  name: string;
  [key: string]: any; // For dynamic columns
};

export type WorklistTask = {
  id: string;
  description: string;
  status: string;
  priority?: string;
  dueDate?: string;
  patientId: string;
  patientName: string;
  [key: string]: any; // For dynamic columns
};


// Helper methods
function getPatientName(patient: Patient): string {
  if (!patient.name || patient.name.length === 0) return 'Unknown';
  const name = patient.name[0];
  return `${name.given?.join(' ') || ''} ${name.family || ''}`.trim();
}

const mapMedplumDataToWorklistFormat = (
  patients: Patient[],
  tasks: Task[]
): WorklistPatient[] => {
  return patients.map(patient => {
    const patientTasks = tasks.filter(task => task.for?.reference === `${patient.resourceType}/${patient.id}`);
    const taskDescriptions = patientTasks.map(task => task.description).join("; ");
    const rawPatient = patient as Patient;

    return {
      id: patient.id || '',

      ...rawPatient,
      name: getPatientName(patient),
      taskDescriptionsSummary: taskDescriptions,
      tasks: patientTasks.map(task => ({
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.executionPeriod?.end
      }))
    };
  });
};

const mapTaskToWorklistData = (  patients: Patient[], tasks: Task[]): WorklistTask[] => {
  return tasks.map(task => {
    const patient = patients.find(p => `${p.resourceType}/${p.id}` === task.for?.reference);
    return {
      ...task,
      id: task.id || '',
      status: task.status || 'unknown',
      priority: task.priority,
      description: task.description || '',
      patientId: patient?.id || '',
      patientName: patient ? getPatientName(patient) : '',
      
    };
  });
};

export function useMedplumStore(): {
  patients: WorklistPatient[];
  tasks: WorklistTask[];
  ingestionBots: Bot[];
  enrichmentBots: Bot[];
  connectorBots: Bot[];
  isLoading: boolean;
  error: Error | null;
  accessToken: string | null;
  addNotesToTask: (taskId: string, notes: string) => Promise<Task>;
  addTaskOwner: (taskId: string, authenticatedUserId: string) => Promise<Task>;
} {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [ingestionBots, setIngestionBots] = useState<Bot[]>([]);
  const [enrichmentBots, setEnrichmentBots] = useState<Bot[]>([]);
  const [connectorBots, setConnectorBots] = useState<Bot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // TODO: Mapping should disappear, we should use FHIR resources directly
  const mappedPatients = useMemo(() => 
    mapMedplumDataToWorklistFormat(patients, tasks),
    [patients, tasks]
  );
  
  const mappedTasks = useMemo(() => 
    mapTaskToWorklistData(patients, tasks),
    [patients, tasks]
  );

  const updateResource = <T extends { id?: string }>(
    currentResources: T[],
    updatedResource: T
  ): T[] => {
    const resourceIndex = currentResources.findIndex(r => r.id === updatedResource.id);
    if (resourceIndex === -1) {
      return [...currentResources, updatedResource];
    }
    const newResources = [...currentResources];
    newResources[resourceIndex] = updatedResource;
    return newResources;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [loadedPatients, loadedTasks, loadedIngestionBots, loadedEnrichmentBots, loadedConnectorBots, loadedAccessToken] = await Promise.all([
          medplumStore.getPatients(),
          medplumStore.getTasks(),
          medplumStore.getIngestionBots(),
          medplumStore.getEnrichmentBots(),
          medplumStore.getConnectorBots(),
          medplumStore.getAccessToken()
        ]);
        setPatients(loadedPatients);
        setTasks(loadedTasks);
        setIngestionBots(loadedIngestionBots);
        setEnrichmentBots(loadedEnrichmentBots);
        setConnectorBots(loadedConnectorBots);
        setAccessToken(loadedAccessToken || null);
    

        medplumStore.subscribeToTasks((updatedTask) => {
          setTasks(currentTasks => updateResource(currentTasks, updatedTask));
        });
        medplumStore.subscribeToPatients((updatedPatient) => {
          setPatients(currentPatients => updateResource(currentPatients, updatedPatient));
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load data'));
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  async function addNotesToTask(taskId: string, note: string) {
    const task = await medplumStore.addNoteToTask(taskId, note);
    setTasks(currentTasks => updateResource(currentTasks, task));
    return task;
  }

  async function addTaskOwner(taskId: string, authenticatedUserId: string) {
    const task = await medplumStore.addTaskOwner(taskId, authenticatedUserId);
    setTasks(currentTasks => updateResource(currentTasks, task));
    return task;
  }

  return {
    patients: mappedPatients,
    tasks: mappedTasks,
    ingestionBots,
    enrichmentBots,
    connectorBots,
    isLoading,
    accessToken,
    error,
    addNotesToTask,
    addTaskOwner
  };
} 
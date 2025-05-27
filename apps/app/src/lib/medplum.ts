import { MedplumClient } from '@medplum/core';
import { Patient, Task, Bundle, Subscription, Parameters, Bot } from '@medplum/fhirtypes';

const medplum = new MedplumClient({
  baseUrl: process.env.NEXT_PUBLIC_MEDPLUM_BASE_URL || 'http://localhost:8103',
  cacheTime: 10000
});

export type ResourceHandler = (resource: any) => void;

// Data store class to handle all Medplum interactions
export class MedplumStore {
  private client: MedplumClient;
  private initialized: boolean = false;
  private ws: WebSocket | null = null;
  private resourceHandlers: Map<string, Set<ResourceHandler>> = new Map();

  constructor() {
    this.client = medplum;
  }

  // Initialize the store with client login
  async initialize(): Promise<void> {
    if (!this.initialized) {
      try {
        const clientId = process.env.NEXT_PUBLIC_MEDPLUM_CLIENT_ID;
        const clientSecret = process.env.NEXT_PUBLIC_MEDPLUM_CLIENT_SECRET;
        const baseUrl = process.env.NEXT_PUBLIC_MEDPLUM_BASE_URL;

        if (!clientId || !clientSecret) {
          throw new Error('Medplum credentials are missing. Please check your .env.local file.');
        }

        console.log('Initializing Medplum client with base URL:', baseUrl);
        await this.client.startClientLogin(clientId, clientSecret);
        this.initialized = true;

        await this.initializeWebSocket();

      } catch (error) {
        console.error('Failed to initialize Medplum client:', error);
        throw error;
      }
    }
  }

  async initializeWebSocket() {
    // Create subscriptions for both Task and Patient
    const taskSubscription = await this.client.createResource<Subscription>({
      resourceType: 'Subscription',
      criteria: 'Task',
      status: 'active',
      reason: 'Watch for tasks',
      channel: {
        type: 'websocket',
      },
    });

    const patientSubscription = await this.client.createResource<Subscription>({
      resourceType: 'Subscription',
      criteria: 'Patient',
      status: 'active',
      reason: 'Watch for patients',
      channel: {
        type: 'websocket',
      },
    });

    // Get binding tokens for both subscriptions
    const taskBinding = await this.client.get(
      `/fhir/R4/Subscription/${taskSubscription.id}/$get-ws-binding-token`
    ) as Parameters;

    const patientBinding = await this.client.get(
      `/fhir/R4/Subscription/${patientSubscription.id}/$get-ws-binding-token`
    ) as Parameters;

    const taskToken = taskBinding.parameter?.find(p => p.name === 'token')?.valueString || '';
    const patientToken = patientBinding.parameter?.find(p => p.name === 'token')?.valueString || '';

    // Initialize WebSocket connection
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_MEDPLUM_WS_BASE_URL  || 'wss://localhost:8103'}/ws/subscriptions-r4`);
    ws.addEventListener('open', () => {
      console.log('WebSocket open');
      // Bind both tokens
      ws?.send(JSON.stringify({ 
        type: 'bind-with-token', 
        payload: { token: taskToken } 
      }));
      ws?.send(JSON.stringify({ 
        type: 'bind-with-token', 
        payload: { token: patientToken } 
      }));
    });

    ws.addEventListener('message', (event: MessageEvent<string>) => {
      const bundle = JSON.parse(event.data) as Bundle;

      bundle.entry?.forEach(entry => {
        if (!entry.resource) return;

        const resourceType = entry.resource.resourceType;
        
        if (resourceType === 'SubscriptionStatus' && entry.resource.status === 'active') {
          //console.log('Heartbeat received');
        } else {
          //console.log("Trying to handle resource", resourceType)
          // Call all handlers for this resource type
          const handlers = this.resourceHandlers.get(resourceType);
          if (handlers) {
            handlers.forEach(handler => handler(entry.resource));
          }
        }
      });
    });

    ws.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
    });

    ws.addEventListener('close', () => {
      console.log('WebSocket closed');
    });
  }

    // Subscribe to tasks
    async subscribeToTasks(handler: (task: Task) => void): Promise<() => void> {
        await this.initialize();
        return this.subscribe('Task', handler);
      }
    
      // Subscribe to patients
      async subscribeToPatients(handler: (patient: Patient) => void): Promise<() => void> {
        await this.initialize();
        return this.subscribe('Patient', handler);
      }
    
      // Internal subscription method
      private subscribe(resourceType: 'Task' | 'Patient', handler: ResourceHandler): () => void {
        if (!this.resourceHandlers.has(resourceType)) {
          this.resourceHandlers.set(resourceType, new Set());
        }
        this.resourceHandlers.get(resourceType)?.add(handler);
    
        // Return unsubscribe function
        return () => {
          this.resourceHandlers.get(resourceType)?.delete(handler);
        };
      }
    

  async getPatients(): Promise<Patient[]> {
    try {
      await this.initialize();
      // Search for patients in Medplum
      const bundle = await this.client.search('Patient');
      
      // Return the actual FHIR Patient resources
      return (bundle.entry || []).map(entry => entry.resource as Patient);
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  }

  async getTasks(): Promise<Task[]> {
    try {
      await this.initialize();
      // Search for tasks in Medplum
      const bundle = await this.client.search('Task');
      
      // Return the actual FHIR Task resources
      return (bundle.entry || []).map(entry => entry.resource as Task);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }

  async getIngestionBots(): Promise<Bot[]> {
    const bundle = await this.client.search('Bot', {
      category: 'Ingestion'
    });
    return (bundle.entry || []).map(entry => entry.resource as Bot);
  }
  
  async getEnrichmentBots(): Promise<Bot[]> {
    const bundle = await this.client.search('Bot', {
      category: 'Enrichment'
    });
    return (bundle.entry || []).map(entry => entry.resource as Bot);
  }

  async getConnectorBots(): Promise<Bot[]> {
    const bundle = await this.client.search('Bot', {
      category: 'Connector'
    });
    return (bundle.entry || []).map(entry => entry.resource as Bot);
  }

  // Get the current access token
  async getAccessToken(): Promise<string | undefined> {
    await this.initialize();
    const token = this.client.getAccessToken();
    return token;
  }

  async addNoteToTask(taskId: string, notes: string): Promise<Task> {
    await this.initialize();
    try {
      const task = await this.client.readResource('Task', taskId);
      
      // Add the note to the task's note array
      const updatedTask = {
        ...task,
        note: [
          ...(task.note || []),
          {
            text: notes,
            time: new Date().toISOString()
          }
        ]
      };

      return await this.client.updateResource(updatedTask);
    } catch (error) {
      console.error('Error adding note to task:', error);
      throw error;
    }
  }

}

// Export a singleton instance
export const medplumStore = new MedplumStore(); 
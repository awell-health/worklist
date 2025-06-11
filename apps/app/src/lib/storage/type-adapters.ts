import type {
  ColumnDefinition,
  Filter,
  PanelDefinition,
  ViewDefinition,
} from '@/types/worklist'
import type { ColumnsResponse } from '@panels/types/columns'
import type {
  CreatePanelResponse,
  PanelInfo,
  PanelResponse,
  PanelsResponse,
} from '@panels/types/panels'
import type { ViewInfo, ViewResponse } from '@panels/types/views'

/**
 * Convert backend panel response to frontend panel definition
 */
export const adaptBackendToFrontend = (
  backendPanel: PanelResponse | CreatePanelResponse,
  columns?: ColumnsResponse,
  views?: ViewResponse[],
): PanelDefinition => {
  // Default columns if not provided
  const defaultPatientColumns: ColumnDefinition[] = [
    {
      id: 'name',
      key: 'name',
      name: 'Patient Name',
      type: 'string',
      description: "Patient's full name",
    },
    {
      id: 'birthDate',
      key: 'birthDate',
      name: 'Date of Birth',
      type: 'date',
      description: "Patient's date of birth",
    },
  ]

  const defaultTaskColumns: ColumnDefinition[] = [
    {
      id: 'taskId',
      key: 'id',
      name: 'Task ID',
      type: 'string',
      description: 'Task ID',
    },
    {
      id: 'description',
      key: 'description',
      name: 'Description',
      type: 'string',
      description: 'Task description',
    },
  ]

  // Convert cohort rule to filters
  const filters: Filter[] = backendPanel.cohortRule.conditions.map(
    (condition) => ({
      fhirPathFilter: [condition.field, condition.value?.toString() || ''],
    }),
  )

  // Convert backend columns to frontend columns if provided
  const patientViewColumns =
    columns?.baseColumns.map(adaptBackendColumnToFrontend) ||
    defaultPatientColumns
  const taskViewColumns =
    columns?.calculatedColumns.map(adaptBackendColumnToFrontend) ||
    defaultTaskColumns

  // Convert backend views to frontend views if provided
  const frontendViews: ViewDefinition[] =
    views?.map(adaptBackendViewToFrontend) || []

  return {
    id: backendPanel.id.toString(),
    title: backendPanel.name,
    createdAt: backendPanel.createdAt.toISOString(),
    filters,
    patientViewColumns,
    taskViewColumns,
    views: frontendViews,
  }
}

/**
 * Convert frontend panel definition to backend panel info for creation/updates
 */
export const adaptFrontendToBackend = (
  frontendPanel: PanelDefinition | Omit<PanelDefinition, 'id'>,
  config: { tenantId: string; userId: string },
): PanelInfo => {
  return {
    name: frontendPanel.title,
    description: `Panel created: ${frontendPanel.createdAt}`,
    tenantId: config.tenantId,
    userId: config.userId,
  }
}

/**
 * Convert backend column to frontend column definition
 */
const adaptBackendColumnToFrontend = (
  backendColumn:
    | ColumnsResponse['baseColumns'][0]
    | ColumnsResponse['calculatedColumns'][0],
): ColumnDefinition => {
  // Map backend column types to frontend types
  const typeMapping: Record<string, ColumnDefinition['type']> = {
    text: 'string',
    number: 'number',
    date: 'date',
    boolean: 'boolean',
    select: 'select',
    multi_select: 'array',
    user: 'assignee',
    file: 'string',
    custom: 'string',
  }

  // Handle different column types - base columns have sourceField, calculated columns have formula
  const key =
    backendColumn.columnType === 'base'
      ? (backendColumn as ColumnsResponse['baseColumns'][0]).sourceField
      : backendColumn.name

  return {
    id: backendColumn.id.toString(),
    key,
    name: backendColumn.name,
    type: typeMapping[backendColumn.type] || 'string',
    description: backendColumn.metadata?.description as string | undefined,
    properties: {
      display: {
        visible: backendColumn.properties?.display?.visible ?? true,
        width: backendColumn.properties?.display?.width,
      },
    },
  }
}

/**
 * Convert backend view to frontend view definition
 */
const adaptBackendViewToFrontend = (
  backendView: ViewResponse,
): ViewDefinition => {
  // Convert backend column IDs to frontend column definitions
  const columns: ColumnDefinition[] = backendView.config.columns.map(
    (columnId) => ({
      id: columnId,
      key: columnId,
      name: columnId
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase()),
      type: 'string',
      description: `Column ${columnId}`,
    }),
  )

  return {
    id: backendView.id.toString(),
    title: backendView.name,
    createdAt: new Date().toISOString(), // Backend doesn't provide createdAt for views
    filters: [], // TODO: Map from backend view filters
    columns,
    viewType: 'patient', // Default, could be determined from config
  }
}

/**
 * Convert frontend view to backend view info
 */
export const adaptFrontendViewToBackend = (
  frontendView: ViewDefinition | Omit<ViewDefinition, 'id'>,
  panelId: number,
  config: { tenantId: string; userId: string },
): ViewInfo => {
  return {
    name: frontendView.title,
    description: `View created: ${frontendView.createdAt}`,
    panelId,
    config: {
      columns: frontendView.columns.map((col) => col.id),
      layout: 'table',
    },
    metadata: {
      viewType: frontendView.viewType,
      filters: frontendView.filters,
    },
    tenantId: config.tenantId,
    userId: config.userId,
  }
}

/**
 * Batch convert multiple backend panels to frontend format
 */
export const adaptBackendPanelsToFrontend = (
  backendPanels: PanelsResponse,
): PanelDefinition[] => {
  return backendPanels.map((panel) => adaptBackendToFrontend(panel))
}

/**
 * Validate that we have the required configuration for API calls
 */
export const validateApiConfig = (config: {
  tenantId?: string
  userId?: string
}) => {
  if (!config.tenantId || !config.userId) {
    throw new Error(
      'Missing required API configuration: tenantId and userId must be provided',
    )
  }
}

/**
 * Get API configuration from environment variables
 */
export const getApiConfig = () => {
  const tenantId = process.env.NEXT_PUBLIC_TENANT_ID
  const userId = process.env.NEXT_PUBLIC_USER_ID

  if (!tenantId || !userId) {
    throw new Error(
      'Missing API configuration. Please set NEXT_PUBLIC_TENANT_ID and NEXT_PUBLIC_USER_ID environment variables.',
    )
  }

  return { tenantId, userId }
}

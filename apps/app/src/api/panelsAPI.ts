import type { IdParam } from '@panels/types'
import type {
  CreatePanelResponse,
  PanelInfo,
  PanelResponse,
  PanelsResponse,
} from '@panels/types/panels'

import 'server-only'

export const panelsAPI = {
  get: async (panel: IdParam, options = undefined) => {
    const response = await fetch(`/api/panels/${panel.id}`, {
      method: 'GET',
      ...(options || {}),
    })
    return response.json() as Promise<PanelResponse>
  },

  all: async (
    tenantId: string,
    userId: string,
    options = undefined,
  ): Promise<PanelsResponse> => {
    const panels = await fetch(
      `/api/panels?tenantId=${tenantId}&userId=${userId}`,
      {
        method: 'GET',
        ...(options || {}),
      },
    )
    return panels.json() as Promise<PanelsResponse>
  },

  create: async (panel: PanelInfo, options = undefined) => {
    const response = await fetch('/api/panels', {
      method: 'POST',
      body: JSON.stringify({
        name: panel.name,
        description: panel.description,
        tenantId: panel.tenantId,
        userId: panel.userId,
      }),
      ...(options || {}),
    })
    return response.json() as Promise<CreatePanelResponse>
  },

  update: async (panel: PanelInfo & IdParam, options = undefined) => {
    const response = await fetch(`/api/panels/${panel.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: panel.name,
        description: panel.description,
        tenantId: panel.tenantId,
        userId: panel.userId,
      }),
      ...(options || {}),
    })
    return response.json() as Promise<PanelResponse>
  },

  delete: async (
    panel: IdParam & { tenantId: string; userId: string },
    options = undefined,
  ): Promise<void> => {
    await fetch(`/api/panels/${panel.id}`, {
      method: 'DELETE',
      body: JSON.stringify({
        tenantId: panel.tenantId,
        userId: panel.userId,
      }),
      ...(options || {}),
    })
  },
}

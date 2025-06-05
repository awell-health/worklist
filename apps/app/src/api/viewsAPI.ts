import type { IdParam } from '@panels/types'
import type { ViewInfo, ViewResponse, ViewsResponse } from '@panels/types/views'
import 'server-only'

export const viewsAPI = {
  all: async (
    tenantId: string,
    userId: string,
    options = undefined,
  ): Promise<ViewsResponse> => {
    const response = await fetch(
      `/api/views?tenantId=${tenantId}&userId=${userId}`,
      {
        method: 'GET',
        ...(options || {}),
      },
    )
    return response.json() as Promise<ViewsResponse>
  },

  get: async (view: IdParam, options = undefined): Promise<ViewResponse> => {
    const response = await fetch(`/api/views/${view.id}`, {
      method: 'GET',
      ...(options || {}),
    })
    return response.json() as Promise<ViewResponse>
  },

  create: async (
    view: ViewInfo,
    options = undefined,
  ): Promise<ViewResponse> => {
    const response = await fetch('/api/views', {
      method: 'POST',
      body: JSON.stringify(view),
      ...(options || {}),
    })
    return response.json() as Promise<ViewResponse>
  },

  update: async (
    view: ViewInfo & IdParam,
    options = undefined,
  ): Promise<ViewResponse> => {
    const response = await fetch(`/api/views/${view.id}`, {
      method: 'PUT',
      body: JSON.stringify(view),
      ...(options || {}),
    })
    return response.json() as Promise<ViewResponse>
  },

  delete: async (
    view: IdParam & { tenantId: string; userId: string },
    options = undefined,
  ): Promise<void> => {
    await fetch(`/api/views/${view.id}`, {
      method: 'DELETE',
      body: JSON.stringify({
        tenantId: view.tenantId,
        userId: view.userId,
      }),
    })
  },
}

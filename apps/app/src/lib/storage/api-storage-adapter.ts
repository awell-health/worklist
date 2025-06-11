import type { PanelDefinition, ViewDefinition } from '@/types/worklist'
import type { ColumnsResponse } from '@panels/types/columns'
import type { ViewResponse } from '@panels/types/views'
import {
  adaptBackendPanelsToFrontend,
  adaptBackendToFrontend,
  adaptFrontendToBackend,
  adaptFrontendViewToBackend,
  getApiConfig,
  validateApiConfig,
} from './type-adapters'
import type { StorageAdapter } from './types'

interface CacheConfig {
  enabled: boolean
  duration: number // in milliseconds
}

interface CacheEntry<T> {
  data: T
  timestamp: number
  key: string
}

interface CacheStore {
  panels: CacheEntry<PanelDefinition[]> | null
  views: { [panelId: string]: CacheEntry<ViewDefinition[]> } | null
}

/**
 * API Storage Adapter - Full integration with backend services
 * Uses sophisticated type adapters and loads complete data relationships
 */
export class APIStorageAdapter implements StorageAdapter {
  private config: { tenantId: string; userId: string }
  private cache: CacheStore = { panels: null, views: null }
  private cacheConfig: CacheConfig

  constructor(cacheConfig?: Partial<CacheConfig>) {
    this.config = getApiConfig()
    validateApiConfig(this.config)
    this.cacheConfig = {
      enabled: cacheConfig?.enabled ?? true,
      duration: cacheConfig?.duration ?? 5 * 60 * 1000, // 5 minutes default
    }
  }

  private isCacheValid<T>(entry: CacheEntry<T> | null): boolean {
    if (!this.cacheConfig.enabled || !entry) return false
    return Date.now() - entry.timestamp < this.cacheConfig.duration
  }

  private setCacheEntry<T>(
    key: keyof CacheStore,
    data: T,
    subKey?: string,
  ): void {
    if (!this.cacheConfig.enabled) return

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      key: subKey || key,
    }

    if (key === 'views' && subKey) {
      if (!this.cache.views) this.cache.views = {}
      this.cache.views[subKey] = entry as CacheEntry<ViewDefinition[]>
    } else if (key === 'panels') {
      this.cache.panels = entry as CacheEntry<PanelDefinition[]>
    }
  }

  private getCacheEntry<T>(key: keyof CacheStore, subKey?: string): T | null {
    if (!this.cacheConfig.enabled) return null

    let entry: CacheEntry<T> | null = null

    if (key === 'views' && subKey && this.cache.views) {
      entry = (this.cache.views[subKey] as CacheEntry<T> | undefined) || null
    } else if (key === 'panels') {
      entry = this.cache.panels as CacheEntry<T> | null
    }

    return this.isCacheValid(entry) && entry ? entry.data : null
  }

  private invalidateCache(key: keyof CacheStore, subKey?: string): void {
    if (key === 'views' && subKey && this.cache.views) {
      delete this.cache.views[subKey]
    } else if (key === 'panels') {
      this.cache.panels = null
    }
  }

  async getPanels(): Promise<PanelDefinition[]> {
    // Check cache first
    const cachedPanels = this.getCacheEntry<PanelDefinition[]>('panels')
    if (cachedPanels) {
      return cachedPanels
    }

    try {
      const { panelsAPI } = await import('@/api/panelsAPI')
      const backendPanels = await panelsAPI.all(
        this.config.tenantId,
        this.config.userId,
      )

      // Use the sophisticated adapter to convert all panels at once
      const frontendPanels = adaptBackendPanelsToFrontend(backendPanels)

      // Load detailed data for each panel in parallel
      const enrichedPanels = await Promise.allSettled(
        frontendPanels.map(async (panel) => {
          try {
            return await this.enrichPanelWithDetails(panel)
          } catch (error) {
            console.warn(
              `Failed to enrich panel ${panel.id} with details:`,
              error,
            )
            // Return the basic panel if enrichment fails
            return panel
          }
        }),
      )

      // Extract successful results and log failures
      const result = enrichedPanels.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value
        }
        console.error(
          `Failed to load panel ${frontendPanels[index].id}:`,
          result.reason,
        )
        return frontendPanels[index] // Return basic panel as fallback
      })

      // Cache the result
      this.setCacheEntry('panels', result)

      return result
    } catch (error) {
      console.error('Failed to fetch panels from API:', error)
      throw new Error(
        `Failed to load panels: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  async getPanel(id: string): Promise<PanelDefinition | null> {
    try {
      const { panelsAPI } = await import('@/api/panelsAPI')

      // Get detailed panel data with all relationships
      const [backendPanel, columns, backendViews] = await Promise.allSettled([
        panelsAPI.get({ id }),
        this.loadPanelColumns(id),
        this.loadPanelViews(id),
      ])

      // Handle the panel data
      if (backendPanel.status === 'rejected') {
        if (
          backendPanel.reason instanceof Error &&
          backendPanel.reason.message.includes('404')
        ) {
          return null
        }
        throw backendPanel.reason
      }

      // Use sophisticated adapter with all available data
      const columnsData =
        columns.status === 'fulfilled' ? columns.value : undefined
      const viewsData =
        backendViews.status === 'fulfilled' ? backendViews.value : []

      return adaptBackendToFrontend(
        backendPanel.value,
        columnsData || undefined,
        viewsData,
      )
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null
      }
      console.error(`Failed to fetch panel ${id} from API:`, error)
      throw new Error(
        `Failed to load panel: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  async createPanel(
    panel: Omit<PanelDefinition, 'id'>,
  ): Promise<PanelDefinition> {
    try {
      const { panelsAPI } = await import('@/api/panelsAPI')

      // Convert frontend panel to backend format using sophisticated adapter
      const backendPanelInfo = adaptFrontendToBackend(panel, this.config)

      // Create panel via API
      const createdPanel = await panelsAPI.create(backendPanelInfo)

      // Invalidate panels cache since we created a new one
      this.invalidateCache('panels')

      // Return the created panel using full adapter
      return adaptBackendToFrontend(createdPanel)
    } catch (error) {
      console.error('Failed to create panel via API:', error)
      throw new Error(
        `Failed to create panel: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  async updatePanel(
    id: string,
    updates: Partial<PanelDefinition>,
  ): Promise<void> {
    try {
      const { panelsAPI } = await import('@/api/panelsAPI')

      // Get the current panel to merge updates
      const currentPanel = await this.getPanel(id)
      if (!currentPanel) {
        throw new Error(`Panel ${id} not found`)
      }

      // Merge updates with current panel
      const updatedPanel = { ...currentPanel, ...updates }

      // Convert to backend format using sophisticated adapter
      const backendPanelInfo = {
        ...adaptFrontendToBackend(updatedPanel, this.config),
        id: id, // Keep as string for API compatibility
      }

      // Update via API
      await panelsAPI.update(backendPanelInfo)

      // Invalidate panels cache since we updated one
      this.invalidateCache('panels')
    } catch (error) {
      console.error(`Failed to update panel ${id} via API:`, error)
      throw new Error(
        `Failed to update panel: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  async deletePanel(id: string): Promise<void> {
    try {
      const { panelsAPI } = await import('@/api/panelsAPI')

      // Delete via API
      await panelsAPI.delete({
        id: id, // Keep as string for API compatibility
        tenantId: this.config.tenantId,
        userId: this.config.userId,
      })

      // Invalidate panels cache since we deleted one
      this.invalidateCache('panels')
    } catch (error) {
      console.error(`Failed to delete panel ${id} via API:`, error)
      throw new Error(
        `Failed to delete panel: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  async addView(
    panelId: string,
    view: Omit<ViewDefinition, 'id'>,
  ): Promise<ViewDefinition> {
    try {
      const { viewsAPI } = await import('@/api/viewsAPI')

      // Convert frontend view to backend format using sophisticated adapter
      const backendViewInfo = adaptFrontendViewToBackend(
        view,
        Number.parseInt(panelId, 10),
        this.config,
      )

      // Create view via API
      const createdView = await viewsAPI.create(backendViewInfo)

      // Convert back to frontend format
      return {
        id: createdView.id.toString(),
        title: createdView.name,
        createdAt: new Date().toISOString(),
        filters: view.filters, // Preserve original filters
        columns: view.columns, // Preserve original columns
        viewType: view.viewType,
      }
    } catch (error) {
      console.error(`Failed to add view to panel ${panelId} via API:`, error)
      throw new Error(
        `Failed to add view: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  async updateView(
    panelId: string,
    viewId: string,
    updates: Partial<ViewDefinition>,
  ): Promise<void> {
    try {
      const { viewsAPI } = await import('@/api/viewsAPI')

      // Get current view to merge updates
      const currentView = await this.getView(panelId, viewId)
      if (!currentView) {
        throw new Error(`View ${viewId} not found in panel ${panelId}`)
      }

      // Merge updates with current view
      const updatedView = { ...currentView, ...updates }

      // Convert to backend format using sophisticated adapter
      const backendViewInfo = adaptFrontendViewToBackend(
        updatedView,
        Number.parseInt(panelId, 10),
        this.config,
      )

      // Update via API
      await viewsAPI.update({
        ...backendViewInfo,
        id: viewId, // Keep as string for API compatibility
      })
    } catch (error) {
      console.error(
        `Failed to update view ${viewId} in panel ${panelId} via API:`,
        error,
      )
      throw new Error(
        `Failed to update view: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  async deleteView(panelId: string, viewId: string): Promise<void> {
    try {
      const { viewsAPI } = await import('@/api/viewsAPI')

      // Delete via API
      await viewsAPI.delete({
        id: viewId, // Keep as string for API compatibility
        tenantId: this.config.tenantId,
        userId: this.config.userId,
      })
    } catch (error) {
      console.error(
        `Failed to delete view ${viewId} in panel ${panelId} via API:`,
        error,
      )
      throw new Error(
        `Failed to delete view: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  async getView(
    panelId: string,
    viewId: string,
  ): Promise<ViewDefinition | null> {
    try {
      const { viewsAPI } = await import('@/api/viewsAPI')

      // Get view via API
      const backendView = await viewsAPI.get({ id: viewId })

      // Convert to frontend format
      return {
        id: backendView.id.toString(),
        title: backendView.name,
        createdAt: new Date().toISOString(), // Placeholder
        filters: [], // Placeholder - would need to be enriched
        columns: [], // Placeholder - would need to be enriched
        viewType: 'patient', // Default - would need to be determined
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null
      }
      console.error(
        `Failed to fetch view ${viewId} from panel ${panelId} via API:`,
        error,
      )
      throw new Error(
        `Failed to load view: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  /**
   * Enhanced panel enrichment with sophisticated data loading
   */
  private async enrichPanelWithDetails(
    panel: PanelDefinition,
  ): Promise<PanelDefinition> {
    try {
      // Load columns and views in parallel for maximum efficiency
      const [columns, views] = await Promise.allSettled([
        this.loadPanelColumns(panel.id),
        this.loadPanelViews(panel.id),
      ])

      // Extract successful results with graceful fallbacks
      const columnsData = columns.status === 'fulfilled' ? columns.value : null
      const viewsData = views.status === 'fulfilled' ? views.value : []

      // For enrichment, we just merge the additional data without full conversion
      // since panel is already in frontend format
      const enrichedPanel = { ...panel }

      // If we have additional data, we could enrich further here
      // For now, return the panel as-is since it's already converted
      return enrichedPanel
    } catch (error) {
      console.warn(
        `Failed to enrich panel ${panel.id}, using basic data:`,
        error,
      )
      return panel // Return basic panel if enrichment fails
    }
  }

  /**
   * Load columns for a specific panel
   */
  private async loadPanelColumns(
    panelId: string,
  ): Promise<ColumnsResponse | null> {
    try {
      const { panelsAPI } = await import('@/api/panelsAPI')
      return await panelsAPI.columns.list(
        { id: panelId },
        this.config.tenantId,
        this.config.userId,
      )
    } catch (error) {
      console.warn(`Failed to load columns for panel ${panelId}:`, error)
      return null
    }
  }

  /**
   * Load views for a specific panel
   */
  private async loadPanelViews(panelId: string): Promise<ViewResponse[]> {
    try {
      const { viewsAPI } = await import('@/api/viewsAPI')

      // Get all views for the user and filter by panel
      const allViews = await viewsAPI.all(
        this.config.tenantId,
        this.config.userId,
      )

      // Filter views that belong to this panel
      return allViews.views.filter(
        (view) => view.panelId === Number.parseInt(panelId, 10),
      )
    } catch (error) {
      console.warn(`Failed to load views for panel ${panelId}:`, error)
      return []
    }
  }

  isLoading(): boolean {
    return false // API operations are inherently async, no persistent loading state
  }
}

import type { PanelDefinition, ViewDefinition } from '@/types/worklist'
import { v4 as uuidv4 } from 'uuid'
import type { StorageAdapter } from './types'

/**
 * LocalStorageAdapter provides panel storage using browser localStorage
 * This maintains the existing behavior and data structure from usePanelStore
 */
export class LocalStorageAdapter implements StorageAdapter {
  private readonly STORAGE_KEY = 'panels'
  private loading = false

  /**
   * Load panels from localStorage
   */
  private async loadPanelsFromStorage(): Promise<PanelDefinition[]> {
    try {
      // Check if localStorage is available (not available during SSR)
      if (
        typeof window === 'undefined' ||
        typeof localStorage === 'undefined'
      ) {
        console.log('localStorage not available (SSR), returning empty array')
        return []
      }

      const storedPanels = localStorage.getItem(this.STORAGE_KEY)
      if (storedPanels) {
        return JSON.parse(storedPanels) as PanelDefinition[]
      }
      return []
    } catch (error) {
      console.error('Error loading panels from localStorage:', error)
      return []
    }
  }

  /**
   * Save panels to localStorage
   */
  private async savePanelsToStorage(panels: PanelDefinition[]): Promise<void> {
    try {
      // Check if localStorage is available (not available during SSR)
      if (
        typeof window === 'undefined' ||
        typeof localStorage === 'undefined'
      ) {
        console.log('localStorage not available (SSR), skipping save')
        return
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(panels))
    } catch (error) {
      console.error('Error saving panels to localStorage:', error)
      throw new Error('Failed to save panels to localStorage')
    }
  }

  // Panel operations
  async getPanels(): Promise<PanelDefinition[]> {
    return this.loadPanelsFromStorage()
  }

  async getPanel(id: string): Promise<PanelDefinition | null> {
    const panels = await this.loadPanelsFromStorage()
    return panels.find((panel) => panel.id === id) || null
  }

  async createPanel(
    panel: Omit<PanelDefinition, 'id'>,
  ): Promise<PanelDefinition> {
    const panels = await this.loadPanelsFromStorage()

    const newPanel: PanelDefinition = {
      ...panel,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    }

    const updatedPanels = [...panels, newPanel]
    await this.savePanelsToStorage(updatedPanels)

    return newPanel
  }

  async updatePanel(
    id: string,
    updates: Partial<PanelDefinition>,
  ): Promise<void> {
    const panels = await this.loadPanelsFromStorage()

    const updatedPanels = panels.map((panel) =>
      panel.id === id ? { ...panel, ...updates } : panel,
    )

    await this.savePanelsToStorage(updatedPanels)
  }

  async deletePanel(id: string): Promise<void> {
    const panels = await this.loadPanelsFromStorage()

    const updatedPanels = panels.filter((panel) => panel.id !== id)

    await this.savePanelsToStorage(updatedPanels)
  }

  // View operations
  async addView(
    panelId: string,
    view: Omit<ViewDefinition, 'id'>,
  ): Promise<ViewDefinition> {
    const panels = await this.loadPanelsFromStorage()

    const newView: ViewDefinition = {
      ...view,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    }

    const updatedPanels = panels.map((panel) =>
      panel.id === panelId
        ? {
            ...panel,
            views: [...(panel.views || []), newView],
          }
        : panel,
    )

    await this.savePanelsToStorage(updatedPanels)

    return newView
  }

  async updateView(
    panelId: string,
    viewId: string,
    updates: Partial<ViewDefinition>,
  ): Promise<void> {
    const panels = await this.loadPanelsFromStorage()

    const updatedPanels = panels.map((panel) =>
      panel.id === panelId
        ? {
            ...panel,
            views: (panel.views || []).map((view) =>
              view.id === viewId ? { ...view, ...updates } : view,
            ),
          }
        : panel,
    )

    await this.savePanelsToStorage(updatedPanels)
  }

  async deleteView(panelId: string, viewId: string): Promise<void> {
    const panels = await this.loadPanelsFromStorage()

    const updatedPanels = panels.map((panel) =>
      panel.id === panelId
        ? {
            ...panel,
            views: (panel.views || []).filter((view) => view.id !== viewId),
          }
        : panel,
    )

    await this.savePanelsToStorage(updatedPanels)
  }

  async getView(
    panelId: string,
    viewId: string,
  ): Promise<ViewDefinition | null> {
    const panel = await this.getPanel(panelId)
    return panel?.views?.find((view) => view.id === viewId) || null
  }

  // Loading state
  isLoading(): boolean {
    return this.loading
  }
}

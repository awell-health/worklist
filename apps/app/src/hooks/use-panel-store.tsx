"use client"

import type { PanelDefinition, ViewDefinition } from '@/types/worklist'
import { type ReactNode, createContext, useContext, useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { getStorageAdapter } from '@/lib/storage/storage-factory'
import type { StorageAdapter } from '@/lib/storage/types'

class PanelStore {
  private listeners: Array<() => void> = []
  private panels: PanelDefinition[] = []
  private storage: StorageAdapter | null = null
  private _isLoading = false
  private saveStates: Map<string, 'saving' | 'saved' | 'error'> = new Map()

  constructor() {
    this.initializeStorage()
  }

  private readonly STORAGE_KEY = 'panel-definitions'


  private async initializeStorage() {
    try {
      this.storage = await getStorageAdapter()
      await this.loadPanels()
    } catch (error) {
      console.error('Failed to initialize storage adapter:', error)
      // Fallback to local storage only
      this.loadFromLocalStorage()
    }
  }

  private notifyListeners() {
    for (const listener of this.listeners) {
      listener()
    }
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  isLoading(): boolean {
    return this._isLoading || (this.storage?.isLoading() ?? false)
  }

  getSaveState(id: string): 'saving' | 'saved' | 'error' | undefined {
    return this.saveStates.get(id)
  }

  private setSaveState(id: string, state: 'saving' | 'saved' | 'error') {
    this.saveStates.set(id, state)
    this.notifyListeners()

    // Clear 'saved' state after 2 seconds for better UX
    if (state === 'saved') {
      setTimeout(() => {
        if (this.saveStates.get(id) === 'saved') {
          this.saveStates.delete(id)
          this.notifyListeners()
        }
      }, 2000)
    }
  }

  async loadPanels() {
    if (!this.storage) {
      this.loadFromLocalStorage()
      return
    }

    try {
      this._isLoading = true
      this.notifyListeners()

      const loadedPanels = await this.storage.getPanels()
      this.panels = loadedPanels
      this.saveToLocalStorage()
    } catch (error) {
      console.error('Failed to load panels from storage:', error)
      this.loadFromLocalStorage()
    } finally {
      this._isLoading = false
      this.notifyListeners()
    }
  }

  private loadFromLocalStorage() {
    if (typeof window === 'undefined') {
      this.panels = []
      return
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      this.panels = stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Failed to load panels from localStorage:', error)
      this.panels = []
    }
    this.notifyListeners()
  }

  private saveToLocalStorage() {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.panels))
    } catch (error) {
      console.error('Failed to save panels to localStorage:', error)
    }
  }

  getPanels(): PanelDefinition[] {
    return this.panels
  }

  getPanel(id: string): PanelDefinition | undefined {
    return this.panels.find(panel => panel.id === id)
  }

  getView(panelId: string, viewId: string): ViewDefinition | undefined {
    const panel = this.getPanel(panelId)
    return panel?.views?.find(view => view.id === viewId)
  }

  async createPanel(panel: Omit<PanelDefinition, 'id'>): Promise<PanelDefinition> {
    const newPanel: PanelDefinition = {
      ...panel,
      id: uuidv4(),
    }

    const operationId = `panel-${newPanel.id}`
    this.setSaveState(operationId, 'saving')

    try {
      // Update local state optimistically
      this.panels.push(newPanel)
      this.saveToLocalStorage()
      this.notifyListeners()

      // Sync with storage adapter
      if (this.storage) {
        await this.storage.createPanel(panel)
      }

      this.setSaveState(operationId, 'saved')
      return newPanel
    } catch (error) {
      // Rollback local changes on failure
      this.panels = this.panels.filter(p => p.id !== newPanel.id)
      this.saveToLocalStorage()
      this.notifyListeners()

      this.setSaveState(operationId, 'error')
      console.error('Failed to create panel:', error)
      throw new Error(`Failed to create panel: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async addView(panelId: string, view: Omit<ViewDefinition, 'id'>): Promise<ViewDefinition> {
    const newView: ViewDefinition = {
      ...view,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    }

    const operationId = `view-${newView.id}`
    this.setSaveState(operationId, 'saving')

    try {
      // Update local state optimistically
      this.panels = this.panels.map((panel) =>
        panel.id === panelId
          ? {
            ...panel,
            views: [...(panel.views || []), newView],
          }
          : panel,
      )
      this.saveToLocalStorage()
      this.notifyListeners()

      // Sync with storage adapter
      if (this.storage) {
        await this.storage.addView(panelId, view)
      }

      this.setSaveState(operationId, 'saved')
      return newView
    } catch (error) {
      // Rollback local changes on failure
      this.panels = this.panels.map((panel) =>
        panel.id === panelId
          ? {
            ...panel,
            views: (panel.views || []).filter(v => v.id !== newView.id),
          }
          : panel,
      )
      this.saveToLocalStorage()
      this.notifyListeners()

      this.setSaveState(operationId, 'error')
      console.error('Failed to add view:', error)
      throw new Error(`Failed to add view: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async updateView(panelId: string, viewId: string, updates: Partial<ViewDefinition>): Promise<void> {
    const operationId = `view-${viewId}`
    this.setSaveState(operationId, 'saving')

    // Store original state for rollback
    const originalPanels = JSON.parse(JSON.stringify(this.panels))

    try {
      // Update local state optimistically
      this.panels = this.panels.map((panel) =>
        panel.id === panelId
          ? {
            ...panel,
            views: (panel.views || []).map((view) =>
              view.id === viewId ? { ...view, ...updates } : view,
            ),
          }
          : panel,
      )
      this.saveToLocalStorage()
      this.notifyListeners()

      // Sync with storage adapter
      if (this.storage) {
        await this.storage.updateView(panelId, viewId, updates)
      }

      this.setSaveState(operationId, 'saved')
    } catch (error) {
      // Rollback to original state on failure
      this.panels = originalPanels
      this.saveToLocalStorage()
      this.notifyListeners()

      this.setSaveState(operationId, 'error')
      console.error('Failed to update view:', error)
      throw new Error(`Failed to update view: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async updatePanel(id: string, updates: Partial<PanelDefinition>): Promise<void> {
    const operationId = `panel-${id}`
    this.setSaveState(operationId, 'saving')

    // Store original state for rollback
    const originalPanels = JSON.parse(JSON.stringify(this.panels))

    try {
      // Update local state optimistically
      this.panels = this.panels.map((panel) =>
        panel.id === id ? { ...panel, ...updates } : panel,
      )
      this.saveToLocalStorage()
      this.notifyListeners()

      // Sync with storage adapter
      if (this.storage) {
        await this.storage.updatePanel(id, updates)
      }

      this.setSaveState(operationId, 'saved')
    } catch (error) {
      // Rollback to original state on failure
      this.panels = originalPanels
      this.saveToLocalStorage()
      this.notifyListeners()

      this.setSaveState(operationId, 'error')
      console.error('Failed to update panel:', error)
      throw new Error(`Failed to update panel: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async deletePanel(id: string): Promise<void> {
    const operationId = `panel-${id}`
    this.setSaveState(operationId, 'saving')

    // Store original state for rollback
    const originalPanels = JSON.parse(JSON.stringify(this.panels))

    try {
      // Update local state optimistically
      this.panels = this.panels.filter((panel) => panel.id !== id)
      this.saveToLocalStorage()
      this.notifyListeners()

      // Sync with storage adapter
      if (this.storage) {
        await this.storage.deletePanel(id)
      }

      this.setSaveState(operationId, 'saved')
    } catch (error) {
      // Rollback to original state on failure
      this.panels = originalPanels
      this.saveToLocalStorage()
      this.notifyListeners()

      this.setSaveState(operationId, 'error')
      console.error('Failed to delete panel:', error)
      throw new Error(`Failed to delete panel: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async deleteView(panelId: string, viewId: string): Promise<void> {
    const operationId = `view-${viewId}`
    this.setSaveState(operationId, 'saving')

    // Store original state for rollback
    const originalPanels = JSON.parse(JSON.stringify(this.panels))

    try {
      // Update local state optimistically
      this.panels = this.panels.map((panel) =>
        panel.id === panelId
          ? {
            ...panel,
            views: (panel.views || []).filter((view) => view.id !== viewId),
          }
          : panel,
      )
      this.saveToLocalStorage()
      this.notifyListeners()

      // Sync with storage adapter
      if (this.storage) {
        await this.storage.deleteView(panelId, viewId)
      }

      this.setSaveState(operationId, 'saved')
    } catch (error) {
      // Rollback to original state on failure
      this.panels = originalPanels
      this.saveToLocalStorage()
      this.notifyListeners()

      this.setSaveState(operationId, 'error')
      console.error('Failed to delete view:', error)
      throw new Error(`Failed to delete view: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

const panelStore = new PanelStore()

type PanelStoreContextType = {
  panels: PanelDefinition[]
  isLoading: boolean
  getSaveState: (id: string) => 'saving' | 'saved' | 'error' | undefined
  getPanel: (id: string) => PanelDefinition | undefined
  getView: (panelId: string, viewId: string) => ViewDefinition | undefined
  createPanel: (panel: Omit<PanelDefinition, 'id'>) => Promise<PanelDefinition>
  updatePanel: (id: string, updates: Partial<PanelDefinition>) => Promise<void>
  deletePanel: (id: string) => Promise<void>
  addView: (panelId: string, view: Omit<ViewDefinition, 'id'>) => Promise<ViewDefinition>
  updateView: (panelId: string, viewId: string, updates: Partial<ViewDefinition>) => Promise<void>
  deleteView: (panelId: string, viewId: string) => Promise<void>
}

const PanelStoreContext = createContext<PanelStoreContextType | null>(null)

export function PanelStoreProvider({ children }: { children: ReactNode }) {
  const [panels, setPanels] = useState<PanelDefinition[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const updateState = () => {
      setPanels(panelStore.getPanels())
      setIsLoading(panelStore.isLoading())
    }

    updateState()
    const unsubscribe = panelStore.subscribe(updateState)
    return unsubscribe
  }, [])

  const value: PanelStoreContextType = {
    panels,
    isLoading,
    getSaveState: (id: string) => panelStore.getSaveState(id),
    getPanel: (id: string) => panelStore.getPanel(id),
    getView: (panelId: string, viewId: string) => panelStore.getView(panelId, viewId),
    createPanel: (panel: Omit<PanelDefinition, 'id'>) => panelStore.createPanel(panel),
    updatePanel: (id: string, updates: Partial<PanelDefinition>) => panelStore.updatePanel(id, updates),
    deletePanel: (id: string) => panelStore.deletePanel(id),
    addView: (panelId: string, view: Omit<ViewDefinition, 'id'>) => panelStore.addView(panelId, view),
    updateView: (panelId: string, viewId: string, updates: Partial<ViewDefinition>) => panelStore.updateView(panelId, viewId, updates),
    deleteView: (panelId: string, viewId: string) => panelStore.deleteView(panelId, viewId),
  }

  return (
    <PanelStoreContext.Provider value={value}>
      {children}
    </PanelStoreContext.Provider>
  )
}

export function usePanelStore() {
  const context = useContext(PanelStoreContext)
  if (!context) {
    throw new Error('usePanelStore must be used within a PanelStoreProvider')
  }
  return context
} 
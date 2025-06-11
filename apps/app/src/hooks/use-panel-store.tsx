"use client"

import { getStorageAdapter } from '@/lib/storage/storage-factory'
import type { StorageAdapter } from '@/lib/storage/types'
import type { PanelDefinition, ViewDefinition } from '@/types/worklist'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

// Simple store class - no singleton pattern
class PanelStore {
  private panels: PanelDefinition[] = []
  private storage: StorageAdapter | null = null
  private isLoading = true
  private isInitialized = false
  private listeners: Set<() => void> = new Set()

  private notifyListeners() {
    for (const listener of this.listeners) {
      listener()
    }
  }

  addListener(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return
    }

    this.isLoading = true
    this.notifyListeners()

    try {
      // Get storage adapter
      this.storage = await getStorageAdapter()

      // Load panels from storage
      this.panels = await this.storage.getPanels()

      this.isLoading = false
      this.isInitialized = true
      this.notifyListeners()
    } catch (error) {
      console.error('Failed to initialize PanelStore:', error)
      this.isLoading = false
      this.notifyListeners()
    }
  }

  private saveToLocalStorage() {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('panels', JSON.stringify(this.panels))
      }
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  }

  // Getters
  getPanels(): PanelDefinition[] {
    return this.panels
  }

  getIsLoading(): boolean {
    return this.isLoading
  }

  getPanel(id: string): PanelDefinition | undefined {
    return this.panels.find((panel) => panel.id === id)
  }

  getView(panelId: string, viewId: string): ViewDefinition | undefined {
    const panel = this.getPanel(panelId)
    return panel?.views?.find((view) => view.id === viewId)
  }

  // Panel operations
  createPanel(panel: Omit<PanelDefinition, 'id'>): PanelDefinition {
    const newPanel: PanelDefinition = {
      ...panel,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    }

    this.panels = [...this.panels, newPanel]
    this.saveToLocalStorage()
    this.notifyListeners()

    // Sync with storage adapter if available
    if (this.storage) {
      this.storage.createPanel(newPanel).catch((error) => {
        console.error('Failed to sync panel creation with storage adapter:', error)
      })
    }

    return newPanel
  }

  updatePanel(id: string, updates: Partial<PanelDefinition>): void {
    this.panels = this.panels.map((panel) =>
      panel.id === id ? { ...panel, ...updates } : panel,
    )
    this.saveToLocalStorage()
    this.notifyListeners()

    // Sync with storage adapter if available
    if (this.storage) {
      this.storage.updatePanel(id, updates).catch((error) => {
        console.error('Failed to sync panel update with storage adapter:', error)
      })
    }
  }

  deletePanel(id: string): void {
    this.panels = this.panels.filter((panel) => panel.id !== id)
    this.saveToLocalStorage()
    this.notifyListeners()

    // Sync with storage adapter if available
    if (this.storage) {
      this.storage.deletePanel(id).catch((error) => {
        console.error('Failed to sync panel deletion with storage adapter:', error)
      })
    }
  }

  addView(panelId: string, view: Omit<ViewDefinition, 'id'>): ViewDefinition {
    const newView: ViewDefinition = {
      ...view,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    }

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

    // Sync with storage adapter if available
    if (this.storage) {
      this.storage.addView(panelId, view).catch((error) => {
        console.error('Failed to sync view addition with storage adapter:', error)
      })
    }

    return newView
  }

  updateView(panelId: string, viewId: string, updates: Partial<ViewDefinition>): void {
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

    // Sync with storage adapter if available
    if (this.storage) {
      this.storage.updateView(panelId, viewId, updates).catch((error) => {
        console.error('Failed to sync view update with storage adapter:', error)
      })
    }
  }

  deleteView(panelId: string, viewId: string): void {
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

    // Sync with storage adapter if available
    if (this.storage) {
      this.storage.deleteView(panelId, viewId).catch((error) => {
        console.error('Failed to sync view deletion with storage adapter:', error)
      })
    }
  }
}

// React Context for the store
const PanelStoreContext = createContext<PanelStore | null>(null)

// Provider component
export function PanelStoreProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState(() => new PanelStore())

  useEffect(() => {
    store.initialize()
  }, [store])

  return (
    <PanelStoreContext.Provider value={store}>
      {children}
    </PanelStoreContext.Provider>
  )
}

// Simple hook to use the store
export const usePanelStore = () => {
  const store = useContext(PanelStoreContext)

  if (!store) {
    throw new Error('usePanelStore must be used within a PanelStoreProvider')
  }

  const [, forceUpdate] = useState({})

  // Stable rerender function
  const rerender = useCallback(() => {
    forceUpdate({})
  }, [])

  // Subscribe to store changes
  useEffect(() => {
    const unsubscribe = store.addListener(rerender)
    return unsubscribe
  }, [store, rerender])

  // Return store state and methods
  return {
    // State
    panels: store.getPanels(),
    isLoading: store.getIsLoading(),

    // Methods
    createPanel: store.createPanel.bind(store),
    updatePanel: store.updatePanel.bind(store),
    deletePanel: store.deletePanel.bind(store),
    getPanel: store.getPanel.bind(store),
    addView: store.addView.bind(store),
    updateView: store.updateView.bind(store),
    deleteView: store.deleteView.bind(store),
    getView: store.getView.bind(store),
  }
} 
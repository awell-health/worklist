import { PanelDefinition, ViewDefinition } from '@/types/worklist';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'panel-definitions';

export const usePanelStorage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [panels, setPanels] = useState<PanelDefinition[]>([]);

  useEffect(() => {
    const storedPanels = localStorage.getItem(STORAGE_KEY);
    if (storedPanels) {
      setPanels(JSON.parse(storedPanels));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if(isLoading) {
      return;
    }
    // only save panels if they are not loading as otherwise we might be cleaning up the localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(panels));
  }, [panels, isLoading]);

  const createPanel = (panel: Omit<PanelDefinition, 'id'>) => {
    const newPanel: PanelDefinition = {
      ...panel,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    setPanels((prev) => [...prev, newPanel]);
    return newPanel;
  };

  const updatePanel = (id: string, updates: Partial<PanelDefinition>) => {
    setPanels((prev) =>
      prev.map((panel) =>
        panel.id === id ? { ...panel, ...updates } : panel
      )
    );
  };

  const deletePanel = (id: string) => {
    setPanels((prev) => prev.filter((panel) => panel.id !== id));
  };

  const getPanel = (id: string) => {
    return panels.find((panel) => panel.id == id);
  };

  const addView = (panelId: string, view: Omit<ViewDefinition, 'id'>) => {
    const newView: ViewDefinition = {
      ...view,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    
    setPanels((prev) =>
      prev.map((panel) =>
        panel.id === panelId
          ? {
              ...panel,
              views: [...(panel.views || []), newView],
            }
          : panel
      )
    );
    return newView;
  };

  const updateView = (panelId: string, viewId: string, updates: Partial<ViewDefinition>) => {
    setPanels((prev) =>
      prev.map((panel) =>
        panel.id === panelId
          ? {
              ...panel,
              views: (panel.views || []).map((view) =>
                view.id === viewId ? { ...view, ...updates } : view
              ),
            }
          : panel
      )
    );
  };

  const deleteView = (panelId: string, viewId: string) => {
    setPanels((prev) =>
      prev.map((panel) =>
        panel.id === panelId
          ? {
              ...panel,
              views: (panel.views || []).filter((view) => view.id !== viewId),
            }
          : panel
      )
    );
  };

  const getView = (panelId: string, viewId: string) => {
    const panel = getPanel(panelId);
    return panel?.views?.find((view) => view.id === viewId);
  };

  return {
    isLoading,
    panels,
    createPanel,
    updatePanel,
    deletePanel,
    getPanel,
    addView,
    updateView,
    deleteView,
    getView,
  };
}; 
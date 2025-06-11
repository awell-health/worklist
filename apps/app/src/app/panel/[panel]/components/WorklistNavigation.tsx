"use client";
import { PanelDefinition, ViewDefinition } from "@/types/worklist";
import { LayoutGrid, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface WorklistNavigationProps {
    panelDefinition: PanelDefinition;
    onNewView: () => void;
    selectedViewId?: string;
    onPanelTitleChange?: (newTitle: string) => void;
    onViewTitleChange?: (newTitle: string) => void;
}

export default function WorklistNavigation({ 
    panelDefinition, 
    onNewView, 
    selectedViewId,
    onPanelTitleChange,
    onViewTitleChange 
}: WorklistNavigationProps) {
    const router = useRouter();
    const [editingPanel, setEditingPanel] = useState(false);
    const [editingViewId, setEditingViewId] = useState<string | null>(null);
    const [panelTitle, setPanelTitle] = useState(panelDefinition.title);
    const [viewTitles, setViewTitles] = useState<Record<string, string>>(
        Object.fromEntries(panelDefinition.views?.map(view => [view.id, view.title]) || [])
    );

    const handleViewClick = (view: ViewDefinition) => {
        if (view.id && !editingViewId) {
            router.replace(`/panel/${panelDefinition.id}/view/${view.id}`);
        }
    };

    const handlePanelClick = () => {
        if (panelDefinition.id && !editingPanel) {
            router.replace(`/panel/${panelDefinition.id}`);
        }
    };

    const handlePanelTitleSubmit = () => {
        if (onPanelTitleChange && panelTitle !== panelDefinition.title) {
            onPanelTitleChange(panelTitle);
        }
        setEditingPanel(false);
    };

    const handleViewTitleSubmit = (viewId: string) => {
        if (onViewTitleChange && viewTitles[viewId] !== panelDefinition.views?.find(v => v.id === viewId)?.title) {
            onViewTitleChange(viewTitles[viewId]);
        }
        setEditingViewId(null);
    };

    return (
      <div className="bg-gray-50 relative pt-4">
        <div className="h-9 flex items-end px-2">          {/* Border line that creates the tab effect */}
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gray-200"></div>

          <div 
            className="relative ml-2 mb-[-1px] cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              if (!selectedViewId) {
                  setEditingPanel(true);
              } else {
                  handlePanelClick();
              }
          }}
          >
            <div className={`
              h-9 px-4 relative z-10 flex items-center rounded-t-md border-l border-t border-r border-gray-200
              ${!selectedViewId ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100'}
            `}>
              <LayoutGrid className={`h-3 w-3 mr-2 ${!selectedViewId ? 'text-yellow-800' : 'text-gray-500'}`} />
              {editingPanel ? (
                <input
                    type="text"
                    value={panelTitle}
                    onChange={(e) => setPanelTitle(e.target.value)}
                    onBlur={handlePanelTitleSubmit}
                    onKeyDown={(e) => e.key === 'Enter' && handlePanelTitleSubmit()}
                    className="text-xs bg-transparent border-none focus:outline-none focus:ring-0 p-0 w-full"
                    autoFocus
                />
              ) : (
                <span 
                    className={`text-xs ${!selectedViewId ? 'font-semibold text-gray-700' : 'font-normal text-gray-600'}`}
                >
                    {panelDefinition.title}
                </span>
              )}
            </div>
          </div>

          {/* List of views */}
          {panelDefinition.views?.map((view: ViewDefinition, index: number) => (
            <div 
              key={index} 
              className="relative ml-2 mb-[-1px] cursor-pointer"
              onClick={() => handleViewClick(view)}
            >
              <div className={`
                h-9 px-4 relative z-10 flex items-center rounded-t-md border-l border-t border-r border-gray-200
                ${view.id === selectedViewId ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100'}
              `}>
                {editingViewId === view.id ? (
                    <input
                        type="text"
                        value={viewTitles[view.id] || ''}
                        onChange={(e) => setViewTitles(prev => ({ ...prev, [view.id]: e.target.value }))}
                        onBlur={() => handleViewTitleSubmit(view.id)}
                        onKeyDown={(e) => e.key === 'Enter' && handleViewTitleSubmit(view.id)}
                        className="text-xs bg-transparent border-none focus:outline-none focus:ring-0 p-0 w-full"
                        autoFocus
                    />
                ) : (
                    <span 
                        className={`text-xs ${view.id === selectedViewId ? 'font-semibold text-gray-700' : 'font-normal text-gray-600'}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (view.id === selectedViewId) {
                                setEditingViewId(view.id);
                            } else {
                                handleViewClick(view);
                            }
                        }}
                    >
                        {view.title}
                    </span>
                )}
              </div>
            </div>
          ))}

          <button
            className="flex items-center h-9 px-3 text-gray-600 hover:bg-gray-100 text-xs font-normal ml-2 mb-[-1px]"
            onClick={() => onNewView()} >
            <Plus className="h-3 w-3 mr-1" />
            New view
          </button>
        </div>
      </div>
    )
}
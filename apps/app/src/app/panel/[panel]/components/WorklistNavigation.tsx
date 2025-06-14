"use client";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { usePanelStore } from "@/hooks/use-panel-store";
import type { PanelDefinition, ViewDefinition } from "@/types/worklist";
import { AlertCircle, CheckCircle, LayoutGrid, Loader2, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
  const { getSaveState, deleteView } = usePanelStore();
  const [editingPanel, setEditingPanel] = useState(false);
  const [editingViewId, setEditingViewId] = useState<string | null>(null);
  const [hoveredViewId, setHoveredViewId] = useState<string | null>(null);
  const [deletingViewId, setDeletingViewId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [viewToDelete, setViewToDelete] = useState<{ id: string; title: string } | null>(null);
  const [panelTitle, setPanelTitle] = useState(panelDefinition?.title || '');
  const [viewTitles, setViewTitles] = useState<Record<string, string>>(
    Object.fromEntries(panelDefinition?.views?.map(view => [view.id, view.title || '']) || [])
  );

  // Monitor when the view is actually deleted from the panel to close modal
  useEffect(() => {
    if (deletingViewId && viewToDelete && showDeleteModal) {
      // Check if the view still exists in the panel
      const viewStillExists = panelDefinition.views?.some(view => view.id === deletingViewId);

      if (!viewStillExists) {
        // View has been successfully deleted, close modal
        setShowDeleteModal(false);
        setViewToDelete(null);
        setDeletingViewId(null);
      }
    }
  }, [deletingViewId, viewToDelete, showDeleteModal, panelDefinition.views]);

  // Early return if panelDefinition is not available
  if (!panelDefinition) {
    return <div className="bg-gray-50 relative pt-4 h-9" />;
  }

  const handleViewClick = (view: ViewDefinition) => {
    if (view.id && !editingViewId) {
      router.push(`/panel/${panelDefinition.id}/view/${view.id}`);
    }
  };

  const handlePanelClick = () => {
    if (panelDefinition.id && !editingPanel) {
      router.push(`/panel/${panelDefinition.id}`);
    }
  };

  const handlePanelTitleSubmit = () => {
    const trimmedTitle = panelTitle.trim();

    if (!trimmedTitle) {
      // Don't save empty titles, reset to original
      setPanelTitle(panelDefinition.title);
      setEditingPanel(false);
      return;
    }

    if (onPanelTitleChange && trimmedTitle !== panelDefinition.title) {
      onPanelTitleChange(trimmedTitle);
    }
    setEditingPanel(false);
  };

  const handleViewTitleSubmit = (viewId: string) => {
    const trimmedTitle = viewTitles[viewId]?.trim() || '';
    const originalTitle = panelDefinition.views?.find(v => v.id === viewId)?.title || '';

    if (!trimmedTitle) {
      // Don't save empty titles, reset to original
      setViewTitles(prev => ({ ...prev, [viewId]: originalTitle }));
      setEditingViewId(null);
      return;
    }

    if (onViewTitleChange && trimmedTitle !== originalTitle) {
      onViewTitleChange(trimmedTitle);
    }
    setEditingViewId(null);
  };

  const handleDeleteViewClick = (viewId: string, viewTitle: string) => {
    setViewToDelete({ id: viewId, title: viewTitle });
    setShowDeleteModal(true);
  };

  const handleDeleteViewConfirm = async () => {
    if (!viewToDelete) return;

    try {
      setDeletingViewId(viewToDelete.id);

      // If we're deleting the currently selected view, navigate to panel
      if (viewToDelete.id === selectedViewId) {
        router.push(`/panel/${panelDefinition.id}`);
      }

      await deleteView(panelDefinition.id, viewToDelete.id);

      // The useEffect will handle closing the modal when save state becomes 'saved'
    } catch (error) {
      console.error('Failed to delete view:', error);
      // The error state will be shown via the status indicator
      // Reset deleting state but keep modal open
      setDeletingViewId(null);
    }
  };

  const handleDeleteModalClose = () => {
    if (!deletingViewId) {
      setShowDeleteModal(false);
      setViewToDelete(null);
    }
  };

  const getSaveStatusIcon = (entityId: string) => {
    const saveState = getSaveState(entityId);
    switch (saveState) {
      case 'saving':
        return <Loader2 className="h-3 w-3 ml-1 text-blue-500 animate-spin" />;
      case 'saved':
        return <CheckCircle className="h-3 w-3 ml-1 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-3 w-3 ml-1 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="bg-gray-50 relative pt-4">
        <div className="h-9 flex items-end px-2">                    {/* Border line that creates the tab effect */}
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gray-200" />

          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
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
            onKeyDown={(e) => {
              // Don't handle keyboard events if we're editing the panel title
              if (editingPanel) return;

              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                if (!selectedViewId) {
                  setEditingPanel(true);
                } else {
                  handlePanelClick();
                }
              }
            }}
            role="button"
            tabIndex={0}
          >
            <div className={`
                h-9 px-4 relative z-10 flex items-center rounded-t-md border-l border-t border-r
                ${editingPanel
                ? 'bg-slate-50 border-blue-200' // Highlight when editing
                : !selectedViewId
                  ? 'bg-white border-gray-200'
                  : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
              }
              `}>
              <LayoutGrid className={`h-3 w-3 mr-2 ${!selectedViewId ? 'text-yellow-800' : 'text-gray-500'}`} />
              {editingPanel ? (
                <div className="flex items-center w-full">
                  <input
                    type="text"
                    value={panelTitle}
                    placeholder="Enter panel name..."
                    onChange={(e) => setPanelTitle(e.target.value)}
                    onBlur={handlePanelTitleSubmit}
                    onKeyDown={(e) => {
                      e.stopPropagation(); // Prevent parent from handling
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handlePanelTitleSubmit();
                      }
                      if (e.key === 'Escape') {
                        e.preventDefault();
                        setEditingPanel(false);
                        setPanelTitle(panelDefinition.title); // Reset to original value
                      }
                    }}
                    className="text-xs bg-transparent border-none focus:outline-none focus:ring-0 p-0 flex-1"
                    // eslint-disable-next-line jsx-a11y/no-autofocus
                    autoFocus
                  />
                  {panelTitle.trim() !== panelDefinition.title && (
                    <span className="text-xs text-orange-500 ml-1" title="Unsaved changes">•</span>
                  )}
                </div>
              ) : (
                <>
                  <span
                    className={`text-xs ${!selectedViewId ? 'font-semibold text-gray-700' : 'font-normal text-gray-600'}`}
                  >
                    {panelDefinition.title}
                  </span>
                  {getSaveStatusIcon(`panel-${panelDefinition.id}`)}
                </>
              )}
            </div>
          </div>

          {/* List of views */}
          {panelDefinition.views?.map((view: ViewDefinition) => (
            <div
              key={view.id || Math.random().toString(36)}
              className="relative ml-2 mb-[-1px] cursor-pointer group"
              onClick={() => handleViewClick(view)}
              onKeyDown={(e) => {
                // Don't handle keyboard events if we're editing this view
                if (editingViewId === view.id) return;

                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleViewClick(view);
                }
              }}
              onMouseEnter={() => setHoveredViewId(view.id)}
              onMouseLeave={() => setHoveredViewId(null)}
              role="button"
              tabIndex={0}
            >
              <div className={`
                  h-9 px-4 relative z-10 flex items-center rounded-t-md border-l border-t border-r
                  ${editingViewId === view.id
                  ? 'bg-slate-50 border-blue-200' // Highlight when editing
                  : view.id === selectedViewId
                    ? 'bg-white border-gray-200'
                    : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                }
                `}>
                {editingViewId === view.id ? (
                  <div className="flex items-center w-full">
                    <input
                      type="text"
                      value={viewTitles[view.id] || ''}
                      placeholder="Enter view name..."
                      onChange={(e) => setViewTitles(prev => ({ ...prev, [view.id]: e.target.value }))}
                      onBlur={() => handleViewTitleSubmit(view.id)}
                      onKeyDown={(e) => {
                        e.stopPropagation(); // Prevent parent from handling
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleViewTitleSubmit(view.id);
                        }
                        if (e.key === 'Escape') {
                          e.preventDefault();
                          setEditingViewId(null);
                          setViewTitles(prev => ({
                            ...prev,
                            [view.id]: view.title || '' // Reset to original
                          }));
                        }
                      }}
                      className="text-xs bg-transparent border-none focus:outline-none focus:ring-0 p-0 flex-1"
                      // eslint-disable-next-line jsx-a11y/no-autofocus
                      autoFocus
                    />
                    {(viewTitles[view.id] || '').trim() !== (view.title || '') && (
                      <span className="text-xs text-orange-500 ml-1" title="Unsaved changes">•</span>
                    )}
                  </div>
                ) : (
                  <>
                    <span
                      className={`text-xs ${view.id === selectedViewId ? 'font-semibold text-gray-700' : 'font-normal text-gray-600'} flex-1`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (view.id === selectedViewId) {
                          setEditingViewId(view.id);
                        } else {
                          handleViewClick(view);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          e.stopPropagation();
                          if (view.id === selectedViewId) {
                            setEditingViewId(view.id);
                          } else {
                            handleViewClick(view);
                          }
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      {view?.title || 'Untitled View'}
                    </span>

                    {/* Status indicator and delete button container */}
                    <div className="flex items-center ml-1">
                      {getSaveStatusIcon(`view-${view.id}`)}

                      {/* Delete button - show on hover or when selected */}
                      {(hoveredViewId === view.id || view.id === selectedViewId) && (
                        <button
                          type="button"
                          className="ml-1 p-0.5 rounded hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteViewClick(view.id, view.title || 'Untitled View');
                          }}
                          title={`Delete view "${view.title || 'Untitled View'}"`}
                          disabled={deletingViewId === view.id}
                        >
                          {deletingViewId === view.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}

          <button
            type="button"
            className="flex items-center h-9 px-3 text-gray-600 hover:bg-gray-100 text-xs font-normal ml-2 mb-[-1px]"
            onClick={() => onNewView()} >
            <Plus className="h-3 w-3 mr-1" />
            New view
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={handleDeleteModalClose}
        onConfirm={handleDeleteViewConfirm}
        title="Delete View"
        message="Are you sure you want to delete this view? All filters and customizations will be permanently removed."
        itemName={viewToDelete?.title || 'Untitled View'}
        isDeleting={!!deletingViewId}
      />
    </>
  )
}
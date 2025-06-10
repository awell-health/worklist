"use client";
import WorklistFooter from "@/app/panel/[panel]/components/WorklistFooter";
import WorklistNavigation from "@/app/panel/[panel]/components/WorklistNavigation";
import WorklistTable from "@/app/panel/[panel]/components/WorklistTable";
import WorklistToolbar from "@/app/panel/[panel]/components/WorklistToolbar";
import { useColumnCreator } from "@/hooks/use-column-creator";
import { useMedplumStore, WorklistPatient, WorklistTask } from "@/hooks/use-medplum-store";
import { usePanelStore } from "@/hooks/use-panel-store";
import { useSearch } from "@/hooks/use-search";
import { ColumnDefinition, Filter, PanelDefinition, ViewDefinition, WorklistDefinition } from "@/types/worklist";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface TableFilter {
  key: string;
  value: string;
}

export default function WorklistPage() {
  const params = useParams();
  const viewId = params.view as string;
  const panelId = params.panel as string;
  const [isLoading, setIsLoading] = useState(true);
  const { patients, tasks, addTaskOwner, isLoading: isMedplumLoading } = useMedplumStore();
  const { getView, updateView, addView, isLoading: isPanelLoading, getPanel, panels } = usePanelStore();
  const [panelDefinition, setPanelDefinition] = useState<PanelDefinition | undefined>(undefined);
  const [viewDefinition, setViewDefinition] = useState<ViewDefinition | undefined>(undefined);
  const [columns, setColumns] = useState<ColumnDefinition[]>([]);
  const [tableData, setTableData] = useState<(WorklistPatient | WorklistTask)[]>([]);
  const [tableFilters, setTableFilters] = useState<TableFilter[]>([]);
  const { searchTerm, setSearchTerm, searchMode, setSearchMode, filteredData } = useSearch(tableData);
  const router = useRouter();

  useEffect(() => {
    setIsLoading(isMedplumLoading || isPanelLoading || !panelDefinition || !viewDefinition);
  }, [isMedplumLoading, isPanelLoading, panelDefinition, viewDefinition, panelId, viewId]);

  useEffect(() => {
    if (!viewDefinition) {
      return;
    }
    setColumns(viewDefinition.columns);
    setTableData(viewDefinition.viewType === 'patient' ? patients : tasks);
    // Convert view filters to table filters
    const newTableFilters = viewDefinition.filters.map(filter => ({
      key: filter.fhirPathFilter[0],
      value: filter.fhirPathFilter[1] || ''
    }));
    setTableFilters(newTableFilters);
    updateView(panelId, viewId, viewDefinition);
  }, [viewDefinition, tasks, patients]);

  useEffect(() => {
    if(isPanelLoading) {
      return;
    }

    const panel = getPanel(panelId);
    if(!panel) {
      // TODO panel not found
      return;
    }
    setPanelDefinition(panel);
    const view = getView(panelId, viewId);
    if(!view) {
      // TODO view not found
      return;
    }
    setViewDefinition(view);
  }, [panelId, viewId, isPanelLoading]);

  useEffect(() => {
    if(isPanelLoading) {
      return;
    }

    const panel = getPanel(panelId);
    if(!panel) {
      // TODO panel not found
      return;
    }
    setPanelDefinition(panel);
  }, [panels]);

  const onColumnUpdate = (updates: Partial<ColumnDefinition>) => {

    if (!viewDefinition) {
      return;
    }
    const newView = {
      ...viewDefinition,
      columns: viewDefinition.columns.map(column => {
        if (column.id === updates.id) {
          return {
            ...column,
            ...updates,
          }
        }
        return column;
      }),
    }
    updateView(panelId, viewId, newView);
    setViewDefinition(newView);
  }

  const onFiltersChange = (newTableFilters: TableFilter[]) => {
    if (!viewDefinition) {
      return;
    }
    // Convert table filters to view filters
    const newFilters: Filter[] = newTableFilters.map(filter => ({
      fhirPathFilter: [filter.key, filter.value]
    }));
    const newView = {
      ...viewDefinition,
      filters: newFilters,
    }
    updateView(panelId, viewId, newView);
    setViewDefinition(newView);
    setTableFilters(newTableFilters);
  }

  const onColumnChange = (column: ViewDefinition | WorklistDefinition) => {
    if(!viewDefinition) {
      return;
    }
    const newView = {
      ...viewDefinition,
      ...column,
    }
    updateView(panelId, viewId, newView);
    setViewDefinition(newView);
  }

  const { onAddColumn } = useColumnCreator({
    currentView: viewDefinition?.viewType ?? 'patient',
    patients,
    tasks,
    worklistDefinition: viewDefinition,
    onDefinitionChange: onColumnChange,
  });

  const onNewView = () => {
    const panel = getPanel(panelId);
    if (!panel) {
      return;
    }
    const newView = addView(panelId, {
      title: "New View",
      filters: viewDefinition?.filters ?? panel.filters,
      columns: viewDefinition?.columns ?? panel.taskViewColumns,
      createdAt: new Date().toISOString(),
      viewType: viewDefinition?.viewType ?? 'task',
    });
    router.push(`/panel/${panelId}/view/${newView.id}`);
  }

  const onViewTitleChange = (newTitle: string) => {
    if(!viewDefinition) {
      return;
    }
    const newView = {
      ...viewDefinition,
      title: newTitle,
    }
    updateView(panelId, viewId, newView);
  }

  return (
    <>
    {isLoading ? (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    ) : (
    <>
      <WorklistNavigation panelDefinition={panelDefinition!} selectedViewId={viewId} onNewView={onNewView} onViewTitleChange={onViewTitleChange} />
      <WorklistToolbar 
        searchTerm={searchTerm} 
        onSearch={setSearchTerm} 
        searchMode={searchMode}
        onSearchModeChange={setSearchMode}
        currentView={undefined}
        setCurrentView={() => {}} 
      />
      <WorklistTable isLoading={isLoading}
          selectedRows={[]}
          toggleSelectAll={() => {}}
          worklistColumns={columns}
          onAddColumn={onAddColumn}
          isBlank={false} 
          tableData={filteredData}
          handlePDFClick={() => {}}
          handleTaskClick={() => {}}
          handleRowHover={() => {}}
          toggleSelectRow={() => {}}
          handleAssigneeClick={(taskId: string) => addTaskOwner(taskId, process.env.NEXT_PUBLIC_AUTH_USER_ID ?? '')}
          setIsAddingIngestionSource={() => {}}
          currentView={viewDefinition?.viewType ?? 'patient'}
          handleDragEnd={() => {}} 
          onColumnUpdate={onColumnUpdate}
          filters={tableFilters}
          onFiltersChange={onFiltersChange}
        />
      <WorklistFooter 
        columnsCounter={columns.length} 
        rowsCounter={tableData.length} 
        navigateToHome={() => {}} 
        isAISidebarOpen={false}
      />
    </>
    )}
    </>
  );
}
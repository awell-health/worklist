"use client";
import WorklistFooter from "@/app/panel/[panel]/components/WorklistFooter";
import WorklistNavigation from "@/app/panel/[panel]/components/WorklistNavigation";
import WorklistTable from "@/app/panel/[panel]/components/WorklistTable";
import WorklistToolbar from "@/app/panel/[panel]/components/WorklistToolbar";
import { useColumnCreator } from "@/hooks/use-column-creator";
import { useMedplumStore, WorklistPatient, WorklistTask } from "@/hooks/use-medplum-store";
import { usePanelStorage } from "@/hooks/use-panel-storage";
import { useSearch } from "@/hooks/use-search";
import { ColumnDefinition, PanelDefinition, ViewDefinition } from "@/types/worklist";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
export default function WorklistPage() {
  const params = useParams();
  const viewId = params.view as string;
  const panelId = params.panel as string;
  const [currentView, setCurrentView] = useState<'patient' | 'task'>('patient');
  const [isLoading, setIsLoading] = useState(true);
  const { patients, tasks, addTaskOwner, isLoading: isMedplumLoading } = useMedplumStore();
  const { panels, getView, updateView, addView, isLoading: isPanelLoading, getPanel } = usePanelStorage();
  const [panelDefinition, setPanelDefinition] = useState<PanelDefinition | undefined>(undefined);
  const [selectedWorklistDefinition, setSelectedWorklistDefinition] = useState<ViewDefinition | undefined>(undefined);
  const [columns, setColumns] = useState<ColumnDefinition[]>([]);
  const [tableData, setTableData] = useState<(WorklistPatient | WorklistTask)[]>([]);
  const { searchTerm, setSearchTerm, searchMode, setSearchMode, filteredData } = useSearch(tableData);
  const router = useRouter();

  useEffect(() => {
    if (!selectedWorklistDefinition) {
      return;
    }
    setColumns(currentView === 'patient' ? selectedWorklistDefinition.patientViewColumns : selectedWorklistDefinition.taskViewColumns);
    setTableData(currentView === 'patient' ? patients : tasks);
    updateView(panelId, viewId, selectedWorklistDefinition);
  }, [selectedWorklistDefinition, currentView, tasks, patients]);

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
    setSelectedWorklistDefinition(view);
    
  }, [panelId, viewId, isPanelLoading]);

  useEffect(() => {
    const panel = getPanel(panelId);
    if(!panel) {
      // TODO panel not found
      return;
    }
    setPanelDefinition(panel);
  }, [panels, panelId]);

  useEffect(() => {
    setIsLoading(isMedplumLoading || isPanelLoading || !panelDefinition || !selectedWorklistDefinition);
    if(!isMedplumLoading) {
      setTableData(currentView === 'patient' ? patients : tasks);
    }
  }, [isMedplumLoading, isPanelLoading]);

  const { onAddColumn } = useColumnCreator({
    currentView,
    patients,
    tasks,
    selectedWorklistDefinition,
    setSelectedWorklistDefinition,
  });

  const onNewView = () => {
    const panel = getPanel(panelId);
    if (!panel) {
      return;
    }
    const newView = addView(panelId, {
      title: "New View",
      filters: panel.filters,
      taskViewColumns: panel.taskViewColumns,
      patientViewColumns: panel.patientViewColumns,
      createdAt: new Date().toISOString(),
    });
    router.push(`/panel/${panelId}/view/${newView.id}`);
  }

  const onViewTitleChange = (newTitle: string) => {
    if(!selectedWorklistDefinition) {
      return;
    }
    console.log("onViewTitleChange", newTitle);
    const newView = {
      ...selectedWorklistDefinition,
      title: newTitle,
    }
    updateView(panelId, viewId, newView);
  }

  return (
    <>
    {!selectedWorklistDefinition || !panelDefinition ? (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    ) : (
    <>
      <WorklistNavigation panelDefinition={panelDefinition} selectedViewId={viewId} onNewView={onNewView} onViewTitleChange={onViewTitleChange} />
      <WorklistToolbar 
        searchTerm={searchTerm} 
        onSearch={setSearchTerm} 
        searchMode={searchMode}
        onSearchModeChange={setSearchMode}
        currentView={currentView} 
        setCurrentView={setCurrentView} 
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
        // TODO: Hardcoded for now
        handleAssigneeClick={(taskId: string) => addTaskOwner(taskId, process.env.NEXT_PUBLIC_AUTH_USER_ID ?? '')}
        setIsAddingIngestionSource={() => {}}
        currentView={currentView}
        handleDragEnd={() => {}} />
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
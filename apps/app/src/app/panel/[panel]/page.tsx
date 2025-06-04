"use client";

import WorklistFooter from "@/app/panel/[panel]/components/WorklistFooter";
import WorklistNavigation from "@/app/panel/[panel]/components/WorklistNavigation";
import WorklistTable from "@/app/panel/[panel]/components/WorklistTable";
import WorklistToolbar from "@/app/panel/[panel]/components/WorklistToolbar";
import { useColumnCreator } from "@/hooks/use-column-creator";
import { useMedplumStore, WorklistPatient, WorklistTask } from "@/hooks/use-medplum-store";
import { usePanelStorage } from "@/hooks/use-panel-storage";
import { useSearch } from "@/hooks/use-search";
import { ColumnDefinition, PanelDefinition } from "@/types/worklist";
import { DEFAULT_WORKLIST } from "@/utils/constants";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AddIngestionModal } from "./components/AddIngestionModal";

export default function WorklistPage() {
  const params = useParams();
  const panelId = params.panel as string;
  const [currentView, setCurrentView] = useState<'patient' | 'task'>('patient');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingIngestionSource, setIsAddingIngestionSource] = useState(false);
  const { patients, tasks, addTaskOwner, isLoading: isMedplumLoading } = useMedplumStore();
  const [selectedWorklistDefinition, setSelectedWorklistDefinition] = useState<PanelDefinition | undefined>(undefined);
  const [columns, setColumns] = useState<ColumnDefinition[]>([]);
  const [tableData, setTableData] = useState<(WorklistPatient | WorklistTask)[]>([]);
  const { searchTerm, setSearchTerm, searchMode, setSearchMode, filteredData } = useSearch(tableData);
  const {  getPanel, createPanel, updatePanel, addView, isLoading: isPanelLoading } = usePanelStorage();
  const router = useRouter();

  useEffect(() => {
    if(isPanelLoading) {
      return;
    }

    const panel = getPanel(panelId);
    if(!panel) {
      if (panelId === 'default') {
        const newPanel = createPanel(DEFAULT_WORKLIST);
        router.push(`/panel/${newPanel.id}`);
      }
    } else {
      setSelectedWorklistDefinition(panel);
    }
  }, [panelId, router, isPanelLoading]);

  useEffect(() => {
    if (!selectedWorklistDefinition) {
      return;
    }
    setColumns(currentView === 'patient' ? selectedWorklistDefinition.patientViewColumns : selectedWorklistDefinition.taskViewColumns);
    setTableData(currentView === 'patient' ? patients : tasks);
    updatePanel(selectedWorklistDefinition.id, selectedWorklistDefinition);
  }, [selectedWorklistDefinition, currentView, tasks, patients]);

  useEffect(() => {
    setIsLoading(isMedplumLoading || isPanelLoading);
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
    if (!selectedWorklistDefinition) {
      return;
    }
    const newView = addView(selectedWorklistDefinition.id, {
      title: "New View",
      filters: selectedWorklistDefinition.filters,
      taskViewColumns: selectedWorklistDefinition.taskViewColumns,
      patientViewColumns: selectedWorklistDefinition.patientViewColumns,
      createdAt: new Date().toISOString(),
    });
    router.push(`/panel/${selectedWorklistDefinition.id}/view/${newView.id}`);
  }

  const onPanelTitleChange = (newTitle: string) => {
    if (!selectedWorklistDefinition) {
      return;
    }
    const newPanel = {
      ...selectedWorklistDefinition,
      title: newTitle,
    }
    updatePanel(selectedWorklistDefinition.id, newPanel);
    setSelectedWorklistDefinition(newPanel);
  }

  return (
    <>
      {!selectedWorklistDefinition ? (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <>
          <WorklistNavigation panelDefinition={selectedWorklistDefinition} onNewView={onNewView} onPanelTitleChange={onPanelTitleChange} />
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
            handleAssigneeClick={(taskId: string) => addTaskOwner(taskId, process.env.NEXT_PUBLIC_AUTH_USER_ID ?? '')}
            setIsAddingIngestionSource={() => setIsAddingIngestionSource(true)}
            currentView={currentView}
            handleDragEnd={() => {}} />
          {isAddingIngestionSource && (
            <AddIngestionModal 
              isOpen={isAddingIngestionSource} 
              onClose={() => setIsAddingIngestionSource(false)} 
              onSelectSource={() => {}} 
              ingestionBots={[]}
            />
          )}
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
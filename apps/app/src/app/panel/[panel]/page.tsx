"use client";

import WorklistFooter from "@/app/panel/[panel]/components/WorklistFooter";
import WorklistNavigation from "@/app/panel/[panel]/components/WorklistNavigation";
import WorklistTable from "@/app/panel/[panel]/components/WorklistTable";
import WorklistToolbar from "@/app/panel/[panel]/components/WorklistToolbar";
import { useColumnCreator } from "@/hooks/use-column-creator";
import { useMedplumStore, WorklistPatient, WorklistTask } from "@/hooks/use-medplum-store";
import { usePanelStore } from "@/hooks/use-panel-store";
import { useSearch } from "@/hooks/use-search";
import { ColumnDefinition, PanelDefinition, WorklistDefinition } from "@/types/worklist";
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
  const [panelDefinition, setPanelDefinition] = useState<PanelDefinition | undefined>(undefined);
  const [columns, setColumns] = useState<ColumnDefinition[]>([]);
  const [tableData, setTableData] = useState<(WorklistPatient | WorklistTask)[]>([]);
  const { searchTerm, setSearchTerm, searchMode, setSearchMode, filteredData } = useSearch(tableData);

  const { patients, tasks, addTaskOwner, isLoading: isMedplumLoading } = useMedplumStore();
  const {  getPanel, createPanel, updatePanel, addView, isLoading: isPanelLoading } = usePanelStore();

  const router = useRouter();

  useEffect(() => {
    setIsLoading(isPanelLoading || isMedplumLoading || !panelDefinition);
  }, [isPanelLoading, isMedplumLoading, panelId, panelDefinition]);

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
      setPanelDefinition(panel);
    }
  }, [panelId, router, isPanelLoading]);


  useEffect(() => {
    if (!panelDefinition) {
      return;
    }
    setColumns(currentView === 'patient' ? panelDefinition.patientViewColumns : panelDefinition.taskViewColumns);
    setTableData(currentView === 'patient' ? patients : tasks);
    updatePanel(panelDefinition.id, panelDefinition);
  }, [panelDefinition, currentView, tasks, patients, isLoading]);

  const onColumnChange = (column: WorklistDefinition) => {
    if(!panelDefinition) {
      return;
    }
    const newPanel = {
      ...panelDefinition,
      ...column,
    }
    updatePanel(panelDefinition.id, newPanel);
    setPanelDefinition(newPanel);
  }

  const { onAddColumn } = useColumnCreator({
    currentView,
    patients,
    tasks,
    worklistDefinition: panelDefinition,
    onDefinitionChange: onColumnChange,
  });

  const onNewView = () => {
    if (!panelDefinition) {
      return;
    }
    const newView = addView(panelDefinition.id, {
      title: "New View",
      filters: panelDefinition.filters,
      taskViewColumns: panelDefinition.taskViewColumns,
      patientViewColumns: panelDefinition.patientViewColumns,
      createdAt: new Date().toISOString(),
    });
    router.push(`/panel/${panelDefinition.id}/view/${newView.id}`);
  }

  const onPanelTitleChange = (newTitle: string) => {
    if (!panelDefinition) {
      return;
    }
    const newPanel = {
      ...panelDefinition,
      title: newTitle,
    }
    updatePanel(panelDefinition.id, newPanel);
    setPanelDefinition(newPanel);
  }

  return (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <>
          <WorklistNavigation panelDefinition={panelDefinition!} onNewView={onNewView} onPanelTitleChange={onPanelTitleChange} />
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

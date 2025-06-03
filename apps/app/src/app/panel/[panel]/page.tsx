"use client";
import WorklistFooter from "@/app/panel/[panel]/components/WorklistFooter";
import WorklistNavigation from "@/app/panel/[panel]/components/WorklistNavigation";
import WorklistTable from "@/app/panel/[panel]/components/WorklistTable";
import WorklistToolbar from "@/app/panel/[panel]/components/WorklistToolbar";
import { useColumnCreator } from "@/hooks/use-column-creator";
import { useMedplumStore, WorklistPatient, WorklistTask } from "@/hooks/use-medplum-store";
import { useSearch } from "@/hooks/use-search";
import { ColumnDefinition, WorklistDefinition } from "@/types/worklist";
import { DEFAULT_WORKLIST } from "@/utils/constants";
import { useEffect, useState } from "react";
import { AddIngestionModal } from "./components/AddIngestionModal";

export default function WorklistPage() {
  const [currentView, setCurrentView] = useState<'patient' | 'task'>('patient');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingIngestionSource, setIsAddingIngestionSource] = useState(false);
  const { patients, tasks, addTaskOwner, isLoading: isMedplumLoading } = useMedplumStore();
  const [selectedWorklistDefinition, setSelectedWorklistDefinition] = useState<WorklistDefinition>(DEFAULT_WORKLIST);
  const [columns, setColumns] = useState<ColumnDefinition[]>(DEFAULT_WORKLIST.patientViewColumns);
  const [tableData, setTableData] = useState<(WorklistPatient | WorklistTask)[]>([]);
  const { searchTerm, setSearchTerm, searchMode, setSearchMode, filteredData } = useSearch(tableData);

  useEffect(() => {
    setColumns(currentView === 'patient' ? selectedWorklistDefinition.patientViewColumns : selectedWorklistDefinition.taskViewColumns);
    setTableData(currentView === 'patient' ? patients : tasks);
  }, [selectedWorklistDefinition, currentView, tasks, patients]);

  useEffect(() => {
    setSelectedWorklistDefinition(DEFAULT_WORKLIST);
    setIsLoading(isMedplumLoading);
    if(!isMedplumLoading) {
      setTableData(currentView === 'patient' ? patients : tasks);
    }
  }, [isMedplumLoading]);

  const { onAddColumn } = useColumnCreator({
    currentView,
    patients,
    tasks,
    selectedWorklistDefinition,
    setSelectedWorklistDefinition,
  });

  const onNewView = () => {
    alert("TODO: Adding a new view is not yet possible");
  }

  return (
    <>
      <WorklistNavigation worklistDefinition={selectedWorklistDefinition} onNewView={onNewView} />
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
  );
}
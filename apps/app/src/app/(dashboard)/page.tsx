"use client";
import { useEffect, useState, useCallback } from "react";
import { useDrawer } from "@/contexts/DrawerContext";
import WorklistNavigation from "@/app/(dashboard)/components/WorklistNavigation";
import WorklistToolbar from "@/app/(dashboard)/components/WorklistToolbar";
import WorklistFooter from "@/app/(dashboard)/components/WorklistFooter";
import WorklistTable from "@/app/(dashboard)/components/WorklistTable";
import { AddIngestionModal } from "./components/AddIngestionModal";
import AIConversationDrawer from "@/components/AIConversationDrawer";
import { DEFAULT_WORKLIST_PATIENT_VIEW, DEFAULT_WORKLIST_TASK_VIEW } from "@/utils/constants";
import { useMedplumStore } from "@/hooks/use-medplum-store";
import { useSearch } from "@/hooks/use-search";
import { ChatMessage, columnAiAssistantMessageHandler } from "../actions/ai-chat";
import { WorklistDefinition } from "@/types/worklist";
import { WorklistPatient, WorklistTask } from "@/hooks/use-medplum-store";
import { useColumnCreator } from "@/hooks/use-column-creator";

export default function WorklistPage() {
  const [currentView, setCurrentView] = useState<'patient' | 'task'>('patient');
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingIngestionSource, setIsAddingIngestionSource] = useState(false);
  const [isAISidebarOpen, setIsAISidebarOpen] = useState(false);
  const { openDrawer, closeDrawer } = useDrawer();
  const { patients, tasks, addTaskOwner } = useMedplumStore();
  const [patientViewWorklistDefinition, setPatientViewWorklistDefinition] = useState<WorklistDefinition>();
  const [taskViewWorklistDefinition, setTaskViewWorklistDefinition] = useState<WorklistDefinition>();
  const [selectedWorklistDefinition, setSelectedWorklistDefinition] = useState<WorklistDefinition>();

  const { searchTerm, setSearchTerm, searchMode, setSearchMode, filteredData } = useSearch(
    (currentView === 'patient' ? patients : tasks) as (WorklistPatient | WorklistTask)[]
  );

  useEffect(() => {
    setPatientViewWorklistDefinition(DEFAULT_WORKLIST_PATIENT_VIEW);
    setTaskViewWorklistDefinition(DEFAULT_WORKLIST_TASK_VIEW);
  }, [])

  useEffect(() => {
    setSelectedWorklistDefinition(currentView === 'patient' ? patientViewWorklistDefinition : taskViewWorklistDefinition);
  }, [currentView, patientViewWorklistDefinition, taskViewWorklistDefinition])

  const { onAddColumn } = useColumnCreator({
    currentView,
    patients,
    tasks,
    selectedWorklistDefinition,
    setPatientViewWorklistDefinition,
    setTaskViewWorklistDefinition,
  });

  const onNewWorklist = () => {
    alert("TODO: Implement new worklist");
  }

  return (
    <>
      <WorklistNavigation worklistDefinition={{ title: "New worklist" }} onNewWorklist={onNewWorklist} />
      <WorklistToolbar 
        searchTerm={searchTerm} 
        onSearch={setSearchTerm} 
        searchMode={searchMode}
        onSearchModeChange={setSearchMode}
        currentView={currentView} 
        setCurrentView={setCurrentView} 
      />
      <WorklistTable isLoading={isLoading && !selectedWorklistDefinition}
        selectedRows={[]}
        toggleSelectAll={() => {}}
        worklistDefinition={selectedWorklistDefinition ?? DEFAULT_WORKLIST_PATIENT_VIEW}
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
        columnsCounter={selectedWorklistDefinition?.columns.length ?? 0} 
        rowsCounter={currentView === 'patient' ? patients.length : tasks.length} 
        navigateToHome={() => {}} 
        isAISidebarOpen={isAISidebarOpen}
      />
    </>
  );
}
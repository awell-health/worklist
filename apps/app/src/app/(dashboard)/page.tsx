"use client";
import { useEffect, useState, useCallback } from "react";
import { useDrawer } from "@/contexts/DrawerContext";
import WorklistNavigation from "@/components/WorklistNavigation";
import WorklistToolbar from "@/components/WorklistToolbar";
import WorklistFooter from "@/components/WorklistFooter";
import WorklistTable from "@/components/WorklistTable";
import { AddIngestionModal } from "./components/AddIngestionModal";
import AIConversationDrawer from "@/components/AIConversationDrawer";
import { DEFAULT_WORKLIST_PATIENT_VIEW, DEFAULT_WORKLIST_TASK_VIEW } from "@/utils/constants";
import { useMedplumStore } from "@/hooks/use-medplum-store";
import { ChatMessage, columnAiAssistantMessageHandler } from "../actions/ai-chat";
import { WorklistDefinition } from "@/types/worklist";

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

  useEffect(() => {
    setPatientViewWorklistDefinition(DEFAULT_WORKLIST_PATIENT_VIEW);
    setTaskViewWorklistDefinition(DEFAULT_WORKLIST_TASK_VIEW);
  }, [])

  useEffect(() => {
    setSelectedWorklistDefinition(currentView === 'patient' ? patientViewWorklistDefinition : taskViewWorklistDefinition);
  }, [currentView, patientViewWorklistDefinition, taskViewWorklistDefinition])

  const onAddColumn = () => {
      const getInitialMessage = useCallback(async () => {
        const result = await columnAiAssistantMessageHandler(
          [{ role: "user", content: "Can you share an extensive list of all columns that are available in the data? Including the inputs" }], 
          currentView === 'patient' ? patients : tasks, 
          selectedWorklistDefinition
        );
        return result.response;
      }, [currentView, patients, tasks, selectedWorklistDefinition]);

      const handleSendMessage = async (conversation: ChatMessage[]) => {
        const result = await columnAiAssistantMessageHandler(conversation, currentView === 'patient' ? patients : tasks, selectedWorklistDefinition);
        if (result.needsDefinitionUpdate) {
          if(currentView === 'patient') {
            console.log("Updating patient view worklist definition", result.definition);
            setPatientViewWorklistDefinition(result.definition);
          } else {
            console.log("Updating task view worklist definition", result.definition);
            setTaskViewWorklistDefinition(result.definition);
          }
        }
        return result.response;
      };
      openDrawer(<AIConversationDrawer getInitialMessage={getInitialMessage} onClose={closeDrawer} onSendMessage={handleSendMessage} />, "Column Creator Assistant");
  };

  const onNewWorklist = () => {
    alert("TODO: Implement new worklist");
  }

  return (
    <>
      <WorklistNavigation worklistDefinition={{ title: "New worklist" }} onNewWorklist={onNewWorklist} />
      <WorklistToolbar searchTerm="" onSearch={() => {}} currentView={currentView} setCurrentView={setCurrentView} />
      <WorklistTable isLoading={isLoading && !selectedWorklistDefinition}
        selectedRows={[]}
        toggleSelectAll={() => {}}
        worklistDefinition={selectedWorklistDefinition ?? DEFAULT_WORKLIST_PATIENT_VIEW}
        onAddColumn={onAddColumn}
        isBlank={false} 
        tableData={currentView === 'patient' ? patients : tasks}
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
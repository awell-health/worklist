"use client";
import { useEffect, useState } from "react";
import { useDrawer } from "@/contexts/DrawerContext";
import WorklistNavigation from "@/components/WorklistNavigation";
import WorklistToolbar from "@/components/WorklistToolbar";
import WorklistFooter from "@/components/WorklistFooter";
import WorklistTable from "@/components/WorklistTable";
import { AddIngestionModal } from "./components/AddIngestionModal";
import AIConversationDrawer from "@/components/AIConversationDrawer";
import { DEFAULT_WORKLIST_PATIENT_VIEW, DEFAULT_WORKLIST_TASK_VIEW } from "@/utils/constants";
import { useMedplumStore } from "@/hooks/use-medplum-store";
import { chatWithAI, ChatMessage } from "../actions/ai-chat";
import { WorklistDefinition } from "@/types/worklist";

export default function WorklistPage() {
  const [currentView, setCurrentView] = useState<'patient' | 'task'>('patient');
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingIngestionSource, setIsAddingIngestionSource] = useState(false);
  const [isAISidebarOpen, setIsAISidebarOpen] = useState(false);
  const { openDrawer, closeDrawer } = useDrawer();
  const { patients, tasks } = useMedplumStore();
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


  // TODO move this to the backend
  const handleSendMessage = async (conversation: ChatMessage[]) => {
    const prompt = `You are a helpful assistant that helps users add columns to their view.
          
          Current worklist definition:
          ${JSON.stringify(selectedWorklistDefinition, null, 2)}
          
          All the data is FHIR data.Available data: 
          ${JSON.stringify(currentView === 'patient' ? patients.slice(0, 10) : tasks.slice(0, 10), null, 2)}
         
          Your task is to:
          1. Explain what columns are possible to add based on the available data, please provide field based arrays and fields inside arrays as well. For tasks insure you provide all inputs. Do not provide the fhirpath syntax at this stage.
          2. Help users understand what each field represents
          3. Tell them that they can ask for whatever column they want and you will do it. Never suggest an json unless the user asks for a change to the worklist definition.
          4. When suggesting changes, include a complete updated worklist definition in JSON with the following structure:
            {
            "title": "A clear title for this worklist",
            "columns": [
                {
                "id": "column_id", // a unique identifier for the column
                "name": "column_name", // the name of the column
                "type": "data_type", // Must be one of: "string" | "number" | "date" | "boolean" | "tasks" | "select" | "array"
                "key": "field_name", // Must exist in the data structure and must use the fhirpath syntax to access the data
                "description": "Brief description of what this column represents"
                }
            ]
            }            

          Be concise and clear in your explanations.
          When suggesting changes, always include the complete updated worklist definition in a JSON code block.`
    const response = await chatWithAI(conversation, prompt);

    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/)
    if (jsonMatch) {
      console.log("jsonMatch", jsonMatch)
      const updatedDefinition = JSON.parse(jsonMatch[1])
      console.log("updatedDefinition", updatedDefinition)

      if (currentView === 'patient') {
        setPatientViewWorklistDefinition(updatedDefinition)
      } else {
        setTaskViewWorklistDefinition(updatedDefinition)
      }
    }
    return response;
  };

  const handleOpenSidebar = (mode: string) => {
    if (mode === "ai-conversation") {
      const getInitialMessage = () => handleSendMessage([{ role: "user", content: "Can you share the list of columns that are available in the data?" }]);
      openDrawer(<AIConversationDrawer getInitialMessage={getInitialMessage} onClose={closeDrawer} onSendMessage={handleSendMessage} />, "Column Creator Assistant");
    }
  };

  return (
    <>
      <WorklistNavigation worklistDefinition={{ title: "New worklist" }} openSidebarWithMode={handleOpenSidebar} />
      <WorklistToolbar searchTerm="" onSearch={() => {}} currentView={currentView} setCurrentView={setCurrentView} />
      <WorklistTable isLoading={isLoading && !selectedWorklistDefinition}
        selectedRows={[]}
        toggleSelectAll={() => {}}
        worklistDefinition={selectedWorklistDefinition ?? DEFAULT_WORKLIST_PATIENT_VIEW}
        openSidebarWithMode={handleOpenSidebar}
        isBlank={false} 
        tableData={currentView === 'patient' ? patients : tasks}
        getCurrentViewData={() => currentView === 'patient' ? patients : tasks} 
        handlePDFClick={() => {}}
        handleTaskClick={() => {}}
        handleRowHover={() => {}}
        toggleSelectRow={() => {}}
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
      <WorklistFooter worklistDefinition={{ title: "Worklist 1", columns: [] }} getViewCounts={() => ({ rows: 0, label: "rows" })} isAISidebarOpen={isAISidebarOpen} toggleAISidebar={() => setIsAISidebarOpen(!isAISidebarOpen)} navigateToHome={() => {}} />
    </>
  );
}
import { useCallback } from 'react';
import { useDrawer } from "@/contexts/DrawerContext";
import AIConversationDrawer from "@/components/AIConversationDrawer";
import { ChatMessage, columnAiAssistantMessageHandler } from "@/app/actions/ai-chat";
import { WorklistDefinition } from "@/types/worklist";
import { WorklistPatient, WorklistTask } from "@/hooks/use-medplum-store";
import { createElement } from 'react';

interface UseColumnCreatorProps {
  currentView: 'patient' | 'task';
  patients: WorklistPatient[];
  tasks: WorklistTask[];
  selectedWorklistDefinition: WorklistDefinition | undefined;
  setPatientViewWorklistDefinition: (definition: WorklistDefinition) => void;
  setTaskViewWorklistDefinition: (definition: WorklistDefinition) => void;
}

export const useColumnCreator = ({
  currentView,
  patients,
  tasks,
  selectedWorklistDefinition,
  setPatientViewWorklistDefinition,
  setTaskViewWorklistDefinition,
}: UseColumnCreatorProps) => {
  const { openDrawer, closeDrawer } = useDrawer();

  const getInitialMessage = useCallback(async () => {
    const result = await columnAiAssistantMessageHandler(
      [{ role: "user", content: "Can you share an extensive list of all columns that are available in the data? Including the inputs" }], 
      currentView === 'patient' ? patients : tasks, 
      selectedWorklistDefinition ?? undefined
    );
    return result.response;
  }, [currentView, patients, tasks, selectedWorklistDefinition]);

  const handleSendMessage = async (conversation: ChatMessage[]) => {
    const result = await columnAiAssistantMessageHandler(
      conversation, 
      currentView === 'patient' ? patients : tasks, 
      selectedWorklistDefinition ?? undefined
    );
    if (result.needsDefinitionUpdate && result.definition) {
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

  const onAddColumn = () => {
    const drawerContent = createElement(AIConversationDrawer, {
      getInitialMessage,
      onClose: closeDrawer,
      onSendMessage: handleSendMessage
    });
    openDrawer(drawerContent, "Column Creator Assistant");
  };

  return { onAddColumn };
}; 
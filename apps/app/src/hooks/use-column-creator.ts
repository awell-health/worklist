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
  setSelectedWorklistDefinition: (definition: WorklistDefinition) => void;
}

export const useColumnCreator = ({
  currentView,
  patients,
  tasks,
  selectedWorklistDefinition,
  setSelectedWorklistDefinition,
}: UseColumnCreatorProps) => {
  const { openDrawer, closeDrawer } = useDrawer();

  const getInitialMessage = useCallback(async () => {
    const result = await columnAiAssistantMessageHandler(
      [{ role: "user", content: `Can you share an extensive list of all columns that are available in the data? Including the inputs. The current view is ${currentView}.` }], 
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
      setSelectedWorklistDefinition(result.definition);
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
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

    return `How can I assist you? I can list the existing columns and explain their meanings, help you add new columns to the view, and assist with filtering or enriching columns. The current view is: ${currentView}.`;
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
"use client";
import WorklistNavigation from "@/components/WorklistNavigation";
import WorklistToolbar from "@/components/WorklistToolbar";
import WorklistFooter from "@/components/WorklistFooter";
import WorklistTable from "@/components/WorklistTable";
import { useState } from "react";
import { AddIngestionModal } from "./components/AddIngestionModal";
import { DEFAULT_WORKLIST_PATIENT_VIEW, DEFAULT_WORKLIST_TASK_VIEW } from "@/utils/constants";
import { useMedplumStore } from "@/hooks/use-medplum-store";
export default function WorklistPage() {

  const [currentView, setCurrentView] = useState<'patient' | 'task'>('patient');
  const [isAddingIngestionSource, setIsAddingIngestionSource] = useState(false);
  const { patients, tasks, isLoading } = useMedplumStore();

console.log(patients);
console.log(tasks);

  return (
    <>
      <WorklistNavigation worklistDefinition={{ title: "New worklist" }} openSidebarWithMode={() => { }} />
      <WorklistToolbar searchTerm="" onSearch={() => { }} currentView={currentView} setCurrentView={setCurrentView} />
      <WorklistTable isLoading={isLoading}
        selectedRows={[]}
        toggleSelectAll={() => { }}
        worklistDefinition={currentView === 'patient' ? DEFAULT_WORKLIST_PATIENT_VIEW : DEFAULT_WORKLIST_TASK_VIEW}
        openSidebarWithMode={() => { }}
        isBlank={false} 
        tableData={currentView === 'patient' ? patients : tasks}
        getCurrentViewData={() => currentView === 'patient' ? patients : tasks} 
        handlePDFClick={() => { }}
        handleTaskClick={() => { }}
        handleRowHover={() => { }}
        toggleSelectRow={() => { }}
        setIsAddingIngestionSource={() => { setIsAddingIngestionSource(true) }}
        currentView={currentView}
        handleDragEnd={() => { }} />
      {isAddingIngestionSource && <AddIngestionModal isOpen={isAddingIngestionSource} onClose={() => setIsAddingIngestionSource(false)} onSelectSource={() => { }} />}
      <WorklistFooter worklistDefinition={{ title: "Worklist 1", columns: [] }} getViewCounts={() => ({ rows: 0, label: "rows" })} isAISidebarOpen={false} toggleAISidebar={() => { }} navigateToHome={() => { }} />
    </>
  )
}
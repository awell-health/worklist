"use client";
import WorklistNavigation from "@/components/WorklistNavigation";
import WorklistToolbar from "@/components/WorklistToolbar";
import WorklistFooter from "@/components/WorklistFooter";
import WorklistTable from "@/components/WorklistTable";
import { useState } from "react";
import { AddIngestionModal } from "./components/AddIngestionModal";
import { initialColumns } from "@/utils/constants";
export default function WorklistPage() {

  const [currentView, setCurrentView] = useState<'patient' | 'task'>('patient');
  const [isAddingIngestionSource, setIsAddingIngestionSource] = useState(false);

  return (
    <>
      <WorklistNavigation worklistDefinition={{ title: "New worklist" }} openSidebarWithMode={() => { }} />
      <WorklistToolbar searchTerm="" onSearch={() => { }} currentView={currentView} setCurrentView={setCurrentView} />
      <WorklistTable isLoading={false}
        selectedRows={[]}
        toggleSelectAll={() => { }}
        worklistDefinition={{ title: "New worklist", columns: initialColumns }}
        openSidebarWithMode={() => { }}
        isBlank={false} tableData={[]}
        getCurrentViewData={() => {return []}} 
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
"use client";
import WorklistNavigation from "@/components/WorklistNavigation";
import WorklistToolbar from "@/components/WorklistToolbar";
import WorklistFooter from "@/components/WorklistFooter";
import WorklistTable from "@/components/WorklistTable";

export default function WorklistPage() {
  return (
    <>
      <WorklistNavigation worklistDefinition={{ title: "Worklist 1" }} openSidebarWithMode={() => { }} />
      <WorklistToolbar searchTerm="" onSearch={() => { }} currentView="list" setCurrentView={() => { }} />
      <div className="flex-1 overflow-auto">
        <WorklistTable isLoading={false}
          selectedRows={[]}
          toggleSelectAll={() => { }}
          columnsWithIds={[]}
          worklistDefinition={{ title: "Worklist 1", columns: [] }}
          openSidebarWithMode={() => { }}
          isBlank={false} tableData={[]}
          getCurrentViewData={() => {return []}} 
          handlePDFClick={() => { }}
          handleTaskClick={() => { }}
          handleRowHover={() => { }}
          toggleSelectRow={() => { }}
          setIsAddSourceModalOpen={() => { }}
          currentView="list"
          handleDragEnd={() => { }} />
      </div>
      <WorklistFooter worklistDefinition={{ title: "Worklist 1", columns: [] }} getViewCounts={() => ({ rows: 0, label: "rows" })} isAISidebarOpen={false} toggleAISidebar={() => { }} navigateToHome={() => { }} />
    </>
  )
}
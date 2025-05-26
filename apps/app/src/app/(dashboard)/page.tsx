"use client";
import WorklistNavigation from "@/components/WorklistNavigation";
import WorklistToolbar from "@/components/WorklistToolbar";
import WorklistFooter from "@/components/WorklistFooter";

export default function WorklistPage() {
  return (
    <>
      <WorklistNavigation worklistDefinition={{ title: "Worklist 1" }} openSidebarWithMode={() => {}} />
      <WorklistToolbar searchTerm="" onSearch={() => {}} currentView="list" setCurrentView={() => {}} />
      <label
        htmlFor="my-drawer-4"
        className="drawer-button btn btn-primary"
      >
        Open drawer
      </label>
      <WorklistFooter worklistDefinition={{ title: "Worklist 1", columns: [] }} getViewCounts={() => ({ rows: 0, label: "rows" })} isAISidebarOpen={false} toggleAISidebar={() => {}} navigateToHome={() => {}} />
    </>
  )
}
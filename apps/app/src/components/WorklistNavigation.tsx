"use client";
import { Plus } from "lucide-react";
import React from "react";

interface WorklistDefinition {
    title: string;
}

interface WorklistNavigationProps {
    worklistDefinition: WorklistDefinition;
    openSidebarWithMode: (mode: string) => void;
}

export default function WorklistNavigation({ worklistDefinition, openSidebarWithMode }: WorklistNavigationProps) {
    return (
      <div className="bg-gray-50 relative pt-4">
        <div className="h-9 flex items-end px-2">          {/* Border line that creates the tab effect */}
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gray-200"></div>

          {/* Active tab */}
          <div className="relative ml-2 mb-[-1px]">
            {/* Tab with borders */}
            <div className="h-9 px-4 bg-white relative z-10 flex items-center rounded-t-md border-l border-t border-r border-gray-200">
              <span className="text-xs font-semibold text-gray-700">{worklistDefinition.title}</span>
            </div>
          </div>

          {/* New worklist button */}
          <button
            className="flex items-center h-9 px-3 text-gray-600 hover:bg-gray-100 text-xs font-normal ml-2 mb-[-1px]"
          >
            <Plus className="h-3 w-3 mr-1" />
            New worklist
          </button>
        </div>
      </div>
    )
}
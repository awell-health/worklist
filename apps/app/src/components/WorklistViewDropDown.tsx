"use client";
import { cn } from "@/lib/utils";
import { CheckSquare, ChevronDown, Users, View } from "lucide-react";
import React from "react";

interface ViewDropdownProps {
    currentView: 'task' | 'patient';
    onViewChange: (view: 'task' | 'patient') => void;
}

export default function ViewDropdown({ currentView, onViewChange }: ViewDropdownProps) {

    const getViewContent = (view: 'task' | 'patient') => {
        return view === 'patient' ?  <><Users className="h-3.5 w-3.5 mr-2 text-gray-500" /> Patient View </> : 
        <><CheckSquare className="h-3.5 w-3.5 mr-2 text-gray-500" /> Task View</>
    }

    return (
        <div className="dropdown dropdown-hover">
            <button className="flex items-center h-8 px-3 text-xs font-normal text-gray-700 border border-gray-200 rounded-md bg-white hover:bg-gray-50">
                {getViewContent(currentView)}
                <ChevronDown className="h-3.5 w-3.5 ml-2 text-gray-400" />
            </button>
            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
                <li><a  className={cn(
                "flex items-center w-full px-3 py-2 text-xs font-normal text-left hover:bg-gray-50",
                currentView === "patient" ? "bg-gray-50 text-blue-500" : "text-gray-700",
              )} onClick={() => onViewChange("patient")}>              
                    {getViewContent("patient")}
                </a></li>
                <li><a className={cn(
                "flex items-center w-full px-3 py-2 text-xs font-normal text-left hover:bg-gray-50",
                currentView === "task" ? "bg-gray-50 text-blue-500" : "text-gray-700",
              )} onClick={() => onViewChange("task")}>
                    {getViewContent("task")}
                </a></li>
            </ul>
       </div>
    )
}
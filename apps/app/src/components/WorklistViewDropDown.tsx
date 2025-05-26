"use client";
import React from "react";

interface ViewDropdownProps {
    currentView: string;
    onViewChange: (view: string) => void;
}

export default function ViewDropdown({ currentView, onViewChange }: ViewDropdownProps) {
    return (
        <div className="dropdown dropdown-hover">
            <div tabIndex={0} role="button" className="btn m-1">{currentView}</div>
            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
                <li><a onClick={() => onViewChange("patient")}>Patient View</a></li>
                <li><a onClick={() => onViewChange("task")}>Task View</a></li>
            </ul>
       </div>
    )
}
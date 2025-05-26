"use client";
// src/components/worklist/WorklistToolbar.tsx
import React from "react";

interface WorklistToolbarProps {
  searchTerm: string;
  onSearch: (term: string) => void;
  onNewWorklist?: () => void;
  onEnrichData?: () => void;
}

export default function WorklistToolbar({
  searchTerm,
  onSearch,
  onNewWorklist,
  onEnrichData,
}: WorklistToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <h1 className="text-2xl font-bold flex-1">New Patient Worklist</h1>
      <input
        type="text"
        placeholder="Filter by keyword or by field"
        className="input input-bordered input-sm w-64"
        value={searchTerm}
        onChange={(e) => onSearch(e.target.value)}
      />
        {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
      <button className="btn btn-primary btn-sm" onClick={onNewWorklist}>
        + New worklist
      </button>
      {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
      <button className="btn btn-outline btn-sm" onClick={onEnrichData}>
        Enrich data
      </button>
      <div className="dropdown dropdown-end">
        {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
        <button className="btn btn-ghost btn-sm">Actions ▾</button>
        {/* Add dropdown menu here if needed */}
      </div>
    </div>
  );
}
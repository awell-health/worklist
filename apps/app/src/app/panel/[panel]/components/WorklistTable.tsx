"use client";

import { isMatchingFhirPathCondition } from "@/lib/fhir-path";
import type { ColumnDefinition } from "@/types/worklist";
import { closestCenter, DndContext, type DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import { Loader2, Plus } from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../components/ui/table";
import { SortableColumnHeader } from "./WorklistSortableColumnHeader";
import WorklistTableRow from "./WorklistTableRow";

interface TableFilter {
  key: string;
  value: string;
}

interface WorklistTableProps {
  isLoading: boolean;
  tableContainerRef?: React.RefObject<HTMLDivElement>;
  selectedRows: number[];
  toggleSelectAll: () => void;
  worklistColumns: ColumnDefinition[];
  onAddColumn: () => void;
  isBlank: boolean;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  tableData: Record<string, any>[];
  handlePDFClick: () => void;
  handleTaskClick: () => void;
  handleDragEnd?: (event: DragEndEvent) => void;
  handleRowHover: () => void;
  toggleSelectRow: (row: number) => void;
  setIsAddingIngestionSource: (open: boolean) => void;
  handleAssigneeClick: (taskId: string) => void;
  onColumnUpdate: (updates: Partial<ColumnDefinition>) => void;
  currentView: string;
  filters: TableFilter[];
  onFiltersChange: (filters: TableFilter[]) => void;
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export default function WorklistTable({ 
  isLoading, 
  tableContainerRef,
  selectedRows, 
  toggleSelectAll, 
  worklistColumns, 
  onAddColumn,
  isBlank, 
  tableData, 
  handlePDFClick, 
  handleTaskClick, 
  handleRowHover, 
  toggleSelectRow, 
  setIsAddingIngestionSource, 
  handleAssigneeClick,
  onColumnUpdate,
  currentView, 
  handleDragEnd,
  filters,
  onFiltersChange }: WorklistTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  console.log("data", tableData);
  
  const filteredAndSortedData = useMemo(() => {
    // First apply filters
    let filteredData = tableData;
    if (filters && filters.length > 0) {
      console.log("filters", filters);
      filteredData = tableData.filter(row => {
        return filters.every(filter => {
          // TODO this is very basic, we need to support more complex FHIRPath expressions
          const fhirPath = `${filter.key}.lower() = '${filter.value.toLowerCase()}'`;
          return isMatchingFhirPathCondition(row, fhirPath);
        });
      });
    }
    
    // Then apply sorting
    if (!sortConfig) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' 
          ? aValue - bValue
          : bValue - aValue;
      }
      
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortConfig.direction === 'asc'
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }
      
      return sortConfig.direction === 'asc'
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  }, [tableData, sortConfig, filters]);

  const handleSort = (columnKey: string) => {
    setSortConfig(current => {
      if (!current || current.key !== columnKey) {
        return { key: columnKey, direction: 'asc' };
      }
      if (current.direction === 'asc') {
        return { key: columnKey, direction: 'desc' };
      }
      return null;
    });
  };

  const handleFilter = (columnKey: string, value: string) => {
    const newFilters = filters ? filters.filter(f => f.key !== columnKey) : [];
    if (value) {
      newFilters.push({ key: columnKey, value });
    }
    onFiltersChange(newFilters);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor),
  )

  return (
    <div className="flex-grow flex flex-col">
      {isLoading ? (
        <div className="h-full flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-2" />
            <p className="text-sm text-gray-500 font-normal">Building your worklist...</p>
          </div>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToHorizontalAxis]}
        >

          <div className="flex-grow overflow-auto" ref={tableContainerRef}>
            <Table className="w-full border-collapse">
              <TableHeader className="bg-white sticky top-0 z-10">
                <TableRow className="border-b border-gray-200">
                  <TableHead className="w-10 p-0 pl-3">
                    <div className="h-10 flex items-center justify-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300"
                        checked={selectedRows.length > 0 && selectedRows.length === tableData.length}
                        onChange={toggleSelectAll}
                      />
                    </div>
                  </TableHead>
                  {worklistColumns.map((column, index) => (
                    <SortableColumnHeader 
                      key={column.id} 
                      column={column} 
                      index={index}
                      sortConfig={sortConfig}
                      onSort={() => handleSort(column.key)}
                      filterValue={filters ? filters.find(f => f.key === column.key)?.value || '' : ''}
                      onFilter={(value) => handleFilter(column.key, value)}
                      onColumnUpdate={onColumnUpdate}
                    />
                  ))}
                  <TableHead className="text-xs font-normal text-gray-700 p-2">
                    <div className="flex items-center">
                      {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
                      <button
                        className="btn text-xs font-normal h-8 px-2 flex items-center text-gray-700"
                        onClick={() => onAddColumn()}
                      >
                        <Plus className="mr-1 h-3 w-3" /> Add column
                      </button>

                      {isBlank && (
                        <>
                          <div className="mx-3 text-xs font-normal text-neutral-500">or</div>
                          {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
                          <button
                            className="btn text-xs font-normal h-8 px-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-800 border border-yellow-200 flex items-center"
                          >
                            Generate worklist
                          </button>
                        </>
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="p-0 w-full" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedData.length > 0 ? (
                  filteredAndSortedData.map((row, rowIndex) => (
                    <WorklistTableRow
                      // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                      key={rowIndex}
                      row={row}
                      rowIndex={rowIndex}
                      handleAssigneeClick={() => handleAssigneeClick(row["id"])}
                      columns={worklistColumns}
                      selectedRows={selectedRows}
                      toggleSelectRow={toggleSelectRow}
                      handlePDFClick={handlePDFClick}
                      handleTaskClick={handleTaskClick}
                      currentView={currentView}
                      onRowHover={handleRowHover}
                    />
                  ))
                ) : (
                  <TableRow className="border-b border-gray-200 hover:bg-gray-50">
                    <TableCell className="w-10 p-0 pl-3">
                      <div className="h-10 flex items-center justify-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300"
                          checked={false}
                          onChange={() => { }}
                          disabled
                        />
                      </div>
                    </TableCell>
                    {worklistColumns.map((column, index) => (
                      <TableCell
                        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                        key={index}
                        className="py-1 px-2 border-r border-gray-200 overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px]"
                      />
                    ))}
                    <TableCell className="p-2" colSpan={2} />
                  </TableRow>
                )}
                {/* Always add the "Add data" row at the bottom */}
                <TableRow className="border-b border-gray-200 hover:bg-gray-50">
                  <TableCell className="w-10 p-0 pl-3">
                    <div className="h-10 flex items-center justify-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300"
                        checked={false}
                        onChange={() => { }}
                        disabled
                      />
                    </div>
                  </TableCell>
                  {worklistColumns.map((column, index) => (
                    <TableCell
                      // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                      key={index}
                      className="py-1 px-2 border-r border-gray-200 overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px]"
                    >
                      {index === 0 ? (
                        <button
                          className="btn btn-ghost btn-sm text-xs font-normal h-6 px-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                          onClick={() => setIsAddingIngestionSource(true)}
                        >
                          + Add data
                        </button>
                      ) : null}
                    </TableCell>
                  ))}
                  <TableCell className="p-2" colSpan={2} />
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </DndContext>
      )}
    </div>
  )
}
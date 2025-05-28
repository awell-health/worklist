"use client";
import { Loader2, Plus } from "lucide-react";
import { TableHeader, TableBody, TableRow, TableCell, TableHead } from "./ui/table";
import type React from "react";
import { Table } from "./ui/table";
import WorklistTableRowWithHover from "./WorklistTableRowWithHover";
import { SortableColumnHeader } from "./WorklistSortableColumnHeader";
import type { ColumnDefinition } from "@/types/worklist";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import { closestCenter, type DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { DndContext } from "@dnd-kit/core";

interface WorklistTableProps {
  isLoading: boolean;
  tableContainerRef?: React.RefObject<HTMLDivElement>;
  selectedRows: number[];
  toggleSelectAll: () => void;
  worklistDefinition: WorklistDefinition;
  openSidebarWithMode: (mode: string) => void;
  isBlank: boolean;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  tableData: Record<string, any>[];
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  getCurrentViewData: () => Record<string, any>[];
  handlePDFClick: () => void;
  handleTaskClick: () => void;
  handleDragEnd?: (event: DragEndEvent) => void;
  handleRowHover: () => void;
  toggleSelectRow: (row: number) => void;
  setIsAddingIngestionSource: (open: boolean) => void;
  currentView: string;
}

interface WorklistDefinition {
  title: string;
  columns: ColumnDefinition[];
}

export default function WorklistTable({ 
  isLoading, 
  tableContainerRef,
  selectedRows, 
  toggleSelectAll, 
  worklistDefinition, 
  openSidebarWithMode, 
  isBlank, 
  tableData, 
  getCurrentViewData, 
  handlePDFClick, 
  handleTaskClick, 
  handleRowHover, 
  toggleSelectRow, 
  setIsAddingIngestionSource, 
  currentView, 
  handleDragEnd }: WorklistTableProps) {
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
                  {worklistDefinition.columns.map((column, index) => (
                    <SortableColumnHeader key={column.id} column={column} index={index} />
                  ))}
                  <TableHead className="text-xs font-normal text-gray-700 p-2">
                    <div className="flex items-center">
                      {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
                      <button
                        className="btn text-xs font-normal h-8 px-2 flex items-center text-gray-700"
                        onClick={() => openSidebarWithMode("ai-conversation")}
                      >
                        <Plus className="mr-1 h-3 w-3" /> Add column
                      </button>

                      {isBlank && (
                        <>
                          <div className="mx-3 text-xs font-normal text-neutral-500">or</div>
                          {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
                          <button
                            className="btn text-xs font-normal h-8 px-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-800 border border-yellow-200 flex items-center"
                            onClick={() => openSidebarWithMode("generate-worklist")}
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
                {tableData.length > 0 ? (
                  tableData.map((row, rowIndex) => (
                    <WorklistTableRowWithHover
                      // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                      key={rowIndex}
                      row={row}
                      rowIndex={rowIndex}
                      columns={worklistDefinition.columns}
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
                    {worklistDefinition.columns.map((column, index) => (
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
                  {worklistDefinition.columns.map((column, index) => (
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
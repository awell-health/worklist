"use client";
import { Loader2, Plus } from "lucide-react";
import { TableHeader, TableBody, TableRow, TableCell, TableHead } from "./ui/table";
import React from "react";
import { Table } from "./ui/table";

interface WorklistTableProps {
    isLoading: boolean;
    tableContainerRef: React.RefObject<HTMLDivElement>;
    selectedRows: any[];
    toggleSelectAll: () => void;
    columnsWithIds: any[];
    worklistDefinition: WorklistDefinition;
    openSidebarWithMode: (mode: string) => void;
    isBlank: boolean;
    tableData: any[];
    getCurrentViewData: () => any[];
    handlePDFClick: () => void;
    handleTaskClick: () => void;
    handleRowHover: () => void;
    toggleSelectRow: (row: any) => void;
    setIsAddSourceModalOpen: (open: boolean) => void;
    currentView: string;
}

interface WorklistDefinition {
    title: string;
    columns: any[];
}

export default function WorklistTable({ isLoading, tableContainerRef, selectedRows, toggleSelectAll, columnsWithIds, worklistDefinition, openSidebarWithMode, isBlank, tableData, getCurrentViewData, handlePDFClick, handleTaskClick, handleRowHover, toggleSelectRow, setIsAddSourceModalOpen, currentView }: WorklistTableProps) {
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
                    <SortableContext items={columnsWithIds} strategy={horizontalListSortingStrategy}>
                      {columnsWithIds.map((column, index) => (
                        <SortableColumnHeader key={column.id} column={column} index={index} />
                      ))}
                    </SortableContext>
                    <TableHead className="text-xs font-normal text-gray-700 p-2">
                      <div className="flex items-center">
                        <button
                          className="btn text-xs font-normal h-8 px-2 flex items-center text-gray-700"
                          onClick={() => openSidebarWithMode("add-enrichment")}
                        >
                          <Plus className="mr-1 h-3 w-3" /> Add column
                        </button>

                        {isBlank && (
                          <>
                            <div className="mx-3 text-xs font-normal text-neutral-500">or</div>
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
                    <TableHead className="p-0 w-full"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getCurrentViewData().length > 0 ? (
                    getCurrentViewData().map((row, rowIndex) => (
                      <TableRowWithHover
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
                            onChange={() => {}}
                            disabled
                          />
                        </div>
                      </TableCell>
                      {worklistDefinition.columns.map((column, index) => (
                        <TableCell
                          key={index}
                          className="py-1 px-2 border-r border-gray-200 overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px]"
                        >
                          {index === 0 ? (
                            <button
                              className="btn text-xs font-normal h-6 px-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                              onClick={() => setIsAddSourceModalOpen(true)}
                            >
                              + Add data
                            </button>
                          ) : null}
                        </TableCell>
                      ))}
                      <TableCell className="p-2" colSpan={2}></TableCell>
                    </TableRow>
                  )}
                  {/* Always add an "Add data" row at the bottom if there's data */}
                  {tableData.length > 0 && (
                    <TableRow className="border-b border-gray-200 hover:bg-gray-50">
                      <TableCell className="w-10 p-0 pl-3">
                        <div className="h-10 flex items-center justify-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300"
                            checked={false}
                            onChange={() => {}}
                            disabled
                          />
                        </div>
                      </TableCell>
                      {worklistDefinition.columns.map((column, index) => (
                        <TableCell
                          key={index}
                          className="py-1 px-2 border-r border-gray-200 overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px]"
                        >
                          {index === 0 ? (
                            <button
                              className="btn text-xs font-normal h-6 px-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                              onClick={() => setIsAddSourceModalOpen(true)}
                            >
                              + Add data
                            </button>
                          ) : null}
                        </TableCell>
                      ))}
                      <TableCell className="p-2" colSpan={2}></TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
        )}
      </div>
   )
}
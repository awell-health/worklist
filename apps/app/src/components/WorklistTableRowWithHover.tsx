"use client"

import { useRef } from "react"
import { TableRow, TableCell } from "./ui/table"
import { File, CheckSquare } from "lucide-react"
import { cn } from "../lib/utils"
import { formatTasksForPatientView, renderTaskStatus } from "@/lib/task-utils"
import type { ColumnDefinition } from "@/types/worklist"

interface WorklistTableRowWithHoverProps {
    rowIndex: number;
    onRowHover: (rowIndex: number, isHovered: boolean, rect: DOMRect | null) => void;
    selectedRows: number[];
    toggleSelectRow: (rowIndex: number) => void;
    columns: ColumnDefinition[];
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    row: Record<string, any>;
    handlePDFClick: (pdfUrl: string, patientName: string) => void;
    handleTaskClick: (task: string, taskStatus: string, patientName: string) => void;
    currentView: string;
}

export default function WorklistTableRowWithHover({
    rowIndex,
    onRowHover,
    selectedRows,
    toggleSelectRow,
    columns,
    handlePDFClick,
    handleTaskClick,
    currentView,
    row
}: WorklistTableRowWithHoverProps) {

    const rowRef = useRef<HTMLTableRowElement>(null)

    // Handle hover events
    const handleMouseEnter = () => {
        if (rowRef.current) {
            onRowHover(rowIndex, true, rowRef.current.getBoundingClientRect())
        }
    }

    const handleMouseLeave = () => {
        onRowHover(rowIndex, false, null)
    }

    return (
        <TableRow
            ref={rowRef}
            className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            data-row-id={rowIndex}
        >
            <TableCell className="w-10 p-0 pl-3">
                <div className="h-10 flex items-center justify-center">
                    <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300"
                        checked={selectedRows.includes(rowIndex)}
                        onChange={() => toggleSelectRow(rowIndex)}
                    />
                </div>
            </TableCell>
            {columns.map((column, colIndex) => (
                <TableCell
                    key={`${rowIndex}-${// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                        colIndex}`}
                    className={cn("py-1 px-2 border-r border-gray-200 text-xs max-w-[200px]", "truncate")}
                    title={typeof row[column.name] === "string" ? row[column.name] : ""}
                >
                    {column.name === "Discharge Summary" && row[column.name] ? (
                        // biome-ignore lint/a11y/useButtonType: <explanation>
                        <button
                            className="text-xs h-6 px-2 text-blue-500 hover:bg-blue-50 flex items-center"
                            onClick={() => handlePDFClick(row[column.name], row["Patient Name"] || "Patient")}
                        >
                            <File className="h-3 w-3 mr-1" />
                            {row[column.name]}
                        </button>
                    ) : column.name === "Task" && currentView === "Patient view" && row._raw?.tasks ? (
                        formatTasksForPatientView(row._raw.tasks, row["Patient Name"], handleTaskClick)
                    ) : column.name === "Task Status" && row["Task Status"] ? (
                        renderTaskStatus(row["Task Status"], row.Task, row["Patient Name"], handleTaskClick)
                    ) : column.name === "Task" ? (
                        // biome-ignore lint/a11y/useButtonType: <explanation>
                        <button
                            className="text-xs h-6 px-2 text-blue-500 hover:bg-blue-50 flex items-center justify-start w-full"
                            onClick={() =>
                                handleTaskClick(row[column.name] || "", row["Task Status"] || "", row["Patient Name"] || "")
                            }
                        >
                            <CheckSquare className="h-3 w-3 mr-1" />
                            <span className="truncate">{row[column.key] || ""}</span>
                        </button>
                    ) : (
                        <div className="truncate">{row[column.key] || ""}</div>
                    )}
                </TableCell>
            ))}
            <TableCell className="p-0" colSpan={2} />
        </TableRow>
    )
}
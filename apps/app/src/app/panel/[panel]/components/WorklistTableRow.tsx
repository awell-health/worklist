"use client"

import { TaskDetails } from "@/app/panel/[panel]/components/TaskDetails"
import { useDrawer } from "@/contexts/DrawerContext"
import { WorklistPatient, WorklistTask } from "@/hooks/use-medplum-store"
import { getNestedValue } from "@/lib/fhir-path"
import { formatTasksForPatientView, renderTaskStatus } from "@/lib/task-utils"
import type { ColumnDefinition } from "@/types/worklist"
import { CheckSquare, File } from "lucide-react"
import { useRef } from "react"
import { TableCell, TableRow } from "../../../../components/ui/table"
import { cn } from "../../../../lib/utils"
import { PatientDetails } from "./PatientDetails"

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
    handleAssigneeClick: () => void;
    currentView: string;
}

export default function WorklistTableRow({
    rowIndex,
    onRowHover,
    selectedRows,
    toggleSelectRow,
    columns,
    handlePDFClick,
    handleTaskClick,
    handleAssigneeClick,
    currentView,
    row
}: WorklistTableRowWithHoverProps) {
    const rowRef = useRef<HTMLTableRowElement>(null)
    const { openDrawer } = useDrawer()

    const handleRowClick = () => {
        console.log(row)
        if (row.resourceType === "Task") {
            console.log('patientRow', row)
            openDrawer(
                <TaskDetails 
                    taskData={row as WorklistTask} 
                />,
                row.description || "Task Details"
            )
        } else if (row.resourceType === "Patient") {
            console.log('patientRow', row)
            openDrawer(
                <PatientDetails 
                    patient={row as WorklistPatient} 
                />,
                `${row.name} - Patient Details`
            )
        }
    }

    // Handle hover events
    const handleMouseEnter = () => {
        if (rowRef.current) {
            onRowHover(rowIndex, true, rowRef.current.getBoundingClientRect())
        }
    }

    const handleMouseLeave = () => {
        onRowHover(rowIndex, false, null)
    }

    const renderColumnValue = (column: ColumnDefinition, colIndex: number) => {
        const columnValue = getNestedValue(row, column.key);
        return (
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
        ) : column.type === "tasks" && currentView === "Patient view" && row._raw?.tasks ? (
            formatTasksForPatientView(row._raw.tasks, row["Patient Name"], handleTaskClick)
        ) : column.name === "Task Status" && row["Task Status"] ? (
            renderTaskStatus(row["Task Status"], row.Task, row["Patient Name"], handleTaskClick)
        ) : column.type === "tasks" ? (
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
        ) : column.type === "array" ? (
            <div className="flex flex-wrap gap-1">
                {Array.isArray(columnValue) ? (
                    columnValue.map((item: any, index: number) => (
                        <span 
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                        >
                            {typeof item === 'object' ? Object.values(item).join(', ') : String(item)}
                        </span>
                    ))
                ) : (
                    <span className="text-gray-500">-</span>
                )}
            </div>
        ) : column.type === "assignee" ? (
            <div className="flex items-center">
                {columnValue ? (
                    <span className="text-sm text-gray-700">{columnValue}</span>
                ) : (
                    <button
                        type="button"
                        className="text-xs h-6 px-2 text-blue-500 hover:bg-blue-50 flex items-center rounded border border-blue-200"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleAssigneeClick();
                        }}
                    >
                        Assign to me
                    </button>
                )}
            </div>
        ) : (
            <div className="truncate">
                {(() => {
                    if (columnValue === null || columnValue === undefined) return "";
                    if (typeof columnValue === "string") return columnValue;
                    if (Array.isArray(columnValue)) return columnValue.join(", ");
                    if (typeof columnValue === "object") return JSON.stringify(columnValue);
                    return String(columnValue);
                    })()}
                </div>
            )}
        </TableCell>    
    )
    }

    return (
        <TableRow
            ref={rowRef}
            className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleRowClick}
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
            {columns.map((column, colIndex) => renderColumnValue(column, colIndex))}
            <TableCell className="p-0" colSpan={2} />
        </TableRow>
    )
}
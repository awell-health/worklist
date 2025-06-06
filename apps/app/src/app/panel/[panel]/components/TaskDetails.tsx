"use client"

import { useEffect, useState } from "react"
import { useMedplumStore, WorklistTask } from '@/hooks/use-medplum-store'

type TaskContentProps = {
  taskData: WorklistTask
}

export function TaskDetails({ taskData }: TaskContentProps) {
  const [activeTab, setActiveTab] = useState<"context" | "comments">("context");
  const [newComment, setNewComment] = useState("")
  const [task, setTask] = useState(taskData)
  const [connectors, setConnectors] = useState<{ connectorName: string, url: string }[]>([])

  useEffect(() => {
    setTask(taskData)
    setConnectors([{
      connectorName: "Awell",
      url: "https://care.development.awellhealth.com/pathway/vV7xHQ5qakpI/activity-feed?activityId=BDtAEU7AXaPxWkXewRvnM",
    }, {
      connectorName: "Connector 2",
      url: "https://example.com/connector2",
    }])
  }, [taskData])

  const { addNotesToTask } = useMedplumStore()

  const handleSubmitComment = async () => {
    if (newComment.trim() && taskData.id) {
      const task = await addNotesToTask(taskData.id, newComment.trim())
      setNewComment("")
      setTask({
        ...taskData,
        ...task,
      })
    }
  }

  return (
    <div className="flex-1 overflow-y-auto flex flex-col">
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-4" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("context")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "context"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Context
          </button>
          <button
            onClick={() => setActiveTab("comments")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "comments"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Comments
          </button>
        </nav>
      </div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col">
        {activeTab === "context" && (
          <div className="flex flex-col h-full">

              <>
                <h3 className="text-sm font-medium mb-2">Context</h3>
                <div className="w-full space-y-4">
                  {/* System Connectors Section */}
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs font-medium text-gray-500 mb-2">Available Connectors</p>
                    <div className="space-y-2">
                      {connectors.length > 0 ? (
                        connectors.map((connector, index) => (
                          <div key={index} className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                            <div>
                              <p className="text-xs font-medium text-gray-700">
                                {connector.connectorName}
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                window.open(connector.url, '_blank')
                              }}
                              className="text-blue-500 hover:text-blue-600 text-xs cursor-pointer"
                            >
                              Open
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500">No connectors available</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-xs font-medium text-gray-500">Status</p>
                      <p className="text-sm">{taskData.status}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-xs font-medium text-gray-500">Intent</p>
                      <p className="text-sm">{taskData.intent}</p>
                    </div>
                    {taskData.priority && (
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-xs font-medium text-gray-500">Priority</p>
                        <p className="text-sm">{taskData.priority}</p>
                      </div>
                    )}
                    {taskData.authoredOn && (
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-xs font-medium text-gray-500">Authored On</p>
                        <p className="text-sm">{new Date(taskData.authoredOn).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>

                  {taskData.executionPeriod && (
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-xs font-medium text-gray-500 mb-2">Execution Period</p>
                      <div className="grid grid-cols-2 gap-4">
                        {taskData.executionPeriod.start && (
                          <div>
                            <p className="text-xs text-gray-500">Start</p>
                            <p className="text-sm">{new Date(taskData.executionPeriod.start).toLocaleDateString()}</p>
                          </div>
                        )}
                        {taskData.executionPeriod.end && (
                          <div>
                            <p className="text-xs text-gray-500">End</p>
                            <p className="text-sm">{new Date(taskData.executionPeriod.end).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {taskData.input && taskData.input.length > 0 && (
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-xs font-medium text-gray-500 mb-2">Additional Information</p>
                      <div className="space-y-2">
                        {taskData.input.map((input: any, index: number) => (
                          <div key={index} className="border-b border-gray-200 pb-2 last:border-0">
                            <p className="text-xs text-gray-500">
                              {input.type?.coding?.[0]?.display || 'Unknown Field'}
                            </p>
                            <p className="text-sm">{input.valueString}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
          </div>
        )}

        {activeTab === "comments" && (
          <div className="flex flex-col items-center justify-center">
            <h3 className="text-sm font-medium mb-2">Comments</h3>
            {task.note && task.note.length > 0 && (
                <div className="bg-gray-50 p-3 rounded w-full mb-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">Notes</p>
                  <div className="space-y-4">
                    {task.note.map((note: any, index: number) => (
                      <div key={index} className="bg-white p-3 rounded-md shadow-sm">
                        <p className="text-sm text-gray-800 mb-1">{note.text}</p>
                        <p className="text-xs text-gray-500">
                          {note.time ? new Date(note.time).toLocaleString() : 'No timestamp'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            
            <div className="w-full space-y-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full p-3 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
              <button
                onClick={handleSubmitComment}
                disabled={!newComment.trim()}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Add Comment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

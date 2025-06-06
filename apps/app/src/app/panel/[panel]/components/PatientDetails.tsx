"use client"
import { WorklistPatient, WorklistTask } from '@/hooks/use-medplum-store'
import { useState } from 'react'

type PatientDetailsProps = {
  patient: WorklistPatient
}

const getFieldValue = (field: any): string => {
  if (!field) return '';
  if (typeof field === 'string') return field;
  if (Array.isArray(field)) {
    return field.map(item => getFieldValue(item)).filter(Boolean).join(', ');
  }
  if (typeof field === 'object' && 'value' in field) return field.value;
  return String(field);
}

const formatAddress = (address: any): string => {
  if (!address) return '';
  if (typeof address === 'string') return address;
  if (Array.isArray(address)) {
    return address.map(addr => formatAddress(addr)).filter(Boolean).join(', ');
  }
  if (typeof address === 'object') {
    const parts = [];
    if (address.line) parts.push(Array.isArray(address.line) ? address.line.join(', ') : address.line);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.postalCode) parts.push(address.postalCode);
    return parts.filter(Boolean).join(', ');
  }
  return String(address);
}

const formatTelecom = (telecom: any): string => {
  if (!telecom) return '';
  if (typeof telecom === 'string') return telecom;
  if (Array.isArray(telecom)) {
    return telecom.map(t => {
      if (typeof t === 'string') return t;
      if (typeof t === 'object' && 'value' in t) return t.value;
      return '';
    }).filter(Boolean).join(', ');
  }
  if (typeof telecom === 'object' && 'value' in telecom) return telecom.value;
  return String(telecom);
}

export function PatientDetails({ patient }: PatientDetailsProps) {
  const [activeTab, setActiveTab] = useState<"context" | "tasks">("context");

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
            onClick={() => setActiveTab("tasks")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "tasks"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Tasks
          </button>
        </nav>
      </div>

      <div className="p-4">
        {activeTab === "context" && (
          <div className="flex flex-col h-full">
            <div className="w-full space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs font-medium text-gray-500">Name</p>
                  <p className="text-sm">
                    {getFieldValue(patient.name)}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs font-medium text-gray-500">Gender</p>
                  <p className="text-sm">{getFieldValue(patient.gender)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs font-medium text-gray-500">Birth Date</p>
                  <p className="text-sm">{getFieldValue(patient.birthDate)}</p>
                </div>
                {patient.telecom && (
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs font-medium text-gray-500">Contact</p>
                    <p className="text-sm">{formatTelecom(patient.telecom)}</p>
                  </div>
                )}
              </div>

              {patient.address && (
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs font-medium text-gray-500 mb-2">Address</p>
                  <p className="text-sm">
                    {formatAddress(patient.address)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "tasks" && (
          <div className="flex flex-col h-full">
            <div className="w-full space-y-4">
              {patient.tasks && patient.tasks.length > 0 ? (
                patient.tasks.map((task: WorklistTask, index: number) => (
                  <div key={index} className="bg-gray-50 p-3 rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {getFieldValue(task.description)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Status: {getFieldValue(task.status)}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded ${
                        getFieldValue(task.priority) === 'stat' ? 'bg-red-100 text-red-800' :
                        getFieldValue(task.priority) === 'urgent' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {getFieldValue(task.priority) || 'routine'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No tasks available for this patient</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

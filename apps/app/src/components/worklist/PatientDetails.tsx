"use client";
// src/components/worklist/PatientDetails.tsx
import React from 'react'
import type { Patient } from '@/types/worklist'

interface PatientDetailsProps {
  patient: Patient
}

export default function PatientDetails({ patient }: PatientDetailsProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-base-content/70">
          Patient Name
        </h3>
        <p className="text-lg">{patient.name}</p>
      </div>
      <div>
        <h3 className="text-sm font-medium text-base-content/70">
          Date of Birth
        </h3>
        <p className="text-lg">{patient.dateOfBirth}</p>
      </div>
      <div>
        <h3 className="text-sm font-medium text-base-content/70">Gender</h3>
        <p className="text-lg">{patient.gender}</p>
      </div>
      <div>
        <h3 className="text-sm font-medium text-base-content/70">Tasks</h3>
        <div className="flex flex-wrap gap-2 mt-2">
          {patient.tasks?.map((task, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <span key={index} className="badge badge-primary">
              {task}
            </span>
          ))}
        </div>
      </div>
      <div className="pt-4">
        {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
        <button className="btn btn-primary w-full">Edit Patient</button>
      </div>
    </div>
  )
}

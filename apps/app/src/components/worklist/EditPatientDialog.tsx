// src/components/worklist/EditPatientDialog.tsx
'use client';

import { useState } from 'react';
import type { Patient } from '@/types/worklist';

interface EditPatientDialogProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
  onSave: (patient: Patient) => void;
}

export default function EditPatientDialog({ 
  patient, 
  isOpen, 
  onClose, 
  onSave 
}: EditPatientDialogProps) {
  const [editedPatient, setEditedPatient] = useState<Patient>(patient);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedPatient);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Edit Patient</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-control gap-4">
            <div>
              {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
              <label className="label">
                <span className="label-text">Name</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={editedPatient.name}
                onChange={(e) => setEditedPatient({ 
                  ...editedPatient, 
                  name: e.target.value 
                })}
              />
            </div>

            <div>
              {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
              <label className="label">
                <span className="label-text">Date of Birth</span>
              </label>
              <input
                type="date"
                className="input input-bordered w-full"
                value={editedPatient.dateOfBirth}
                onChange={(e) => setEditedPatient({ 
                  ...editedPatient, 
                  dateOfBirth: e.target.value 
                })}
              />
            </div>

            <div>
              {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
              <label className="label">
                <span className="label-text">Gender</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={editedPatient.gender}
                onChange={(e) => setEditedPatient({ 
                  ...editedPatient, 
                  gender: e.target.value 
                })}
              >
                <option value="">Select gender...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
              <label className="label">
                <span className="label-text">Tasks (comma-separated)</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={editedPatient.tasks?.join(', ')}
                onChange={(e) => setEditedPatient({ 
                  ...editedPatient, 
                  tasks: e.target.value.split(',').map(t => t.trim()) 
                })}
              />
            </div>
          </div>

          <div className="modal-action">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
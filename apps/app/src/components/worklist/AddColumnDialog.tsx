// src/components/worklist/AddColumnDialog.tsx
'use client';

import { useState } from 'react';
import type { Column } from '@/types/worklist';

interface AddColumnDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (column: Column) => void;
}

export default function AddColumnDialog({ isOpen, onClose, onAdd }: AddColumnDialogProps) {
  const [columnData, setColumnData] = useState<Partial<Column>>({
    type: 'text'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (columnData.key && columnData.label) {
      onAdd(columnData as Column);
      onClose();
      setColumnData({ type: 'text' });
    }
  };

  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Add New Column</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-control gap-4">
            <div>
              {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
              <label className="label">
                <span className="label-text">Column Key</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={columnData.key || ''}
                onChange={(e) => setColumnData({ ...columnData, key: e.target.value })}
                placeholder="e.g., patientId"
              />
            </div>
            
            <div>
              {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
              <label className="label">
                <span className="label-text">Column Label</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={columnData.label || ''}
                onChange={(e) => setColumnData({ ...columnData, label: e.target.value })}
                placeholder="e.g., Patient ID"
              />
            </div>
            
            <div>
              {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
              <label className="label">
                <span className="label-text">Column Type</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={columnData.type}
                onChange={(e) => setColumnData({ 
                  ...columnData, 
                  type: e.target.value as Column['type']
                })}
              >
                <option value="text">Text</option>
                <option value="date">Date</option>
                <option value="select">Select</option>
                <option value="tasks">Tasks</option>
              </select>
            </div>

            {columnData.type === 'select' && (
              <div>
                {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
                <label className="label">
                  <span className="label-text">Options (comma-separated)</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={columnData.options?.join(',') || ''}
                  onChange={(e) => setColumnData({ 
                    ...columnData, 
                    options: e.target.value.split(',').map(o => o.trim())
                  })}
                  placeholder="Option1, Option2, Option3"
                />
              </div>
            )}
          </div>

          <div className="modal-action">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Column
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
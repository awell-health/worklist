// src/components/worklist/ConfirmDialog.tsx
interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
  }
  
  export default function ConfirmDialog({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
  }: ConfirmDialogProps) {
    if (!isOpen) return null;
  
    return (
      <dialog className="modal modal-open">
        <div className="modal-box">
          <h3 className="font-bold text-lg">{title}</h3>
          <p className="py-4">{message}</p>
          <div className="modal-action">
            {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
            <button className="btn" onClick={onCancel}>
              Cancel
            </button>
            {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
            <button className="btn btn-error" onClick={onConfirm}>
              Confirm
            </button>
          </div>
        </div>
      </dialog>
    );
  }
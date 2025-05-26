// src/components/worklist/ActionMenu.tsx
interface ActionMenuProps {
    onEdit?: () => void;
    onDelete?: () => void;
    onViewDetails?: () => void;
  }
  
  export default function ActionMenu({ onEdit, onDelete, onViewDetails }: ActionMenuProps) {
    return (
      <div className="dropdown dropdown-end">
        {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
        <button tabIndex={0} className="btn btn-ghost btn-xs">⋮</button>
        <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
          {onViewDetails && (
            <li>
              {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
              <button onClick={onViewDetails}>View Details</button>
            </li>
          )}
          {onEdit && (
            <li>
              {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
              <button onClick={onEdit}>Edit</button>
            </li>
          )}
          {onDelete && (
            <li>
              {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
              <button onClick={onDelete} className="text-error">
                Delete
              </button>
            </li>
          )}
        </ul>
      </div>
    );
  }
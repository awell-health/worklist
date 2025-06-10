import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PanelDefinition } from '@/types/worklist';
import { ChevronRight, LayoutGrid, Plus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

type PanelsTableProps = {
  panels: PanelDefinition[];
  onDeletePanel: (panelId: string) => void;
  onDeleteView: (panelId: string, viewId: string) => void;
};

const PanelsTable: React.FC<PanelsTableProps> = ({ panels, onDeletePanel, onDeleteView }) => {
  const router = useRouter();
  // For now, all panels are expanded by default
  return (
    <div className={`mb-8 ml-12`}>
     

      <div className="flex justify-between items-center mb-4 max-w-3xl">
        <h2 className="text-base font-medium">Panels</h2>
        <div className="flex gap-2">
          <button
            className="btn btn-sm bg-yellow-50 hover:bg-yellow-100 text-yellow-800 border border-yellow-200 text-xs"
            onClick={() => router.push('/panel/default')}
          >
            <Plus className="h-3 w-3 mr-1" />
            Create new Panel
          </button>
        </div>
      </div>

      <div className="border border-neutral-200 rounded-md overflow-hidden max-w-3xl">
        <div className="relative w-full overflow-auto">
          <table className="w-full">
            <TableHeader>
              <TableRow className="bg-neutral-50">
                <TableHead className="text-xs font-medium text-neutral-500 py-2">Name</TableHead>
                <TableHead className="text-xs font-medium text-neutral-500 py-2">Columns</TableHead>
                <TableHead className="text-xs font-medium text-neutral-500 py-2">Created</TableHead>
                <TableHead className="text-xs font-medium text-neutral-500 py-2 w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Panels and their views */}
              {panels.map((panel) => (
                <PanelRow key={panel.id} panel={panel} onDeletePanel={onDeletePanel} onDeleteView={onDeleteView} />
              ))}

              {panels.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-neutral-500 text-sm">
                    No panels yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </table>
        </div>
      </div>
    </div>
  );
};

const PanelRow: React.FC<{ panel: PanelDefinition,  onDeletePanel: (panelId: string) => void, onDeleteView: (panelId: string, viewId: string) => void }> = ({ panel, onDeletePanel, onDeleteView }) => {
  const { id, title, taskViewColumns, patientViewColumns, createdAt, views } = panel;
  const router = useRouter();
  return (
    <React.Fragment key={id}>
      <TableRow
        className="hover:bg-neutral-50 cursor-pointer"
        onClick={() => router.push(`/panel/${id}`)}
      >
        <TableCell className="text-xs py-2 font-medium">
          <div className="flex items-center">
            <LayoutGrid className="h-3 w-3 mr-2 text-yellow-800" />
            {title}
          </div>
        </TableCell>
        <TableCell className="text-xs py-2">{taskViewColumns.length + patientViewColumns.length}</TableCell>
        <TableCell className="text-xs py-2">
          {createdAt}
        </TableCell>
        <TableCell className="text-xs py-2 text-right">
          <button
            className="h-6 w-6 p-0 rounded-full hover:bg-neutral-100"
            onClick={(e) => {
              e.stopPropagation();
              onDeletePanel(id);
            }}
            aria-label="Remove from history"
          >
            <X className="h-3 w-3 text-neutral-400 hover:text-neutral-600" />
          </button>
        </TableCell>
      </TableRow>

      {views && views.map((view) => (
        <TableRow
          key={view.id}
            className="hover:bg-neutral-50 cursor-pointer"
            onClick={() => router.push(`/panel/${id}/view/${view.id}`)}
          >
            <TableCell className="text-xs py-2">
              <div className="flex items-center pl-6">
                <ChevronRight className="h-3 w-3 mr-2 text-neutral-400" />
                {view.title}
              </div>
            </TableCell>
            <TableCell className="text-xs py-2">{view.columns ? view.columns.length : view.taskViewColumns.length + view.patientViewColumns.length}</TableCell>
            <TableCell className="text-xs py-2">
              {view.createdAt}
            </TableCell>
            <TableCell className="text-xs py-2 text-right">
              <button
                className="h-6 w-6 p-0 rounded-full hover:bg-neutral-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteView(id, view.id);
                }}
                aria-label="Remove from history"
              >
                <X className="h-3 w-3 text-neutral-400 hover:text-neutral-600" />
              </button>
            </TableCell>
          </TableRow>
        ))}
    </React.Fragment>
  );
};

export default PanelsTable; 
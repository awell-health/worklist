"use client";

export const dynamic = "force-dynamic";

import { useState } from 'react';
import WorklistTable from '@/components/worklist/WorklistTable';
import WorklistToolbar from '@/components/worklist/WorklistToolbar';
import { initialColumns, initialData } from '@/utils/constants';
import type { Column, Patient } from '@/types/worklist';
// import { useDrawer } from '@/contexts/DrawerContext';
import PatientDetails from '@/components/worklist/PatientDetails';

export default function WorklistPage() {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [data, setData] = useState<Patient[]>(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  // const { openDrawer } = useDrawer();

  const filteredData = data.filter(row => 
    Object.values(row).some(value => 
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleRowClick = (row: Patient) => {
    // openDrawer(
    //   <PatientDetails patient={row} />,
    //   `Patient Details - ${row.name}`
    // );
  };

  return (
    <div className="container mx-auto p-4">
      <WorklistToolbar 
        onSearch={setSearchTerm}
        searchTerm={searchTerm}
      />
      <WorklistTable 
        columns={columns}
        data={filteredData}
        onAddRow={(row) => setData([...data, row])}
        onAddColumn={(col) => setColumns([...columns, col])}
        onRowClick={handleRowClick}
      />
    </div>
  );
}
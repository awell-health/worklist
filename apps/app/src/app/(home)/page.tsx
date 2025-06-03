"use client"

import { Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import PanelsTable from "./PanelsTable";
import TeamTable from "./TeamTable";

const panels = [
  {
    id: '1',
    title: 'New Worklist',
    createdAt: '19 days ago',
    columns: 9,
    views: [
      { id: 'v1', title: 'New Worklist', columns: 9, createdAt: '19 days ago' },
      { id: 'v2', title: 'New View', columns: 8, createdAt: '19 days ago' },
      { id: 'v3', title: 'New View', columns: 8, createdAt: '19 days ago' },
    ],
  },
  {
    id: '2',
    title: 'Another Panel',
    createdAt: '7 days ago',
    columns: 3,
    views: [],
  },
];

const users = [
  { id: '1', name: 'Thomas Vande Casteele', email: 'thomas@turtle.care', role: 'Builder', panels: 'All available panels' },
  { id: '2', name: 'Sanne Willekens', email: 'sanne@turtle.care', role: 'User', panels: '' },
];

const Home = () => {
  const router = useRouter();
  
  return (
    <div className={`flex min-h-screen ml-0 transition-all duration-300`}>
    <div className="flex-1">
      <div className="p-4">
        <div className="flex items-center mb-6">
            <button
              className="btn btn-ghost btn-sm fixed top-4 left-4 z-30 flex items-center justify-center"
            >
              <Menu className="h-4 w-4" />
            </button>

          <div className={`ml-12`}>
            <h1 className="text-xl font-medium">Welcome Thomas!</h1>
            <p className="text-sm text-gray-600">
              Quickly access your organization's Panels and manage your Team below.
            </p>
          </div>
        </div>

        <PanelsTable panels={panels} />
        <TeamTable users={users} />

      </div>
    </div>
  </div>
  );
};

export default Home; 
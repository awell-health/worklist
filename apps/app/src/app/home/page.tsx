import { Menu, Plus } from "lucide-react";

const panels = [
  {
    id: '1',
    name: 'New Worklist',
    created: '19 days ago',
    views: [
      { id: 'v1', name: 'New Worklist', columns: 9 },
      { id: 'v2', name: 'New View', columns: 8 },
      { id: 'v3', name: 'New View', columns: 8 },
    ],
  },
  {
    id: '2',
    name: 'Another Panel',
    created: '7 days ago',
    views: [],
  },
];

const users = [
  { id: '1', name: 'Thomas Vande Casteele', email: 'thomas@turtle.care', role: 'Builder', panels: 'All available panels' },
  { id: '2', name: 'Sanne Willekens', email: 'sanne@turtle.care', role: 'User', panels: '' },
];

const Home = () => {
  return (
    <div className={`flex min-h-screen ml-0 transition-all duration-300`}>

    <div className="flex-1">
      {/* Content container with adjusted positioning */}
      <div className="p-4">
        <div className="flex items-center mb-6">
            <button
              className="btn btn-ghost btn-sm fixed top-4 left-4 z-30 flex items-center justify-center"
            >
              <Menu className="h-4 w-4" />
            </button>


          {/* Welcome message - left aligned with the rest of the content */}
          <div className={`ml-12`}>
            <h1 className="text-xl font-medium">Welcome Thomas!</h1>
            <p className="text-sm text-gray-600">
              Quickly access your organization's Panels and manage your Team below.
            </p>
          </div>
        </div>

        {/* Panels section - left aligned with welcome message */}
        <div className={`mb-8 ml-12`}>
          <div className="flex justify-between items-center mb-4 max-w-3xl">
            <h2 className="text-base font-medium">Panels</h2>
            <button
              className="btn btn-sm  bg-yellow-50 hover:bg-yellow-100 text-yellow-800 border border-yellow-200 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Create new Panel
            </button>
          </div>

          <div className="border border-neutral-200 rounded-md overflow-hidden max-w-3xl">
          
          </div>
        </div>

        {/* Teams and users section - left aligned with welcome message */}
        <div className={`ml-12`}>
          <div className="flex justify-between items-center mb-4 max-w-3xl">
            <h2 className="text-base font-medium">Teams and users</h2>
            <button
              className="btn btn-sm bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add User
            </button>
          </div>
          <div className="border border-neutral-200 rounded-md overflow-hidden max-w-3xl">
           
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default Home; 
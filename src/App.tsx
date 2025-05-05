import { useState } from 'react';
import AdminDashboard from './components/Dashboard';
import UserDashboard from './components/UserDashboard';
import { Layout, User } from 'lucide-react';

function App() {
  const [view, setView] = useState<'admin' | 'user'>('user'); // Default to user view
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* View switcher (for demo purposes) */}
      <div className="bg-gray-800 text-white p-2 flex justify-center space-x-4">
        <button 
          className={`px-3 py-1 rounded-md flex items-center ${view === 'admin' ? 'bg-primary' : 'bg-gray-700'}`}
          onClick={() => setView('admin')}
        >
          <Layout size={16} className="mr-1" />
          Admin View
        </button>
        <button 
          className={`px-3 py-1 rounded-md flex items-center ${view === 'user' ? 'bg-primary' : 'bg-gray-700'}`}
          onClick={() => setView('user')}
        >
          <User size={16} className="mr-1" />
          Resident View
        </button>
      </div>
      
      <div className="flex items-center justify-center flex-1 p-4">
        <div className="w-full max-w-6xl h-[700px] bg-white rounded-lg shadow-lg overflow-hidden">
          {view === 'admin' ? <AdminDashboard /> : <UserDashboard />}
        </div>
      </div>
      
      <div className="bg-gray-800 text-gray-400 text-xs text-center py-2">
        Barangay Waste Management System - Using MongoDB and Mistral AI
      </div>
    </div>
  );
}

export default App;

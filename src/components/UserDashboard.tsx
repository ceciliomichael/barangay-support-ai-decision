import { useState, useEffect, useRef } from 'react';
import { residentService, concernService } from '../services/api';
import { Resident, Concern } from '../types';
import { Search, PlusCircle, RefreshCw, LogOut, User, Trash2 } from 'lucide-react';
import UserConcernList from './UserConcernList';
import UserConcernForm from './UserConcernForm';
import UserSignIn from './UserSignIn';

const UserDashboard = () => {
  const [resident, setResident] = useState<Resident | null>(null);
  const [concerns, setConcerns] = useState<Concern[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'approved', 'rejected'
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Load resident data from localStorage on component mount
  useEffect(() => {
    const loadResidentFromStorage = async () => {
      const residentId = localStorage.getItem('residentId');
      
      if (residentId) {
        setIsLoading(true);
        try {
          const residentData = await residentService.getById(residentId);
          setResident(residentData);
        } catch (error) {
          console.error('Failed to load resident data:', error);
          // Clear invalid storage data
          localStorage.removeItem('residentId');
          localStorage.removeItem('residentEmail');
          localStorage.removeItem('residentName');
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadResidentFromStorage();
  }, []);
  
  // Load resident's concerns when resident changes and set up polling
  useEffect(() => {
    if (resident) {
      loadConcerns();
      
      // Set up polling interval (every 5 seconds)
      pollingIntervalRef.current = setInterval(loadConcerns, 5000);
    }
    
    // Clean up interval on unmount or when resident changes
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [resident]);
  
  // Load concerns for the current resident
  const loadConcerns = async () => {
    if (!resident?._id) return;
    
    try {
      const data = await concernService.getAll({ residentId: resident._id });
      setConcerns(data);
    } catch (error) {
      console.error('Failed to load concerns:', error);
    }
  };
  
  // Handle submitting a new concern
  const handleSubmitConcern = async (text: string) => {
    if (!resident?._id) return;
    
    setIsSubmitting(true);
    try {
      await concernService.create({
        text,
        residentId: resident._id
      });
      
      // Reload concerns after submission
      await loadConcerns();
      setIsFormOpen(false);
    } catch (error) {
      console.error('Failed to submit concern:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle sign in (development version - just creates a test resident)
  const handleSignIn = async (email: string, name: string) => {
    setIsLoading(true);
    try {
      let foundResident = null;
      
      // Check if user exists by email first
      const existingResidents = await residentService.getAll({ email });
      
      if (existingResidents && existingResidents.length > 0) {
        // User exists, use existing account
        foundResident = existingResidents[0];
        console.log('Found existing resident:', foundResident);
      } else if (email === 'test@example.com') {
        // Use test resident
        foundResident = await residentService.createTest();
      } else {
        // Create a new resident
        foundResident = await residentService.create({ name, email });
      }
      
      // Save to state and localStorage
      setResident(foundResident);
      localStorage.setItem('residentId', foundResident._id);
      localStorage.setItem('residentEmail', foundResident.email);
      localStorage.setItem('residentName', foundResident.name);
      
      // Load concerns immediately
      await loadConcerns();
    } catch (error) {
      console.error('Failed to sign in:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle sign out
  const handleSignOut = () => {
    setResident(null);
    setConcerns([]);
    localStorage.removeItem('residentId');
    localStorage.removeItem('residentEmail');
    localStorage.removeItem('residentName');
  };
  
  // Filter concerns based on selected filter and search term
  const filteredConcerns = concerns.filter(concern => {
    // Apply search filter
    const matchesSearch = searchTerm === '' || 
      concern.text.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply status filter
    if (filter === 'all') return matchesSearch;
    return concern.verification?.status === filter && matchesSearch;
  });
  
  // If no resident is signed in, show the sign-in form
  if (!resident) {
    return <UserSignIn onSignIn={handleSignIn} isLoading={isLoading} />;
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* Dashboard header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-gray-900">Waste Concern Submission</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-bold">
              {resident.name.charAt(0)}
            </div>
            <span className="hidden md:inline font-medium">{resident.name}</span>
            <button 
              className="p-2 text-gray-500 rounded-full hover:bg-gray-100"
              onClick={handleSignOut}
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Status counts */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
            <div className="text-xs text-orange-500 font-medium">Pending</div>
            <div className="text-lg font-bold">
              {concerns.filter(c => c.verification?.status === 'pending').length}
            </div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg border border-green-100">
            <div className="text-xs text-green-500 font-medium">Approved</div>
            <div className="text-lg font-bold">
              {concerns.filter(c => c.verification?.status === 'approved').length}
            </div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg border border-red-100">
            <div className="text-xs text-red-500 font-medium">Rejected</div>
            <div className="text-lg font-bold">
              {concerns.filter(c => c.verification?.status === 'rejected').length}
            </div>
          </div>
        </div>
      </div>
      
      {/* Search and filter bar */}
      <div className="bg-white p-4 border-b border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="relative w-full md:w-64">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search your concerns..." 
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <button 
            className={`px-3 py-2 rounded-lg text-sm ${filter === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`px-3 py-2 rounded-lg text-sm ${filter === 'pending' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button 
            className={`px-3 py-2 rounded-lg text-sm ${filter === 'approved' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setFilter('approved')}
          >
            Approved
          </button>
          <button 
            className={`px-3 py-2 rounded-lg text-sm ${filter === 'rejected' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setFilter('rejected')}
          >
            Rejected
          </button>
        </div>
      </div>
      
      {/* Concerns list */}
      <UserConcernList 
        concerns={filteredConcerns}
        isLoading={isLoading}
        onRefresh={loadConcerns}
      />
      
      {/* New concern button */}
      <div className="fixed bottom-6 right-6">
        <button
          className="p-4 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 flex items-center justify-center"
          onClick={() => setIsFormOpen(true)}
        >
          <PlusCircle size={24} />
        </button>
      </div>
      
      {/* New concern form modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Submit New Waste Concern</h2>
              <button 
                className="p-2 text-gray-500 hover:text-gray-700"
                onClick={() => setIsFormOpen(false)}
              >
                <Trash2 size={18} />
              </button>
            </div>
            <UserConcernForm 
              onSubmit={handleSubmitConcern}
              onCancel={() => setIsFormOpen(false)}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard; 
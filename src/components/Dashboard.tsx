import { useState, useEffect, useRef } from 'react';
import ConcernsList from './ConcernsList';
import OverviewStats from './OverviewStats';
import ConcernForm from './ConcernForm';
import { concernService } from '../services/api';
import { Message, User, MistralMessage, Verification } from '../types';
import { Layout, Search, Bell, Filter, Settings, User as UserIcon, ChevronDown } from 'lucide-react';

// Admin user data
const adminUser: User = {
  id: 'admin1',
  name: 'Admin',
  avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=admin'
};

const Dashboard = () => {
  const [concerns, setConcerns] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'approved', 'rejected'
  const [searchTerm, setSearchTerm] = useState('');
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch concerns on component mount and set up polling
  useEffect(() => {
    fetchConcerns();
    
    // Set up polling interval (every 5 seconds)
    pollingIntervalRef.current = setInterval(fetchConcerns, 5000);
    
    // Clean up interval on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Fetch concerns from the API
  const fetchConcerns = async () => {
    try {
      const data = await concernService.getAll();
      
      // Convert the API response to the Message type format
      const formattedConcerns: Message[] = data.map((concern: any) => ({
        id: concern._id,
        text: concern.text,
        sender: concern.residentId?._id || 'unknown',
        senderName: concern.residentId?.name || 'Unknown Resident',
        timestamp: new Date(concern.createdAt || concern.timestamp),
        verification: concern.verification || {
          status: 'pending',
          aiSuggestion: null
        }
      }));
      
      setConcerns(formattedConcerns);
    } catch (error) {
      console.error('Error fetching concerns:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Manually approve or reject a concern
  const handleVerification = async (id: number | string, status: 'approved' | 'rejected') => {
    try {
      // Update concern in the database
      await concernService.update(String(id), {
        verification: {
          status
          // The API only accepts status in the verification object
        }
      });
      
      // Update local state
      const updatedConcerns = concerns.map(concern => {
        if (concern.id === id) {
          // Create a properly typed verification object
          const verification: Verification = {
            ...concern.verification,
            status,
            // Ensure aiSuggestion is present and properly typed
            aiSuggestion: concern.verification?.aiSuggestion || null
          };
          
          return {
            ...concern,
            verification
          };
        }
        return concern;
      });
      
      setConcerns(updatedConcerns);
    } catch (error) {
      console.error('Error updating concern verification:', error);
    }
  };

  // Filter concerns based on selected filter
  const filteredConcerns = concerns.filter(concern => {
    // Apply search filter
    const matchesSearch = searchTerm === '' || 
      concern.text.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply status filter
    if (filter === 'all') return matchesSearch;
    return concern.verification?.status === filter && matchesSearch;
  });

  // Handle a new concern submission
  const handleNewConcern = async (text: string) => {
    try {
      // Submit concern via API
      const response = await concernService.create({
        text,
        residentId: adminUser.id // Using admin as the creator for test purposes
      });
      
      // Immediately fetch all concerns to get the updated list
      await fetchConcerns();
    } catch (error) {
      console.error('Error submitting concern:', error);
    }
  };

  // Process pending concerns with AI manually
  const processPendingConcerns = async () => {
    try {
      setIsProcessing(true);
      // Trigger backend to process all pending concerns
      await concernService.processAll();
      // Fetch updated concerns
      await fetchConcerns();
    } catch (error) {
      console.error('Error processing concerns:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Dashboard header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-gray-900">Waste Management Dashboard</h1>
          <div className="hidden md:flex items-center space-x-2 text-sm">
            <a href="#" className="text-primary font-medium">Dashboard</a>
            <span className="text-gray-400">/</span>
            <a href="#" className="text-gray-500">Concerns</a>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100">
            <Bell size={20} />
          </button>
          <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100">
            <Settings size={20} />
          </button>
          <div className="flex items-center space-x-2">
            <img src={adminUser.avatar} alt={adminUser.name} className="w-8 h-8 rounded-full" />
            <span className="hidden md:inline font-medium">Admin</span>
            <ChevronDown size={16} className="text-gray-500" />
          </div>
        </div>
      </div>
      
      {/* Stats overview */}
      <div className="p-4 bg-white border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
        <OverviewStats concerns={concerns} />
      </div>
      
      {/* Search and filter bar */}
      <div className="bg-white p-4 border-b border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="relative w-full md:w-64">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search concerns..." 
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
      <ConcernsList 
        concerns={filteredConcerns}
        isProcessing={isProcessing}
        onVerify={handleVerification}
      />
      
      {/* Dashboard footer */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex justify-between items-center text-sm text-gray-500">
          <div>Showing {filteredConcerns.length} of {concerns.length} concerns</div>
          <div>Barangay Waste Management System © 2025</div>
        </div>
      </div>
      
      {/* Floating concern form for demo purposes */}
      <ConcernForm onSubmit={handleNewConcern} />
    </div>
  );
};

export default Dashboard; 
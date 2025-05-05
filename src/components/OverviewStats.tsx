import { Message } from '../types';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface OverviewStatsProps {
  concerns: Message[];
}

const OverviewStats = ({ concerns }: OverviewStatsProps) => {
  // Calculate statistics
  const totalConcerns = concerns.length;
  const pendingConcerns = concerns.filter(c => !c.verification || c.verification.status === 'pending').length;
  const approvedConcerns = concerns.filter(c => c.verification?.status === 'approved').length;
  const rejectedConcerns = concerns.filter(c => c.verification?.status === 'rejected').length;
  
  // Calculate percentages (avoid division by zero)
  const approvedPercentage = totalConcerns ? Math.round((approvedConcerns / totalConcerns) * 100) : 0;
  const rejectedPercentage = totalConcerns ? Math.round((rejectedConcerns / totalConcerns) * 100) : 0;
  const pendingPercentage = totalConcerns ? Math.round((pendingConcerns / totalConcerns) * 100) : 0;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Concerns</p>
            <h3 className="text-2xl font-bold text-gray-900">{totalConcerns}</h3>
          </div>
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <AlertTriangle size={20} className="text-blue-600" />
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          From all Barangay residents
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Pending</p>
            <h3 className="text-2xl font-bold text-yellow-500">{pendingConcerns}</h3>
          </div>
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
            <Clock size={20} className="text-yellow-600" />
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          {pendingPercentage}% of total concerns
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Legitimate</p>
            <h3 className="text-2xl font-bold text-green-500">{approvedConcerns}</h3>
          </div>
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle size={20} className="text-green-600" />
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          {approvedPercentage}% of total concerns
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Nonsense</p>
            <h3 className="text-2xl font-bold text-red-500">{rejectedConcerns}</h3>
          </div>
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle size={20} className="text-red-600" />
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          {rejectedPercentage}% of total concerns
        </div>
      </div>
    </div>
  );
};

export default OverviewStats; 
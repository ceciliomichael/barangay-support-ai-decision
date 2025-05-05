import { useRef, useEffect } from 'react';
import { Concern } from '../types';
import { CheckCircle, XCircle, Clock, AlertTriangle, RefreshCw } from 'lucide-react';

interface UserConcernListProps {
  concerns: Concern[];
  isLoading: boolean;
  onRefresh: () => void;
}

const UserConcernList = ({ concerns, isLoading, onRefresh }: UserConcernListProps) => {
  const listEndRef = useRef<HTMLDivElement>(null);

  // Format timestamp
  const formatTime = (date: Date) => {
    if (!date) return '';
    const dateObj = new Date(date);
    return dateObj.toLocaleString([], { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Get status icon based on verification status
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={18} className="text-green-500" />;
      case 'rejected':
        return <XCircle size={18} className="text-red-500" />;
      case 'pending':
      default:
        return <Clock size={18} className="text-yellow-500" />;
    }
  };

  // Get status text based on verification status
  const getStatusText = (status?: string) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'pending':
      default:
        return 'Pending';
    }
  };

  // Get status color based on verification status
  const getStatusClass = (status?: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4">
      {/* Loading and refresh controls */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-gray-900">Your Concerns</h2>
        <button 
          className={`p-2 text-gray-500 rounded-full hover:bg-gray-100 ${isLoading ? 'animate-spin' : ''}`}
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Empty state */}
      {concerns.length === 0 && !isLoading && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">No concerns found</p>
          <p className="text-sm">Submit a new concern by clicking the + button</p>
        </div>
      )}
      
      {/* Concerns list */}
      {concerns.map((concern) => (
        <div 
          key={concern._id || concern.id}
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 animate-fade-in"
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs text-gray-500">{formatTime(concern.timestamp)}</p>
            </div>
            
            <div className="flex items-center">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(concern.verification?.status)}`}>
                {getStatusIcon(concern.verification?.status)}
                <span className="ml-1">{getStatusText(concern.verification?.status)}</span>
              </span>
            </div>
          </div>
          
          <p className="text-gray-700 mb-3">{concern.text}</p>
          
          {concern.verification?.aiReason && (
            <div className="bg-gray-50 p-3 rounded-md mb-2 text-sm text-gray-700">
              <strong>Response:</strong> {concern.verification.aiReason}
            </div>
          )}
          
          {concern.verification?.processedAt && (
            <div className="text-xs text-gray-500 text-right">
              Processed on {formatTime(new Date(concern.verification.processedAt))}
            </div>
          )}
        </div>
      ))}
      
      {/* Loading state */}
      {isLoading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin mr-2">
            <RefreshCw size={20} className="text-primary" />
          </div>
          <span className="text-gray-600">Loading concerns...</span>
        </div>
      )}
      
      <div ref={listEndRef} />
    </div>
  );
};

export default UserConcernList; 
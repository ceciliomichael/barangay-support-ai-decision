import { useRef, useEffect } from 'react';
import { Message } from '../types';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface ConcernsListProps {
  concerns: Message[];
  isProcessing: boolean;
  onVerify: (id: number, status: 'approved' | 'rejected') => void;
}

const ConcernsList = ({ concerns, isProcessing, onVerify }: ConcernsListProps) => {
  const listEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new concerns are added
  useEffect(() => {
    if (concerns.length > 0) {
      listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [concerns.length]);

  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleString([], { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Get sender name (normally would come from a user database)
  const getSenderName = (senderId: string) => {
    const names: Record<string, string> = {
      'resident1': 'Maria Santos',
      'resident2': 'Juan Dela Cruz',
      'resident3': 'Ana Reyes',
      'resident4': 'Pedro Mendoza',
      'resident5': 'Elena Bautista',
      'resident6': 'Miguel Gonzales',
      'resident7': 'Sofia Dizon'
    };
    
    return names[senderId] || senderId;
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
        return 'Legitimate';
      case 'rejected':
        return 'Nonsense';
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
      {isProcessing && (
        <div className="bg-blue-50 text-blue-700 p-3 rounded-lg flex items-center mb-4">
          <AlertTriangle size={18} className="mr-2" />
          <span>AI is processing pending concerns... This may take a moment.</span>
        </div>
      )}
      
      {concerns.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">No concerns found</p>
          <p className="text-sm">Try changing your search or filter criteria</p>
        </div>
      ) : (
        concerns.map((concern) => (
          <div 
            key={concern.id}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 animate-fade-in"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-bold mr-3">
                  {getSenderName(concern.sender).charAt(0)}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{getSenderName(concern.sender)}</h3>
                  <p className="text-xs text-gray-500">{formatTime(concern.timestamp)}</p>
                </div>
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
              <div className="bg-gray-50 p-3 rounded-md mb-3 text-sm text-gray-700">
                <strong>AI Analysis:</strong> {concern.verification.aiReason}
              </div>
            )}
            
            <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
              {(concern.verification?.status === 'pending' || !concern.verification) && (
                <>
                  <button 
                    className="px-3 py-1.5 text-xs bg-green-50 text-green-600 rounded-md flex items-center hover:bg-green-100"
                    onClick={() => onVerify(concern.id, 'approved')}
                  >
                    <CheckCircle size={14} className="mr-1" />
                    Approve
                  </button>
                  <button 
                    className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-md flex items-center hover:bg-red-100"
                    onClick={() => onVerify(concern.id, 'rejected')}
                  >
                    <XCircle size={14} className="mr-1" />
                    Reject
                  </button>
                </>
              )}
              
              {concern.verification?.status === 'approved' && (
                <button 
                  className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-md flex items-center hover:bg-red-100"
                  onClick={() => onVerify(concern.id, 'rejected')}
                >
                  <XCircle size={14} className="mr-1" />
                  Mark as Invalid
                </button>
              )}
              
              {concern.verification?.status === 'rejected' && (
                <button 
                  className="px-3 py-1.5 text-xs bg-green-50 text-green-600 rounded-md flex items-center hover:bg-green-100"
                  onClick={() => onVerify(concern.id, 'approved')}
                >
                  <CheckCircle size={14} className="mr-1" />
                  Mark as Valid
                </button>
              )}
            </div>
          </div>
        ))
      )}
      
      <div ref={listEndRef} />
    </div>
  );
};

export default ConcernsList; 
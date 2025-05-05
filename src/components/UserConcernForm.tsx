import { useState } from 'react';

interface UserConcernFormProps {
  onSubmit: (text: string) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const UserConcernForm = ({ onSubmit, onCancel, isSubmitting }: UserConcernFormProps) => {
  const [text, setText] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="concern" className="block text-sm font-medium text-gray-700 mb-1">
          Describe your waste management concern
        </label>
        <textarea
          id="concern"
          className="w-full h-32 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="E.g., There's a pile of garbage that hasn't been collected on Main Street for three days..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isSubmitting}
          required
        />
      </div>
      
      <div className="text-sm text-gray-600">
        <p>Your concern will be automatically reviewed by our system.</p>
        <p>You'll be notified when it's processed.</p>
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={`px-4 py-2 text-sm text-white bg-primary rounded-md hover:bg-primary/90 flex items-center justify-center min-w-[80px] ${
            isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
          }`}
          disabled={isSubmitting || !text.trim()}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </>
          ) : (
            'Submit'
          )}
        </button>
      </div>
    </form>
  );
};

export default UserConcernForm; 
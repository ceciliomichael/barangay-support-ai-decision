import { useState } from 'react';
import { Plus } from 'lucide-react';

interface ConcernFormProps {
  onSubmit: (text: string) => void;
}

const ConcernForm = ({ onSubmit }: ConcernFormProps) => {
  const [text, setText] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text);
      setText('');
      setIsOpen(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6">
      {isOpen ? (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 w-80">
          <h3 className="font-medium text-gray-900 mb-2">Submit New Concern</h3>
          <form onSubmit={handleSubmit}>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              rows={4}
              placeholder="Describe your waste management concern..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="flex justify-end space-x-2 mt-3">
              <button
                type="button"
                className="px-3 py-2 text-xs text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-2 text-xs text-white bg-primary rounded-md hover:bg-primary/90"
                disabled={!text.trim()}
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          className="p-4 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 flex items-center justify-center"
          onClick={() => setIsOpen(true)}
        >
          <Plus size={24} />
        </button>
      )}
    </div>
  );
};

export default ConcernForm; 
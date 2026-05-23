import { useEffect } from 'react';

const DeleteEventDialog = ({ isOpen, onClose, onConfirm, isDeleting, title }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !isDeleting) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, isDeleting]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={() => !isDeleting && onClose()}
      />
      
      <div className="relative bg-white rounded-xl shadow-xl ring-1 ring-slate-200 w-full max-w-lg overflow-hidden transform transition-all">
        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="pt-1 text-left">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Delete Event
              </h3>
              <p className="text-sm text-slate-600 mb-1">
                Are you sure you want to delete <span className="font-medium text-slate-900">"{title}"</span>?
              </p>
              <p className="text-sm text-slate-600">
                This action cannot be undone. All event data will be permanently removed.
              </p>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="w-full sm:w-auto inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed items-center gap-2"
          >
            {isDeleting && (
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isDeleting ? 'Deleting...' : 'Delete Event'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteEventDialog;

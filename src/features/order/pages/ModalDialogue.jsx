import React from 'react';
import PropTypes from 'prop-types';

function ModalDialogue({ show, title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', loading = false }) {
  if (!show) return null;

  return (
    // Overlay for the modal
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
      {/* Modal content container */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-sm w-full mx-auto animate-fade-in-up">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 rounded-t-lg">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <button
            type="button"
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center transition-colors"
            onClick={onCancel}
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5">
          <p className="text-base leading-relaxed text-gray-500">{message}</p>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center p-5 border-t border-gray-200 rounded-b-lg space-x-4">
          <button
            type="button"
            className="py-2 px-4 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" role="status"></span>
            ) : null}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

ModalDialogue.propTypes = {
  show: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  loading: PropTypes.bool
};

export default ModalDialogue;
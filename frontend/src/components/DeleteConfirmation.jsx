import React from "react";
import { AlertTriangle, X } from "lucide-react";

const DeleteConfirmation = ({ isOpen, onClose, onConfirm, taskTitle }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Confirm Deletion
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete <strong>"{taskTitle}"</strong>?
          </p>
          <p className="text-sm text-gray-500 mb-6">
            This action cannot be undone. The task will be permanently removed.
          </p>

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 btn btn-secondary">
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 btn btn-danger flex items-center gap-2 justify-center"
            >
              <AlertTriangle className="h-4 w-4" />
              Delete Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation;

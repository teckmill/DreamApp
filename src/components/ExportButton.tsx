import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { exportDreams } from '../utils/exportUtils';

interface ExportButtonProps {
  dreams: any[];
}

export default function ExportButton({ dreams }: ExportButtonProps) {
  const [showFormatMenu, setShowFormatMenu] = useState(false);

  const handleExport = (format: 'pdf' | 'txt' | 'json') => {
    exportDreams(dreams, { format });
    setShowFormatMenu(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowFormatMenu(!showFormatMenu)}
        className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
      >
        <Download className="h-4 w-4" />
        <span>Export</span>
      </button>

      {showFormatMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10">
          <div className="py-1">
            <button
              onClick={() => handleExport('pdf')}
              className="block w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Export as PDF
            </button>
            <button
              onClick={() => handleExport('txt')}
              className="block w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Export as TXT
            </button>
            <button
              onClick={() => handleExport('json')}
              className="block w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Export as JSON
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 
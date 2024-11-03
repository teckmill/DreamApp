import React, { useState, useEffect } from 'react';
import { Flag, AlertTriangle, CheckCircle, XCircle, Eye } from 'lucide-react';
import { moderationService } from '../../services/moderationService';

export default function ContentModeration() {
  const [reports, setReports] = useState(moderationService.getReports());
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('pending');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = () => {
    setReports(moderationService.getReports());
  };

  const handleAction = async (reportId: string, action: 'approve' | 'delete' | 'warn' | 'ban') => {
    try {
      await moderationService.resolveReport(reportId, 'admin', action === 'ban' ? 'ban' : 'warn');
      loadReports();
    } catch (error) {
      console.error('Error handling report:', error);
    }
  };

  const filteredReports = reports.filter(report => 
    filter === 'all' || report.status === filter
  );

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="flex gap-4">
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100'
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter('resolved')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-gray-100'
          }`}
        >
          Resolved
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'all' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100'
          }`}
        >
          All
        </button>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map(report => (
          <div key={report.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className={`px-2 py-1 rounded-full text-sm ${
                  report.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {report.status}
                </span>
                <p className="mt-2 text-sm text-gray-500">
                  Reported by: {report.reportedBy}
                </p>
              </div>
              <button
                onClick={() => setSelectedReport(report)}
                className="p-2 text-gray-500 hover:text-indigo-600"
              >
                <Eye className="h-5 w-5" />
              </button>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {report.description}
            </p>

            {report.status === 'pending' && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleAction(report.id, 'approve')}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-lg"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleAction(report.id, 'warn')}
                  className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg"
                >
                  Warn User
                </button>
                <button
                  onClick={() => handleAction(report.id, 'ban')}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded-lg"
                >
                  Ban User
                </button>
                <button
                  onClick={() => handleAction(report.id, 'delete')}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg"
                >
                  Delete Content
                </button>
              </div>
            )}
          </div>
        ))}

        {filteredReports.length === 0 && (
          <p className="text-center text-gray-500">No reports found.</p>
        )}
      </div>
    </div>
  );
} 
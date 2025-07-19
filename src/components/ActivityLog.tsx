import React from 'react';
import { ScrollText, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { RegistrationLog } from '../hooks/useRegistrationEngine';

interface ActivityLogProps {
  logs: RegistrationLog[];
  maxHeight?: string;
}

export const ActivityLog: React.FC<ActivityLogProps> = ({ 
  logs, 
  maxHeight = 'max-h-96' 
}) => {
  const getLogIcon = (level: RegistrationLog['level']) => {
    switch (level) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getLogColor = (level: RegistrationLog['level']) => {
    switch (level) {
      case 'success':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      default:
        return 'text-blue-700 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <ScrollText className="h-5 w-5 mr-2" />
        Activity Log ({logs.length} entries)
      </h2>
      
      {logs.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No activity yet. Start registration to see logs here.
        </p>
      ) : (
        <div className={`${maxHeight} overflow-y-auto space-y-2`}>
          {logs.map((log) => (
            <div
              key={log.id}
              className={`p-3 rounded-lg border ${getLogColor(log.level)}`}
            >
              <div className="flex items-start space-x-2">
                <div className="flex-shrink-0 mt-0.5">
                  {getLogIcon(log.level)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      {log.message}
                    </p>
                    <span className="text-xs text-gray-500">
                      {log.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  {log.siteId && (
                    <p className="text-xs text-gray-600 mt-1">
                      Site ID: {log.siteId}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {logs.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm text-gray-600">
            <span>
              Success: {logs.filter(l => l.level === 'success').length}
            </span>
            <span>
              Errors: {logs.filter(l => l.level === 'error').length}
            </span>
            <span>
              Warnings: {logs.filter(l => l.level === 'warning').length}
            </span>
            <span>
              Info: {logs.filter(l => l.level === 'info').length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
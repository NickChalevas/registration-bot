import React from 'react';
import { Globe, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { Site } from '../types/registration';
import RegistrationEngine from '../services/registrationEngine';

interface SiteListProps {
  sites: Site[];
  onSiteUpdate: (siteId: string, updates: Partial<Site>) => void;
}

export const SiteList: React.FC<SiteListProps> = ({ sites, onSiteUpdate }) => {
  const registrationEngine = RegistrationEngine.getInstance();

  const getStatusIcon = (status: Site['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: Site['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'failed':
        return 'bg-red-50 border-red-200';
      case 'processing':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status: Site['status']) => {
    switch (status) {
      case 'success':
        return 'Registered';
      case 'failed':
        return 'Failed';
      case 'processing':
        return 'Processing';
      default:
        return 'Pending';
    }
  };

  const getRequiredFields = (url: string): string[] => {
    return registrationEngine.getRequiredFields(url);
  };

  const getSiteHandler = (url: string) => {
    return registrationEngine.getSiteHandler(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <Globe className="h-5 w-5 mr-2" />
        Site Registration Status ({sites.length} sites)
      </h2>
      
      {sites.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No sites loaded. Please upload a CSV file to begin.
        </p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {sites.map((site) => (
            <div
              key={site.id}
              className={`p-4 rounded-lg border ${getStatusColor(site.status)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">{site.name}</h3>
                  <p className="text-sm text-gray-600 truncate">{site.url}</p>
                  
                  {/* Show site handler and required fields */}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {getSiteHandler(site.url) ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        {getSiteHandler(site.url)?.name} Handler
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                        Generic Handler
                      </span>
                    )}
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      Fields: {getRequiredFields(site.url).join(', ')}
                    </span>
                  </div>
                  
                  {site.lastAttempt && (
                    <p className="text-xs text-gray-500 mt-1">
                      Last attempt: {site.lastAttempt.toLocaleString()}
                    </p>
                  )}
                  {site.errorMessage && (
                    <p className="text-xs text-red-600 mt-1">
                      Error: {site.errorMessage}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {getStatusIcon(site.status)}
                  <span className={`text-sm font-medium ${
                    site.status === 'success' ? 'text-green-700' :
                    site.status === 'failed' ? 'text-red-700' :
                    site.status === 'processing' ? 'text-blue-700' :
                    'text-gray-700'
                  }`}>
                    {getStatusText(site.status)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
import React from 'react';
import { Globe, CheckCircle, XCircle, Clock, AlertCircle, Info } from 'lucide-react';
import { Site } from '../types/registration';
import RegistrationEngine from '../services/registrationEngine';

interface MobileSiteListProps {
  sites: Site[];
  onSiteUpdate: (site: Site) => void;
}

export const MobileSiteList: React.FC<MobileSiteListProps> = ({ sites, onSiteUpdate }) => {
  const registrationEngine = RegistrationEngine.getInstance();

  const getStatusIcon = (status: Site['status']) => {
    switch (status) {
      case 'registered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Globe className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: Site['status']) => {
    switch (status) {
      case 'registered':
        return 'Registered';
      case 'failed':
        return 'Failed';
      case 'error':
        return 'Error';
      case 'pending':
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
    <div className="space-y-3">
      {sites.map((site) => (
        <div key={site.id} className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              <Globe className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm truncate">{site.name}</h3>
                <p className="text-xs text-gray-600 truncate">{site.url}</p>
                
                {/* Show site handler info */}
                <div className="mt-1">
                  {getSiteHandler(site.url) ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800">
                      <Info className="h-3 w-3 mr-1" />
                      {getSiteHandler(site.url)?.name} Handler
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                      Generic Handler
                    </span>
                  )}
                </div>
                
                {/* Show required fields */}
                <div className="mt-1">
                  <p className="text-xs text-gray-500">
                    Required: {getRequiredFields(site.url).join(', ')}
                  </p>
                </div>
                
                {site.lastAttempt && (
                  <p className="text-xs text-gray-500 mt-1">
                    Last: {site.lastAttempt.toLocaleString()}
                  </p>
                )}
                {site.error && (
                  <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
                    <p className="text-xs text-red-600">{site.error}</p>
                  </div>
                )}
                {site.notes && (
                  <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                    <p className="text-xs text-blue-600">{site.notes}</p>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col items-end space-y-1">
                {getStatusIcon(site.status)}
                <span className={`text-xs font-medium ${
                  site.status === 'registered' ? 'text-green-600' :
                  site.status === 'failed' || site.status === 'error' ? 'text-red-600' :
                  site.status === 'pending' ? 'text-yellow-600' : 'text-gray-600'
                }`}>
                  {getStatusText(site.status)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
import React from 'react';
import { Settings, Clock, Zap, RotateCcw } from 'lucide-react';
import { RegistrationConfig } from '../types/registration';

interface RegistrationConfigProps {
  config: RegistrationConfig;
  onConfigChange: (config: RegistrationConfig) => void;
}

export const RegistrationConfigComponent: React.FC<RegistrationConfigProps> = ({
  config,
  onConfigChange
}) => {
  const handleSpeedChange = (speed: number) => {
    onConfigChange({ ...config, speed });
  };

  const handleTimeChange = (field: 'startTime' | 'endTime', value: string) => {
    onConfigChange({ ...config, [field]: value });
  };

  const handleRetryChange = (maxRetries: number) => {
    onConfigChange({ ...config, maxRetries });
  };

  const handleDelayChange = (delayBetweenAttempts: number) => {
    onConfigChange({ ...config, delayBetweenAttempts });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <Settings className="h-5 w-5 mr-2" />
        Registration Configuration
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Zap className="h-4 w-4 mr-1" />
            Registration Speed (per hour)
          </label>
          <div className="space-y-2">
            <input
              type="range"
              min="10"
              max="100"
              value={config.speed}
              onChange={(e) => handleSpeedChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-600">
              <span>10/hour</span>
              <span className="font-medium">{config.speed}/hour</span>
              <span>100/hour</span>
            </div>
            <p className="text-xs text-gray-500">
              Delay between registrations: {Math.round(3600 / config.speed)} seconds
            </p>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            Operating Hours
          </label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Start:</label>
              <input
                type="time"
                value={config.startTime}
                onChange={(e) => handleTimeChange('startTime', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">End:</label>
              <input
                type="time"
                value={config.endTime}
                onChange={(e) => handleTimeChange('endTime', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <RotateCcw className="h-4 w-4 mr-1" />
            Max Retries per Site
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={config.maxRetries}
            onChange={(e) => handleRetryChange(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Delay Between Attempts (seconds)
          </label>
          <input
            type="number"
            min="1"
            max="30"
            value={config.delayBetweenAttempts}
            onChange={(e) => handleDelayChange(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
};
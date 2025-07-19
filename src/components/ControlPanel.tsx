import React, { useState } from 'react';
import { Play, Pause, Square, RefreshCw } from 'lucide-react';

interface ControlPanelProps {
  isRunning: boolean;
  isPaused: boolean;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onReset: () => void;
  canStart: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isRunning,
  isPaused,
  onStart,
  onPause,
  onStop,
  onReset,
  canStart
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleReset = () => {
    if (showConfirmReset) {
      onReset();
      setShowConfirmReset(false);
    } else {
      setShowConfirmReset(true);
      setTimeout(() => setShowConfirmReset(false), 3000);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Control Panel</h2>
      
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onStart}
          disabled={!canStart || isRunning}
          className={`flex items-center px-4 py-2 rounded-md transition-colors ${
            !canStart || isRunning
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          <Play className="h-4 w-4 mr-2" />
          {isPaused ? 'Resume' : 'Start'} Registration
        </button>
        
        <button
          onClick={onPause}
          disabled={!isRunning}
          className={`flex items-center px-4 py-2 rounded-md transition-colors ${
            !isRunning
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-yellow-600 text-white hover:bg-yellow-700'
          }`}
        >
          <Pause className="h-4 w-4 mr-2" />
          Pause
        </button>
        
        <button
          onClick={onStop}
          disabled={!isRunning}
          className={`flex items-center px-4 py-2 rounded-md transition-colors ${
            !isRunning
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-red-600 text-white hover:bg-red-700'
          }`}
        >
          <Square className="h-4 w-4 mr-2" />
          Stop
        </button>
        
        <button
          onClick={handleReset}
          className={`flex items-center px-4 py-2 rounded-md transition-colors ${
            showConfirmReset
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-gray-600 text-white hover:bg-gray-700'
          }`}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          {showConfirmReset ? 'Confirm Reset' : 'Reset All'}
        </button>
      </div>
      
      {showConfirmReset && (
        <p className="mt-2 text-sm text-red-600">
          Click "Confirm Reset" again to reset all registration data
        </p>
      )}
      
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-700 mb-2">Status</h3>
        <p className="text-sm text-gray-600">
          {isRunning 
            ? isPaused 
              ? 'Registration is paused' 
              : 'Registration is running' 
            : 'Registration is stopped'}
        </p>
      </div>
    </div>
  );
};
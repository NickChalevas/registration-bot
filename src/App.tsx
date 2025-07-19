import React from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { PhoneNumberManager } from './components/PhoneNumberManager';
import { RegistrationConfigComponent } from './components/RegistrationConfig';
import { SiteList } from './components/SiteList';
import { RegistrationStatsComponent } from './components/RegistrationStats';
import { ControlPanel } from './components/ControlPanel';
import { ActivityLog } from './components/ActivityLog';
import { useRegistrationEngine } from './hooks/useRegistrationEngine';

function App() {
  const {
    sites,
    setSites,
    phoneNumbers,
    setPhoneNumbers,
    config,
    setConfig,
    isRunning,
    isPaused,
    stats,
    logs,
    currentSiteIndex,
    updateSite,
    startRegistration,
    pauseRegistration,
    stopRegistration,
    resetRegistration
  } = useRegistrationEngine();

  const canStart = sites.length > 0 && phoneNumbers.filter(p => p.isActive).length > 0;

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <FileUpload onSitesLoad={setSites} />
            <SiteList sites={sites} onSiteUpdate={updateSite} />
            <ActivityLog logs={logs} />
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            <RegistrationStatsComponent stats={stats} />
            <ControlPanel
              isRunning={isRunning}
              isPaused={isPaused}
              onStart={startRegistration}
              onPause={pauseRegistration}
              onStop={stopRegistration}
              onReset={resetRegistration}
              canStart={canStart}
            />
            
            {/* Current Progress Indicator */}
            {isRunning && (
              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="font-medium text-gray-800 mb-2">Current Progress</h3>
                <p className="text-sm text-gray-600">
                  Processing site {currentSiteIndex + 1} of {sites.filter(s => s.status === 'pending').length} remaining
                </p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${sites.length > 0 ? ((currentSiteIndex + 1) / sites.length) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <PhoneNumberManager
            phoneNumbers={phoneNumbers}
            onPhoneNumbersChange={setPhoneNumbers}
          />
          <RegistrationConfigComponent
            config={config}
            onConfigChange={setConfig}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
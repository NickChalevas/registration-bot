import React from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { PhoneNumberManager } from './components/PhoneNumberManager';
import { RegistrationConfigComponent } from './components/RegistrationConfig';
import { SiteList } from './components/SiteList';
import { RegistrationStatsComponent } from './components/RegistrationStats';
import { ControlPanel } from './components/ControlPanel';
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
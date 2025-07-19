import { useState, useCallback, useEffect } from 'react';
import { Site, PhoneNumber, RegistrationConfig, RegistrationStats } from '../types/registration';
import RegistrationEngine, { RegistrationData } from '../services/registrationEngine';

// Add logging interface
export interface RegistrationLog {
  id: string;
  timestamp: Date;
  level: 'info' | 'success' | 'warning' | 'error';
  message: string;
  siteId?: string;
}
export const useRegistrationEngine = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [logs, setLogs] = useState<RegistrationLog[]>([]);
  const [config, setConfig] = useState<RegistrationConfig>({
    speed: 30,
    startTime: '09:00',
    endTime: '17:00',
    maxRetries: 3,
    delayBetweenAttempts: 5
  });
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSiteIndex, setCurrentSiteIndex] = useState(0);
  const [stats, setStats] = useState<RegistrationStats>({
    total: 0,
    completed: 0,
    failed: 0,
    pending: 0,
    currentHourlyRate: 0,
    estimatedTimeRemaining: '0 minutes'
  });

  const registrationEngine = RegistrationEngine.getInstance();

  // Add logging function
  const addLog = useCallback((level: RegistrationLog['level'], message: string, siteId?: string) => {
    const log: RegistrationLog = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      level,
      message,
      siteId
    };
    setLogs(prev => [log, ...prev].slice(0, 1000)); // Keep last 1000 logs
  }, []);
  const updateStats = useCallback(() => {
    const completed = sites.filter(s => s.status === 'success' || s.status === 'registered').length;
    const failed = sites.filter(s => s.status === 'failed' || s.status === 'error').length;
    const pending = sites.filter(s => s.status === 'pending').length;
    const total = sites.length;
    
    const remainingTime = pending > 0 ? Math.ceil((pending / config.speed) * 60) : 0;
    const hours = Math.floor(remainingTime / 60);
    const minutes = remainingTime % 60;
    const timeString = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    
    setStats({
      total,
      completed,
      failed,
      pending,
      currentHourlyRate: config.speed,
      estimatedTimeRemaining: timeString
    });
  }, [sites, config.speed]);

  useEffect(() => {
    updateStats();
  }, [updateStats]);

  const updateSite = useCallback((siteId: string, updates: Partial<Site>) => {
    setSites(prev => prev.map(site => 
      site.id === siteId ? { ...site, ...updates } : site
    ));
  }, []);

  const isWithinOperatingHours = useCallback(() => {
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                       now.getMinutes().toString().padStart(2, '0');
    return currentTime >= config.startTime && currentTime <= config.endTime;
  }, [config.startTime, config.endTime]);

  const performRegistration = useCallback(async (site: Site): Promise<boolean> => {
    addLog('info', `Starting registration for ${site.name}`, site.id);
    
    // Get an active phone number
    const activePhones = phoneNumbers.filter(p => p.isActive);
    if (activePhones.length === 0) {
      addLog('error', 'No active phone numbers available', site.id);
      throw new Error('No active phone numbers available');
    }

    const randomPhone = activePhones[Math.floor(Math.random() * activePhones.length)];
    addLog('info', `Using phone number: ${randomPhone.number}`, site.id);
    
    // Prepare registration data
    const registrationData: RegistrationData = {
      phoneNumber: randomPhone.number,
      email: `user${Math.floor(Math.random() * 10000)}@example.com`,
      firstName: `User${Math.floor(Math.random() * 1000)}`,
      lastName: `Test${Math.floor(Math.random() * 1000)}`,
      address: '123 Test Street, Test City',
      password: `Password${Math.floor(Math.random() * 1000)}!`
    };

    addLog('info', `Registration data prepared for ${site.name}`, site.id);

    // Validate required fields for this site
    const validation = registrationEngine.validateRegistrationData(site.url, registrationData);
    if (!validation.valid) {
      addLog('error', `Missing required fields: ${validation.missingFields.join(', ')}`, site.id);
      throw new Error(`Missing required fields: ${validation.missingFields.join(', ')}`);
    }

    addLog('info', `All required fields validated for ${site.name}`, site.id);

    // Perform registration
    const result = await registrationEngine.registerOnSite(site.url, registrationData);
    
    if (result.success) {
      addLog('success', `Registration completed successfully for ${site.name}`, site.id);
    } else {
      addLog('error', `Registration failed for ${site.name}: ${result.message}`, site.id);
    }

    // Update phone number usage if SMS is expected
    if (result.smsExpected) {
      addLog('info', `SMS verification expected for ${site.name}`, site.id);
      setPhoneNumbers(prev => prev.map(phone => 
        phone.id === randomPhone.id 
          ? { ...phone, smsReceived: phone.smsReceived + 1, lastUsed: new Date() }
          : phone
      ));
    }

    return result.success;
  }, [phoneNumbers, setPhoneNumbers, registrationEngine, addLog]);

  const processRegistration = useCallback(async (site: Site) => {
    addLog('info', `Processing registration for ${site.name}`, site.id);
    updateSite(site.id, { 
      status: 'processing', 
      lastAttempt: new Date() 
    });

    let success = false;
    let lastError = '';

    // Retry logic
    for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
      try {
        if (attempt > 1) {
          addLog('warning', `Retry attempt ${attempt}/${config.maxRetries} for ${site.name}`, site.id);
          await new Promise(resolve => setTimeout(resolve, config.delayBetweenAttempts * 1000));
        }

        success = await performRegistration(site);
        if (success) {
          break;
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error';
        addLog('error', `Attempt ${attempt} failed for ${site.name}: ${lastError}`, site.id);
        
        if (attempt === config.maxRetries) {
          break;
        }
      }
    }
      
    if (success) {
      updateSite(site.id, { 
        status: 'success',
        errorMessage: undefined
      });
      addLog('success', `Registration completed for ${site.name}`, site.id);
    } else {
      updateSite(site.id, { 
        status: 'failed',
        errorMessage: lastError || 'Registration failed after all retry attempts'
      });
      addLog('error', `Registration failed for ${site.name} after ${config.maxRetries} attempts`, site.id);
    }
  }, [updateSite, performRegistration, config.maxRetries, config.delayBetweenAttempts, addLog]);

  const startRegistration = useCallback(async () => {
    if (phoneNumbers.filter(p => p.isActive).length === 0) {
      addLog('error', 'Cannot start registration: No active phone numbers');
      alert('Please add at least one active phone number before starting registration.');
      return;
    }

    addLog('info', 'Starting registration process');
    setIsRunning(true);
    setIsPaused(false);
    setCurrentSiteIndex(0);

    const intervalTime = (3600 / config.speed) * 1000; // Convert to milliseconds
    addLog('info', `Registration speed set to ${config.speed} per hour (${Math.round(intervalTime/1000)}s intervals)`);
    
    let siteIndex = 0;
    
    const processNext = async (): Promise<void> => {
      if (!isRunning || isPaused) return;
      
      if (!isWithinOperatingHours()) {
        addLog('warning', 'Outside operating hours - waiting...');
        setTimeout(processNext, 60000); // Check again in 1 minute
        return;
      }

      const pendingSites = sites.filter(s => s.status === 'pending');
      if (pendingSites.length === 0) {
        addLog('success', 'All registrations completed!');
        setIsRunning(false);
        return;
      }

      const nextSite = pendingSites[siteIndex % pendingSites.length];
      setCurrentSiteIndex(siteIndex);
      siteIndex++;
      
      await processRegistration(nextSite);
      
      if (pendingSites.length > 1) {
        addLog('info', `Waiting ${Math.round(intervalTime/1000)} seconds before next registration...`);
      }
      
      setTimeout(processNext, intervalTime);
    };

    processNext();
  }, [sites, config.speed, isRunning, isPaused, isWithinOperatingHours, processRegistration, phoneNumbers, addLog]);

  const pauseRegistration = useCallback(() => {
    addLog('warning', 'Registration paused by user');
    setIsPaused(true);
  }, []);

  const stopRegistration = useCallback(() => {
    addLog('warning', 'Registration stopped by user');
    setIsRunning(false);
    setIsPaused(false);
  }, []);

  const resetRegistration = useCallback(() => {
    addLog('info', 'Registration data reset');
    setIsRunning(false);
    setIsPaused(false);
    setCurrentSiteIndex(0);
    setSites(prev => prev.map(site => ({ 
      ...site, 
      status: 'pending' as const,
      lastAttempt: undefined,
      errorMessage: undefined
    })));
    setLogs([]);
  }, []);

  return {
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
    resetRegistration,
    addLog
  };
};
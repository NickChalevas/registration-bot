import { useState, useCallback, useEffect } from 'react';
import { Site, PhoneNumber, RegistrationConfig, RegistrationStats } from '../types/registration';
import RegistrationEngine, { RegistrationData } from '../services/registrationEngine';

export const useRegistrationEngine = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [config, setConfig] = useState<RegistrationConfig>({
    speed: 30,
    startTime: '09:00',
    endTime: '17:00',
    maxRetries: 3,
    delayBetweenAttempts: 5
  });
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [stats, setStats] = useState<RegistrationStats>({
    total: 0,
    completed: 0,
    failed: 0,
    pending: 0,
    currentHourlyRate: 0,
    estimatedTimeRemaining: '0 minutes'
  });

  const registrationEngine = RegistrationEngine.getInstance();

  const updateStats = useCallback(() => {
    const completed = sites.filter(s => s.status === 'success').length;
    const failed = sites.filter(s => s.status === 'failed').length;
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

  const simulateRegistration = useCallback(async (site: Site): Promise<boolean> => {
    // Get an active phone number
    const activePhones = phoneNumbers.filter(p => p.isActive);
    if (activePhones.length === 0) {
      throw new Error('No active phone numbers available');
    }

    const randomPhone = activePhones[Math.floor(Math.random() * activePhones.length)];
    
    // Prepare registration data
    const registrationData: RegistrationData = {
      phoneNumber: randomPhone.number,
      email: `user${Math.floor(Math.random() * 10000)}@example.com`,
      firstName: `User${Math.floor(Math.random() * 1000)}`,
      lastName: `Test${Math.floor(Math.random() * 1000)}`,
      address: '123 Test Street, Test City',
      password: `Password${Math.floor(Math.random() * 1000)}!`
    };

    // Validate required fields for this site
    const validation = registrationEngine.validateRegistrationData(site.url, registrationData);
    if (!validation.valid) {
      throw new Error(`Missing required fields: ${validation.missingFields.join(', ')}`);
    }

    // Perform registration
    const result = await registrationEngine.registerOnSite(site.url, registrationData);
    
    // Update phone number usage if SMS is expected
    if (result.smsExpected) {
      setPhoneNumbers(prev => prev.map(phone => 
        phone.id === randomPhone.id 
          ? { ...phone, smsReceived: phone.smsReceived + 1, lastUsed: new Date() }
          : phone
      ));
    }

    return result.success;
  }, [config.delayBetweenAttempts, phoneNumbers, setPhoneNumbers, registrationEngine]);

  const processRegistration = useCallback(async (site: Site) => {
    updateSite(site.id, { 
      status: 'processing', 
      lastAttempt: new Date() 
    });

    try {
      const success = await simulateRegistration(site);
      
      if (success) {
        updateSite(site.id, { 
          status: 'success',
          errorMessage: undefined
        });
      } else {
        updateSite(site.id, { 
          status: 'failed',
          errorMessage: 'Registration failed - site may require manual verification'
        });
      }
    } catch (error) {
      updateSite(site.id, { 
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }, [updateSite, simulateRegistration]);

  const startRegistration = useCallback(async () => {
    if (phoneNumbers.filter(p => p.isActive).length === 0) {
      alert('Please add at least one active phone number before starting registration.');
      return;
    }

    setIsRunning(true);
    setIsPaused(false);

    const intervalTime = (3600 / config.speed) * 1000; // Convert to milliseconds
    
    const processNext = async () => {
      if (!isRunning || isPaused) return;
      
      if (!isWithinOperatingHours()) {
        setTimeout(processNext, 60000); // Check again in 1 minute
        return;
      }

      const pendingSites = sites.filter(s => s.status === 'pending');
      if (pendingSites.length === 0) {
        setIsRunning(false);
        return;
      }

      const nextSite = pendingSites[0];
      await processRegistration(nextSite);
      
      setTimeout(processNext, intervalTime);
    };

    processNext();
  }, [sites, config.speed, isRunning, isPaused, isWithinOperatingHours, processRegistration, phoneNumbers]);

  const pauseRegistration = useCallback(() => {
    setIsPaused(true);
  }, []);

  const stopRegistration = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
  }, []);

  const resetRegistration = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setSites(prev => prev.map(site => ({ 
      ...site, 
      status: 'pending' as const,
      lastAttempt: undefined,
      errorMessage: undefined
    })));
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
    updateSite,
    startRegistration,
    pauseRegistration,
    stopRegistration,
    resetRegistration
  };
};
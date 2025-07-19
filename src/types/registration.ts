export interface Site {
  id: string;
  name: string;
  url: string;
  status: 'pending' | 'processing' | 'success' | 'failed' | 'registered' | 'error';
  lastAttempt?: Date;
  errorMessage?: string;
}

export interface PhoneNumber {
  id: string;
  number: string;
  isActive: boolean;
  lastUsed?: Date;
  smsReceived: number;
}

export interface RegistrationConfig {
  speed: number; // registrations per hour
  startTime: string;
  endTime: string;
  maxRetries: number;
  delayBetweenAttempts: number;
}

export interface RegistrationStats {
  total: number;
  completed: number;
  failed: number;
  pending: number;
  currentHourlyRate: number;
  estimatedTimeRemaining: string;
}
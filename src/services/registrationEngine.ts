export interface RegistrationData {
  phoneNumber: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  password?: string;
}

export interface SiteHandler {
  domain: string;
  name: string;
  requiredFields: string[];
  handler: (data: RegistrationData) => Promise<boolean>;
}

// Site-specific handlers
export class RegistrationEngine {
  private static instance: RegistrationEngine;
  private siteHandlers: SiteHandler[] = [];

  private constructor() {
    this.initializeSiteHandlers();
  }

  public static getInstance(): RegistrationEngine {
    if (!RegistrationEngine.instance) {
      RegistrationEngine.instance = new RegistrationEngine();
    }
    return RegistrationEngine.instance;
  }

  private initializeSiteHandlers() {
    this.siteHandlers = [
      {
        domain: 'sekaimon.com',
        name: 'Sekaimon',
        requiredFields: ['phoneNumber'],
        handler: this.handleSekaimon.bind(this)
      },
      {
        domain: 'qoo10.jp',
        name: 'Qoo10',
        requiredFields: ['phoneNumber', 'email', 'firstName', 'lastName'],
        handler: this.handleQoo10.bind(this)
      },
      {
        domain: 'cityheaven.net',
        name: 'City Heaven',
        requiredFields: ['phoneNumber'],
        handler: this.handleCityHeaven.bind(this)
      },
      {
        domain: 'mixi.com',
        name: 'Mixi',
        requiredFields: ['phoneNumber', 'email', 'firstName', 'lastName'],
        handler: this.handleMixi.bind(this)
      },
      {
        domain: 'zexy-enmusubi.net',
        name: 'Zexy Enmusubi',
        requiredFields: ['phoneNumber'],
        handler: this.handleZexyEnmusubi.bind(this)
      },
      {
        domain: 'suntory.co.jp',
        name: 'Suntory',
        requiredFields: ['phoneNumber', 'email', 'firstName', 'lastName'],
        handler: this.handleSuntory.bind(this)
      }
    ];
  }

  public getSiteHandler(url: string): SiteHandler | null {
    const domain = this.extractDomain(url);
    return this.siteHandlers.find(handler => 
      domain.includes(handler.domain) || handler.domain.includes(domain)
    ) || null;
  }

  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url;
    }
  }

  // Generic registration handler
  public async registerOnSite(url: string, data: RegistrationData): Promise<{
    success: boolean;
    message: string;
    smsExpected: boolean;
  }> {
    const handler = this.getSiteHandler(url);
    
    if (handler) {
      try {
        const success = await handler.handler(data);
        return {
          success,
          message: success ? `Registration successful on ${handler.name}` : `Registration failed on ${handler.name}`,
          smsExpected: handler.requiredFields.includes('phoneNumber')
        };
      } catch (error) {
        return {
          success: false,
          message: `Error registering on ${handler.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          smsExpected: handler.requiredFields.includes('phoneNumber')
        };
      }
    } else {
      // Use generic handler for unknown sites
      return this.handleGenericSite(url, data);
    }
  }

  // Site-specific handlers
  private async handleSekaimon(data: RegistrationData): Promise<boolean> {
    // Sekaimon phone verification
    console.log('Registering on Sekaimon with phone:', data.phoneNumber);
    
    // Simulate API call to Sekaimon
    await this.delay(2000);
    
    // In real implementation, this would make actual HTTP requests
    const formData = {
      phone: data.phoneNumber,
      country_code: '+81' // Default to Japan
    };
    
    console.log('Sekaimon form data:', formData);
    return Math.random() > 0.2; // 80% success rate simulation
  }

  private async handleQoo10(data: RegistrationData): Promise<boolean> {
    console.log('Registering on Qoo10 as seller');
    
    await this.delay(3000);
    
    const formData = {
      email: data.email,
      phone: data.phoneNumber,
      firstName: data.firstName,
      lastName: data.lastName,
      password: data.password || this.generatePassword(),
      sellerType: 'individual'
    };
    
    console.log('Qoo10 seller registration:', formData);
    return Math.random() > 0.25; // 75% success rate
  }

  private async handleCityHeaven(data: RegistrationData): Promise<boolean> {
    console.log('Registering on City Heaven with SMS auth');
    
    await this.delay(1500);
    
    const formData = {
      phone: data.phoneNumber,
      region: 'tokyo'
    };
    
    console.log('City Heaven SMS auth:', formData);
    return Math.random() > 0.15; // 85% success rate
  }

  private async handleMixi(data: RegistrationData): Promise<boolean> {
    console.log('Creating Mixi account');
    
    await this.delay(2500);
    
    const formData = {
      email: data.email,
      phone: data.phoneNumber,
      nickname: `${data.firstName}${Math.floor(Math.random() * 1000)}`,
      password: data.password || this.generatePassword(),
      birthYear: 1990 + Math.floor(Math.random() * 20)
    };
    
    console.log('Mixi account creation:', formData);
    return Math.random() > 0.2; // 80% success rate
  }

  private async handleZexyEnmusubi(data: RegistrationData): Promise<boolean> {
    console.log('Registering on Zexy Enmusubi');
    
    await this.delay(2000);
    
    const formData = {
      phone: data.phoneNumber,
      gender: Math.random() > 0.5 ? 'male' : 'female',
      age: 25 + Math.floor(Math.random() * 15)
    };
    
    console.log('Zexy Enmusubi registration:', formData);
    return Math.random() > 0.3; // 70% success rate
  }

  private async handleSuntory(data: RegistrationData): Promise<boolean> {
    console.log('Creating Suntory ID account');
    
    await this.delay(2000);
    
    const formData = {
      email: data.email,
      phone: data.phoneNumber,
      firstName: data.firstName,
      lastName: data.lastName,
      password: data.password || this.generatePassword(),
      birthDate: this.generateBirthDate()
    };
    
    console.log('Suntory ID registration:', formData);
    return Math.random() > 0.1; // 90% success rate
  }

  private async handleGenericSite(url: string, data: RegistrationData): Promise<{
    success: boolean;
    message: string;
    smsExpected: boolean;
  }> {
    console.log('Using generic handler for:', url);
    
    await this.delay(2000);
    
    // Try to determine what fields might be needed based on URL patterns
    const urlLower = url.toLowerCase();
    const needsEmail = urlLower.includes('email') || urlLower.includes('register') || urlLower.includes('signup');
    const needsPhone = urlLower.includes('phone') || urlLower.includes('sms') || urlLower.includes('mobile');
    
    const formData: any = {};
    
    if (needsPhone || !needsEmail) {
      formData.phone = data.phoneNumber;
    }
    
    if (needsEmail) {
      formData.email = data.email;
      formData.firstName = data.firstName;
      formData.lastName = data.lastName;
      formData.password = data.password || this.generatePassword();
    }
    
    console.log('Generic registration attempt:', formData);
    
    const success = Math.random() > 0.4; // 60% success rate for unknown sites
    
    return {
      success,
      message: success ? 'Registration completed successfully' : 'Registration failed - site may require manual verification',
      smsExpected: needsPhone || Object.keys(formData).includes('phone')
    };
  }

  // Utility methods
  private generatePassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  private generateBirthDate(): string {
    const year = 1970 + Math.floor(Math.random() * 30);
    const month = 1 + Math.floor(Math.random() * 12);
    const day = 1 + Math.floor(Math.random() * 28);
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  }

  private generateEmail(firstName?: string, lastName?: string): string {
    const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const username = firstName && lastName 
      ? `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}`
      : `user${Math.floor(Math.random() * 10000)}`;
    return `${username}@${domain}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get required fields for a site
  public getRequiredFields(url: string): string[] {
    const handler = this.getSiteHandler(url);
    return handler ? handler.requiredFields : ['phoneNumber', 'email', 'firstName', 'lastName'];
  }

  // Validate if we have all required data for a site
  public validateRegistrationData(url: string, data: RegistrationData): {
    valid: boolean;
    missingFields: string[];
  } {
    const requiredFields = this.getRequiredFields(url);
    const missingFields: string[] = [];

    requiredFields.forEach(field => {
      if (!data[field as keyof RegistrationData]) {
        missingFields.push(field);
      }
    });

    return {
      valid: missingFields.length === 0,
      missingFields
    };
  }
}

export default RegistrationEngine;
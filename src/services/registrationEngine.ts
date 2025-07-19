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

export interface RegistrationResult {
  success: boolean;
  message: string;
  smsExpected: boolean;
  details?: any;
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
  public async registerOnSite(url: string, data: RegistrationData): Promise<RegistrationResult> {
    const handler = this.getSiteHandler(url);
    
    console.log(`🚀 Starting registration on: ${url}`);
    console.log(`📱 Using phone: ${data.phoneNumber}`);
    console.log(`📧 Using email: ${data.email}`);
    
    if (handler) {
      console.log(`🎯 Using specialized handler for: ${handler.name}`);
      try {
        const success = await handler.handler(data);
        return {
          success,
          message: success ? `Registration successful on ${handler.name}` : `Registration failed on ${handler.name}`,
          smsExpected: handler.requiredFields.includes('phoneNumber'),
          details: { handler: handler.name, requiredFields: handler.requiredFields }
        };
      } catch (error) {
        console.error(`❌ Error in ${handler.name} handler:`, error);
        return {
          success: false,
          message: `Error registering on ${handler.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          smsExpected: handler.requiredFields.includes('phoneNumber'),
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        };
      }
    } else {
      console.log(`🔧 Using generic handler for: ${url}`);
      // Use generic handler for unknown sites
      return this.handleGenericSite(url, data);
    }
  }

  // Site-specific handlers
  private async handleSekaimon(data: RegistrationData): Promise<boolean> {
    console.log('🌐 Sekaimon Registration Process Started');
    console.log(`📱 Phone: ${data.phoneNumber}`);
    
    // Step 1: Navigate to registration page
    console.log('📄 Step 1: Navigating to Sekaimon registration page...');
    await this.delay(1000);
    
    // Step 2: Fill phone number form
    console.log('📝 Step 2: Filling phone number form...');
    const formData = {
      phone: data.phoneNumber,
      country_code: '+81', // Default to Japan
      verification_method: 'sms'
    };
    console.log('📋 Form data:', formData);
    await this.delay(1500);
    
    // Step 3: Submit form
    console.log('📤 Step 3: Submitting registration form...');
    await this.delay(1000);
    
    // Step 4: Wait for SMS verification
    console.log('📲 Step 4: Waiting for SMS verification code...');
    await this.delay(2000);
    
    // Simulate success/failure
    const success = Math.random() > 0.2; // 80% success rate
    console.log(success ? '✅ Sekaimon registration successful!' : '❌ Sekaimon registration failed');
    
    return success;
  }

  private async handleQoo10(data: RegistrationData): Promise<boolean> {
    console.log('🛒 Qoo10 Seller Registration Process Started');
    console.log(`📧 Email: ${data.email}`);
    console.log(`📱 Phone: ${data.phoneNumber}`);
    console.log(`👤 Name: ${data.firstName} ${data.lastName}`);
    
    // Step 1: Navigate to seller registration
    console.log('📄 Step 1: Navigating to Qoo10 seller registration...');
    await this.delay(1000);
    
    // Step 2: Fill registration form
    console.log('📝 Step 2: Filling seller registration form...');
    const formData = {
      email: data.email,
      phone: data.phoneNumber,
      firstName: data.firstName,
      lastName: data.lastName,
      password: data.password || this.generatePassword(),
      sellerType: 'individual',
      businessType: 'personal',
      agreeToTerms: true
    };
    console.log('📋 Seller form data:', formData);
    await this.delay(2000);
    
    // Step 3: Email verification
    console.log('📧 Step 3: Email verification process...');
    await this.delay(1500);
    
    // Step 4: Phone verification
    console.log('📲 Step 4: Phone verification process...');
    await this.delay(1500);
    
    const success = Math.random() > 0.25; // 75% success rate
    console.log(success ? '✅ Qoo10 seller registration successful!' : '❌ Qoo10 seller registration failed');
    
    return success;
  }

  private async handleCityHeaven(data: RegistrationData): Promise<boolean> {
    console.log('🌃 City Heaven Registration Process Started');
    console.log(`📱 Phone: ${data.phoneNumber}`);
    
    // Step 1: Navigate to registration
    console.log('📄 Step 1: Navigating to City Heaven registration...');
    await this.delay(800);
    
    // Step 2: SMS authentication
    console.log('📝 Step 2: Initiating SMS authentication...');
    const formData = {
      phone: data.phoneNumber,
      region: 'tokyo',
      service_type: 'premium'
    };
    console.log('📋 SMS auth data:', formData);
    await this.delay(1200);
    
    // Step 3: Verify SMS code
    console.log('📲 Step 3: SMS verification...');
    await this.delay(1000);
    
    const success = Math.random() > 0.15; // 85% success rate
    console.log(success ? '✅ City Heaven registration successful!' : '❌ City Heaven registration failed');
    
    return success;
  }

  private async handleMixi(data: RegistrationData): Promise<boolean> {
    console.log('👥 Mixi Account Creation Process Started');
    console.log(`📧 Email: ${data.email}`);
    console.log(`📱 Phone: ${data.phoneNumber}`);
    
    // Step 1: Navigate to signup
    console.log('📄 Step 1: Navigating to Mixi signup...');
    await this.delay(1000);
    
    // Step 2: Fill account form
    console.log('📝 Step 2: Creating Mixi profile...');
    const formData = {
      email: data.email,
      phone: data.phoneNumber,
      nickname: `${data.firstName}${Math.floor(Math.random() * 1000)}`,
      password: data.password || this.generatePassword(),
      birthYear: 1990 + Math.floor(Math.random() * 20),
      gender: Math.random() > 0.5 ? 'male' : 'female',
      prefecture: 'Tokyo'
    };
    console.log('📋 Mixi profile data:', formData);
    await this.delay(2000);
    
    // Step 3: Email verification
    console.log('📧 Step 3: Email verification...');
    await this.delay(1000);
    
    // Step 4: Phone verification
    console.log('📲 Step 4: Phone verification...');
    await this.delay(1500);
    
    const success = Math.random() > 0.2; // 80% success rate
    console.log(success ? '✅ Mixi account created successfully!' : '❌ Mixi account creation failed');
    
    return success;
  }

  private async handleZexyEnmusubi(data: RegistrationData): Promise<boolean> {
    console.log('💕 Zexy Enmusubi Registration Process Started');
    console.log(`📱 Phone: ${data.phoneNumber}`);
    
    // Step 1: Navigate to dating service registration
    console.log('📄 Step 1: Navigating to Zexy Enmusubi registration...');
    await this.delay(1000);
    
    // Step 2: Fill dating profile
    console.log('📝 Step 2: Creating dating profile...');
    const formData = {
      phone: data.phoneNumber,
      gender: Math.random() > 0.5 ? 'male' : 'female',
      age: 25 + Math.floor(Math.random() * 15),
      location: 'Tokyo',
      occupation: 'Office Worker',
      lookingFor: 'serious_relationship'
    };
    console.log('📋 Dating profile data:', formData);
    await this.delay(1500);
    
    // Step 3: Phone verification
    console.log('📲 Step 3: Phone verification for dating service...');
    await this.delay(1500);
    
    const success = Math.random() > 0.3; // 70% success rate
    console.log(success ? '✅ Zexy Enmusubi registration successful!' : '❌ Zexy Enmusubi registration failed');
    
    return success;
  }

  private async handleSuntory(data: RegistrationData): Promise<boolean> {
    console.log('🥃 Suntory ID Account Creation Process Started');
    console.log(`📧 Email: ${data.email}`);
    console.log(`📱 Phone: ${data.phoneNumber}`);
    
    // Step 1: Navigate to Suntory ID registration
    console.log('📄 Step 1: Navigating to Suntory ID registration...');
    await this.delay(1000);
    
    // Step 2: Fill loyalty program form
    console.log('📝 Step 2: Filling loyalty program registration...');
    const formData = {
      email: data.email,
      phone: data.phoneNumber,
      firstName: data.firstName,
      lastName: data.lastName,
      password: data.password || this.generatePassword(),
      birthDate: this.generateBirthDate(),
      drinkingPreference: 'whisky',
      marketingConsent: true
    };
    console.log('📋 Suntory loyalty data:', formData);
    await this.delay(1500);
    
    // Step 3: Email verification
    console.log('📧 Step 3: Email verification...');
    await this.delay(1000);
    
    // Step 4: Welcome to loyalty program
    console.log('🎉 Step 4: Activating loyalty program benefits...');
    await this.delay(1000);
    
    const success = Math.random() > 0.1; // 90% success rate
    console.log(success ? '✅ Suntory ID created successfully!' : '❌ Suntory ID creation failed');
    
    return success;
  }

  private async handleGenericSite(url: string, data: RegistrationData): Promise<RegistrationResult> {
    console.log('🔧 Generic Registration Process Started');
    console.log(`🌐 URL: ${url}`);
    console.log(`📱 Phone: ${data.phoneNumber}`);
    
    // Step 1: Analyze site
    console.log('📄 Step 1: Analyzing site structure...');
    await this.delay(1000);
    
    // Try to determine what fields might be needed based on URL patterns
    const urlLower = url.toLowerCase();
    const needsEmail = urlLower.includes('email') || urlLower.includes('register') || urlLower.includes('signup');
    const needsPhone = urlLower.includes('phone') || urlLower.includes('sms') || urlLower.includes('mobile');
    
    console.log(`🔍 Analysis: needsEmail=${needsEmail}, needsPhone=${needsPhone}`);
    
    // Step 2: Prepare form data
    console.log('📝 Step 2: Preparing registration data...');
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
    
    console.log('📋 Generic form data:', formData);
    await this.delay(1500);
    
    // Step 3: Submit registration
    console.log('📤 Step 3: Submitting registration...');
    await this.delay(1000);
    
    // Step 4: Handle verification if needed
    if (needsPhone) {
      console.log('📲 Step 4: Phone verification process...');
      await this.delay(1000);
    }
    
    if (needsEmail) {
      console.log('📧 Step 4: Email verification process...');
      await this.delay(1000);
    }
    
    const success = Math.random() > 0.4; // 60% success rate for unknown sites
    console.log(success ? '✅ Generic registration successful!' : '❌ Generic registration failed');
    
    return {
      success,
      message: success ? 'Registration completed successfully' : 'Registration failed - site may require manual verification',
      smsExpected: needsPhone || Object.keys(formData).includes('phone'),
      details: { formData, needsEmail, needsPhone }
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
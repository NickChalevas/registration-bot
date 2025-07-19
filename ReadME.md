# AutoReg Pro - Automatic Registration Tool

A powerful, web-based automatic registration tool designed to streamline the process of registering accounts across multiple websites. Built with React, TypeScript, and Tailwind CSS for a modern, responsive user experience.

## 🚀 Features

### Core Functionality
- **Bulk Site Registration**: Upload CSV files containing site lists for automated registration
- **Smart Phone Number Management**: Rotate through multiple phone numbers with SMS tracking
- **Site-Specific Handlers**: Optimized registration logic for popular Japanese sites
- **Real-time Progress Tracking**: Monitor registration status with live statistics
- **Configurable Speed Control**: Adjust registration rate from 10-100 registrations per hour
- **Operating Hours Scheduling**: Set specific time windows for automated operations
- **Retry Logic**: Configurable retry attempts with customizable delays

### Supported Sites
The application includes specialized handlers for:
- **Sekaimon** - Phone number verification
- **Qoo10** - Seller account registration
- **City Heaven** - SMS authentication
- **Mixi** - Social platform registration
- **Zexy Enmusubi** - Dating service registration
- **Suntory** - Brand loyalty program registration

### User Interface
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Statistics**: Live dashboard showing completion rates and progress
- **Status Indicators**: Visual feedback for each registration attempt
- **Error Handling**: Detailed error messages and retry mechanisms
- **Control Panel**: Start, pause, stop, and reset operations with one click

## 📋 Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager
- Modern web browser (Chrome, Firefox, Safari, Edge)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd autoreg-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to access the application

## 📁 CSV File Format

Create a CSV file with the following structure:

```csv
Site Name,URL
Sekaimon,https://www.sekaimon.com/
Qoo10,https://www.qoo10.jp/
City Heaven,https://www.cityheaven.net/
Mixi,https://mixi.co.jp/en/
Zexy Enmusubi,https://zexy-enmusubi.net/
Suntory,https://www.suntory.co.jp/
```

### Required Columns
- **Site Name**: Display name for the website
- **URL**: Full URL to the registration page

## 🔧 Configuration

### Registration Speed
- **Range**: 10-100 registrations per hour
- **Default**: 30 registrations per hour
- **Calculation**: Automatic delay calculation between attempts

### Operating Hours
- **Format**: 24-hour time (HH:MM)
- **Default**: 09:00 - 17:00
- **Purpose**: Limit registration activity to business hours

### Retry Settings
- **Max Retries**: 1-10 attempts per site (default: 3)
- **Delay**: 1-30 seconds between retry attempts (default: 5)

### Phone Number Management
- **Multiple Numbers**: Add unlimited phone numbers
- **Active/Inactive Toggle**: Enable/disable specific numbers
- **SMS Tracking**: Monitor SMS reception count
- **Rotation**: Automatic cycling through active numbers

## 🎯 Usage Guide

### Step 1: Upload Site List
1. Click "Browse CSV" or drag and drop your CSV file
2. Verify the site list appears correctly
3. Check that all URLs are valid and accessible

### Step 2: Configure Phone Numbers
1. Enter phone numbers in international format (+1234567890)
2. Click "Add Phone" to include in rotation
3. Toggle active/inactive status as needed
4. Monitor SMS reception counts

### Step 3: Adjust Settings
1. Set desired registration speed (registrations per hour)
2. Configure operating hours for automated runs
3. Adjust retry settings based on site reliability
4. Set appropriate delays between attempts

### Step 4: Start Registration
1. Ensure at least one active phone number is available
2. Click "Start Registration" to begin the process
3. Monitor progress through the real-time dashboard
4. Use pause/resume functionality as needed

### Step 5: Monitor Results
- **Green Status**: Successful registration
- **Red Status**: Failed registration (check error messages)
- **Blue Status**: Currently processing
- **Yellow Status**: Pending registration

## 🏗️ Architecture

### Frontend Components
- **Header**: Application branding and status indicators
- **FileUpload**: CSV file processing and validation
- **SiteList**: Registration status display and management
- **PhoneNumberManager**: Phone number configuration
- **RegistrationConfig**: Speed and timing settings
- **ControlPanel**: Start/stop/pause operations
- **RegistrationStats**: Real-time progress dashboard

### Core Services
- **RegistrationEngine**: Main registration logic and site handlers
- **Site Handlers**: Specialized registration logic for each supported site
- **Data Validation**: Ensures required fields are available
- **Error Handling**: Comprehensive error management and reporting

### State Management
- **React Hooks**: Custom hooks for registration engine integration
- **Local State**: Component-level state management
- **Real-time Updates**: Live status updates and progress tracking

## 🔒 Security Considerations

### Data Protection
- **No Data Storage**: Registration data is not permanently stored
- **Local Processing**: All operations happen in the browser
- **Temporary Data**: Phone numbers and settings are session-based

### Rate Limiting
- **Configurable Speed**: Prevents overwhelming target sites
- **Random Delays**: Human-like behavior simulation
- **Operating Hours**: Limits activity to appropriate times

### Error Handling
- **Graceful Failures**: Continues operation despite individual failures
- **Detailed Logging**: Comprehensive error reporting
- **Retry Logic**: Automatic retry with exponential backoff

## 🚀 Development

### Project Structure
```
src/
├── components/          # React components
├── hooks/              # Custom React hooks
├── services/           # Business logic and API services
├── types/              # TypeScript type definitions
└── styles/             # CSS and styling files
```

### Key Technologies
- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Fast build tool and development server
- **Lucide React**: Modern icon library

### Build Commands
```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 📊 Performance

### Optimization Features
- **Lazy Loading**: Components loaded on demand
- **Efficient Rendering**: Optimized React rendering patterns
- **Memory Management**: Proper cleanup and garbage collection
- **Responsive Design**: Optimized for all device sizes

### Monitoring
- **Real-time Stats**: Live performance metrics
- **Error Tracking**: Comprehensive error logging
- **Success Rates**: Registration success analytics
- **Time Estimates**: Accurate completion time predictions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

This tool is designed for legitimate registration purposes only. Users are responsible for:
- Complying with website terms of service
- Respecting rate limits and usage policies
- Ensuring legal compliance in their jurisdiction
- Using accurate and truthful information

## 🆘 Support

For support, feature requests, or bug reports:
1. Check the existing issues in the repository
2. Create a new issue with detailed information
3. Include steps to reproduce any problems
4. Provide relevant error messages and logs

## 🔄 Version History

### v1.0.0 (Current)
- Initial release with core registration functionality
- Support for 6 major Japanese websites
- Responsive web interface
- Phone number management system
- Configurable registration settings
- Real-time progress tracking

---

**AutoReg Pro** - Streamlining registration processes with intelligent automation.

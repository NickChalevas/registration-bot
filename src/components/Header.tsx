import React from 'react';
import { Bot, Shield, Zap } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Bot className="h-8 w-8 text-white mr-3" />
            <h1 className="text-2xl font-bold">AutoReg Pro</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm">
              <Shield className="h-4 w-4 mr-1" />
              <span>Secure</span>
            </div>
            <div className="flex items-center text-sm">
              <Zap className="h-4 w-4 mr-1" />
              <span>Fast</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
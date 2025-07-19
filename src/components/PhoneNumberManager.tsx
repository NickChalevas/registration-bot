import React, { useState } from 'react';
import { Phone, Plus, Trash2, RotateCcw } from 'lucide-react';
import { PhoneNumber } from '../types/registration';

interface PhoneNumberManagerProps {
  phoneNumbers: PhoneNumber[];
  onPhoneNumbersChange: (phoneNumbers: PhoneNumber[]) => void;
}

export const PhoneNumberManager: React.FC<PhoneNumberManagerProps> = ({
  phoneNumbers,
  onPhoneNumbersChange
}) => {
  const [newPhoneNumber, setNewPhoneNumber] = useState('');

  const addPhoneNumber = () => {
    if (newPhoneNumber.trim()) {
      const phoneNumber: PhoneNumber = {
        id: crypto.randomUUID(),
        number: newPhoneNumber.trim(),
        isActive: true,
        smsReceived: 0
      };
      
      onPhoneNumbersChange([...phoneNumbers, phoneNumber]);
      setNewPhoneNumber('');
    }
  };

  const removePhoneNumber = (id: string) => {
    onPhoneNumbersChange(phoneNumbers.filter(phone => phone.id !== id));
  };

  const togglePhoneNumber = (id: string) => {
    onPhoneNumbersChange(
      phoneNumbers.map(phone =>
        phone.id === id ? { ...phone, isActive: !phone.isActive } : phone
      )
    );
  };

  const resetSmsCount = (id: string) => {
    onPhoneNumbersChange(
      phoneNumbers.map(phone =>
        phone.id === id ? { ...phone, smsReceived: 0 } : phone
      )
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <Phone className="h-5 w-5 mr-2" />
        Phone Number Management
      </h2>
      
      <div className="flex gap-2 mb-4">
        <input
          type="tel"
          value={newPhoneNumber}
          onChange={(e) => setNewPhoneNumber(e.target.value)}
          placeholder="Enter phone number (e.g., +1234567890)"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={addPhoneNumber}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </button>
      </div>
      
      <div className="space-y-2">
        {phoneNumbers.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No phone numbers added yet</p>
        ) : (
          phoneNumbers.map((phone) => (
            <div
              key={phone.id}
              className={`p-3 rounded-lg border ${
                phone.isActive ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="font-medium text-gray-800">{phone.number}</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    phone.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {phone.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    SMS: {phone.smsReceived}
                  </span>
                  <button
                    onClick={() => resetSmsCount(phone.id)}
                    className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                    title="Reset SMS count"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => togglePhoneNumber(phone.id)}
                    className={`px-2 py-1 rounded text-xs ${
                      phone.isActive
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    {phone.isActive ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => removePhoneNumber(phone.id)}
                    className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                    title="Remove phone number"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {phone.lastUsed && (
                <p className="text-xs text-gray-500 mt-1">
                  Last used: {phone.lastUsed.toLocaleString()}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
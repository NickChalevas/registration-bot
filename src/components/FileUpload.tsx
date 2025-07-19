import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Site } from '../types/registration';

interface FileUploadProps {
  onSitesLoad: (sites: Site[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onSitesLoad }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const processCsvFile = useCallback((file: File) => {
    setUploadStatus('processing');
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        // Validate required columns
        const requiredColumns = ['site_name', 'url'];
        const missingColumns = requiredColumns.filter(col => !headers.includes(col));
        
        if (missingColumns.length > 0) {
          throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
        }
        
        const sites: Site[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
          const siteNameIndex = headers.indexOf('site_name');
          const urlIndex = headers.indexOf('url');
          
          if (values[siteNameIndex] && values[urlIndex]) {
            sites.push({
              id: crypto.randomUUID(),
              name: values[siteNameIndex],
              url: values[urlIndex],
              status: 'pending'
            });
          }
        }
        
        if (sites.length === 0) {
          throw new Error('No valid sites found in CSV file');
        }
        
        onSitesLoad(sites);
        setUploadStatus('success');
        setErrorMessage('');
      } catch (error) {
        setUploadStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Failed to process CSV file');
      }
    };
    
    reader.readAsText(file);
  }, [onSitesLoad]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(file => file.name.endsWith('.csv'));
    
    if (csvFile) {
      processCsvFile(csvFile);
    } else {
      setUploadStatus('error');
      setErrorMessage('Please upload a CSV file');
    }
  }, [processCsvFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processCsvFile(file);
    }
  }, [processCsvFile]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Site List</h2>
      
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? 'border-blue-400 bg-blue-50'
            : uploadStatus === 'success'
            ? 'border-green-400 bg-green-50'
            : uploadStatus === 'error'
            ? 'border-red-400 bg-red-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setIsDragOver(true)}
        onDragLeave={() => setIsDragOver(false)}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
          id="csv-upload"
        />
        
        <label htmlFor="csv-upload" className="cursor-pointer">
          <div className="flex flex-col items-center">
            {uploadStatus === 'processing' ? (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            ) : uploadStatus === 'success' ? (
              <CheckCircle className="h-12 w-12 text-green-500" />
            ) : uploadStatus === 'error' ? (
              <AlertCircle className="h-12 w-12 text-red-500" />
            ) : (
              <Upload className="h-12 w-12 text-gray-400" />
            )}
            
            <p className="mt-4 text-lg font-medium text-gray-700">
              {uploadStatus === 'processing'
                ? 'Processing CSV file...'
                : uploadStatus === 'success'
                ? 'CSV file uploaded successfully!'
                : uploadStatus === 'error'
                ? 'Upload failed'
                : 'Drop CSV file here or click to browse'}
            </p>
            
            {uploadStatus === 'idle' && (
              <p className="mt-2 text-sm text-gray-500">
                CSV should contain columns: Site Name, URL
              </p>
            )}
            
            {uploadStatus === 'error' && (
              <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
            )}
          </div>
        </label>
      </div>
      
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-700 mb-2 flex items-center">
          <FileText className="h-4 w-4 mr-2" />
          CSV Format Example:
        </h3>
        <pre className="text-sm text-gray-600 bg-white p-3 rounded border">
{`Site Name,URL
Example Site,https://example.com/register
Another Site,https://another.com/signup`}
        </pre>
      </div>
    </div>
  );
};
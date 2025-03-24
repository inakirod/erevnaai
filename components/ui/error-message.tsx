import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  suggestion?: string;
}

export function ErrorMessage({ message, suggestion }: ErrorMessageProps) {
  return (
    <div className="flex flex-col gap-2 p-4 border border-red-200 bg-red-50 rounded-md text-red-800">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-5 w-5" />
        <span className="font-medium">{message}</span>
      </div>
      {suggestion && (
        <p className="text-sm text-red-600 ml-7">{suggestion}</p>
      )}
    </div>
  );
} 
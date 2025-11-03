'use client';

import { useEffect } from 'react';

export default function Toast({
  message,
  type = 'info',
  duration = 3000,
  onClose,
}: {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  return (
    <div className={`fixed top-4 right-4 z-50 border rounded-lg shadow-lg p-4 ${colors[type]}`}>
      <div className="flex items-center gap-3">
        <span>{message}</span>
        <button onClick={onClose} className="font-bold">
          ✕
        </button>
      </div>
    </div>
  );
}

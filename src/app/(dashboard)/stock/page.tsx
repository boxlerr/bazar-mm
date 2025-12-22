import { Metadata } from 'next';
import StockContent from './content';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Stock',
};

export default function StockPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Cargando...</p>
        </div>
      </div>
    }>
      <StockContent />
    </Suspense>
  );
}

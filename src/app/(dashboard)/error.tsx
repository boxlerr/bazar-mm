'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-6 p-8 text-center">
            <div className="rounded-full bg-red-50 p-4 text-red-600">
                <AlertTriangle size={48} />
            </div>
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">Algo salió mal</h2>
                <p className="text-gray-500 max-w-md mx-auto">
                    Ha ocurrido un error inesperado. Por favor, intenta recargar la página.
                </p>
            </div>
            <div className="flex gap-4">
                <Button
                    onClick={() => window.location.reload()}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-900"
                >
                    Recargar página
                </Button>
                <Button
                    onClick={() => reset()}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    Intentar de nuevo
                </Button>
            </div>
        </div>
    );
}

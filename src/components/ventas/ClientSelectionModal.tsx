'use client';

import Modal from '@/components/ui/Modal';
import ClientsList from '@/components/clientes/ClientsList';
import { Cliente } from '@/types/cliente';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface ClientSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (cliente: Cliente) => void;
}

export default function ClientSelectionModal({ isOpen, onClose, onSelect }: ClientSelectionModalProps) {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && clientes.length === 0) {
            fetchClientes();
        }
    }, [isOpen]);

    const fetchClientes = async () => {
        setLoading(true);
        const supabase = createClient();
        const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .eq('activo', true)
            .order('nombre', { ascending: true });

        if (data) {
            setClientes(data as Cliente[]);
        }
        setLoading(false);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Seleccionar Cliente"
            maxWidth="max-w-5xl"
        >
            <div>
                {loading ? (
                    <div className="flex justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div>
                        <ClientsList
                            initialClientes={clientes}
                            onSelect={(cliente) => {
                                onSelect(cliente);
                                onClose();
                            }}
                        />
                    </div>
                )}
            </div>
        </Modal >
    );
}

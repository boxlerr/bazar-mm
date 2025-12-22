import { Metadata } from 'next';
import ProveedoresContent from './content';

export const metadata: Metadata = {
    title: 'Proveedores',
};

export default function ProveedoresPage() {
    return <ProveedoresContent />;
}

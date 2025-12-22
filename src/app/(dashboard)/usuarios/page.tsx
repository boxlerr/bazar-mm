import { Metadata } from 'next';
import UsuariosContent from './content';

export const metadata: Metadata = {
  title: 'Usuarios',
};

export default function UsuariosPage() {
  return <UsuariosContent />;
}

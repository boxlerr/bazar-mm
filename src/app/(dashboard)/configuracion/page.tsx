import { Metadata } from 'next';
import ConfiguracionContent from './content';

export const metadata: Metadata = {
  title: 'Configuración',
};

export default function ConfiguracionPage() {
  return <ConfiguracionContent />;
}

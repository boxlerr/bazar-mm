import { Metadata } from 'next';
import CajaContent from './content';

export const metadata: Metadata = {
  title: 'Caja',
};

export default function CajaPage() {
  return <CajaContent />;
}

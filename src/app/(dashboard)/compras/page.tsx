import { Metadata } from 'next';
import ComprasContent from './content';

export const metadata: Metadata = {
  title: 'Compras',
};

export default function ComprasPage() {
  return <ComprasContent />;
}

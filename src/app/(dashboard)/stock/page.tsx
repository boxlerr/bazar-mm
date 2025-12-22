import { Metadata } from 'next';
import StockContent from './content';

export const metadata: Metadata = {
  title: 'Stock',
};

export default function StockPage() {
  return <StockContent />;
}

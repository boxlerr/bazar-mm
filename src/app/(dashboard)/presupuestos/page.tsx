import { Suspense } from 'react';
import BudgetList from '@/components/presupuestos/BudgetList';
import { getBudgets } from './actions';

export const dynamic = 'force-dynamic';

export default async function PresupuestosPage() {
    const budgets = await getBudgets();

    return (
        <div className="p-6">
            <Suspense fallback={<div>Cargando presupuestos...</div>}>
                <BudgetList initialBudgets={budgets} />
            </Suspense>
        </div>
    );
}

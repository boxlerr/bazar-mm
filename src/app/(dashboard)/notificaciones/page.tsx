import { createClient } from '@/lib/supabase/server';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Check, Trash2, Bell, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { redirect } from 'next/navigation';

export const metadata = {
    title: 'Notificaciones',
};

export default async function NotificacionesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: notifications } = await supabase
        .from('notificaciones')
        .select('*')
        .eq('usuario_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Notificaciones</h1>
                    <p className="text-neutral-500 mt-1">Historial de alertas y eventos del sistema</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
                {notifications && notifications.length > 0 ? (
                    <div className="divide-y divide-neutral-100">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={cn(
                                    "p-6 hover:bg-neutral-50 transition-colors flex gap-4 items-start",
                                    !notification.leida && "bg-blue-50/30"
                                )}
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                                    notification.tipo === 'success' && "bg-green-100 text-green-600",
                                    notification.tipo === 'warning' && "bg-yellow-100 text-yellow-600",
                                    notification.tipo === 'error' && "bg-red-100 text-red-600",
                                    notification.tipo === 'info' && "bg-blue-100 text-blue-600",
                                )}>
                                    <Bell className="w-5 h-5" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start gap-4">
                                        <h3 className={cn(
                                            "text-base text-neutral-900",
                                            !notification.leida ? "font-semibold" : "font-medium"
                                        )}>
                                            {notification.titulo}
                                        </h3>
                                        <span className="text-xs text-neutral-400 whitespace-nowrap shrink-0">
                                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: es })}
                                        </span>
                                    </div>
                                    <p className="text-neutral-600 mt-1 leading-relaxed">
                                        {notification.mensaje}
                                    </p>

                                    {notification.link && (
                                        <Link
                                            href={notification.link}
                                            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 mt-3"
                                        >
                                            Ver detalles
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center text-neutral-500">
                        <Bell className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
                        <h3 className="text-lg font-medium text-neutral-900 mb-1">Sin notificaciones</h3>
                        <p>No tienes notificaciones recientes en el sistema.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

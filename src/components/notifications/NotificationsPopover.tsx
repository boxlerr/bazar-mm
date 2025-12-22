'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Notification {
    id: string;
    titulo: string;
    mensaje: string;
    tipo: 'info' | 'warning' | 'success' | 'error';
    leida: boolean;
    created_at: string;
    link?: string;
}

export default function NotificationsPopover() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
    const router = useRouter();

    const fetchNotifications = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('notificaciones')
                .select('*')
                .eq('usuario_id', user.id)
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;

            setNotifications(data || []);
            setUnreadCount(data?.filter(n => !n.leida).length || 0);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    }, []); // Removed supabase dependency to prevent infinite loop

    useEffect(() => {
        fetchNotifications();

        // Polling every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);

        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const markAsRead = async (id: string) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));

        try {
            await supabase
                .from('notificaciones')
                .update({ leida: true })
                .eq('id', id);
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.leida) {
            await markAsRead(notification.id);
        }

        setIsOpen(false);

        if (notification.link) {
            router.push(notification.link);
        }
    };

    const clearAll = async () => {
        // Optimistic update
        setNotifications([]);
        setUnreadCount(0);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            await supabase
                .from('notificaciones')
                .delete()
                .eq('usuario_id', user.id);

            toast.success('Notificaciones borradas');
        } catch (error) {
            console.error('Error clearing notifications:', error);
            toast.error('Error al borrar notificaciones');
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors outline-none"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-neutral-200 z-50 overflow-hidden"
                        >
                            <div className="flex items-center justify-between p-4 border-b border-neutral-100 bg-neutral-50/50">
                                <h3 className="font-semibold text-sm text-neutral-900">Notificaciones</h3>
                                {notifications.length > 0 && (
                                    <button
                                        onClick={clearAll}
                                        className="text-xs text-neutral-500 hover:text-red-600 transition-colors flex items-center gap-1"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                        Borrar todo
                                    </button>
                                )}
                            </div>

                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                {loading ? (
                                    <div className="p-8 text-center text-neutral-400">
                                        <div className="w-6 h-6 border-2 border-neutral-300 border-t-red-500 rounded-full animate-spin mx-auto mb-2"></div>
                                        <p className="text-xs">Cargando...</p>
                                    </div>
                                ) : notifications.length === 0 ? (
                                    <div className="p-8 text-center text-neutral-500">
                                        <Bell className="w-8 h-8 mx-auto mb-3 text-neutral-300" />
                                        <p className="text-sm">No tienes notificaciones</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-neutral-100">
                                        {notifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                onClick={() => handleNotificationClick(notification)}
                                                className={cn(
                                                    "p-4 hover:bg-neutral-50 transition-colors relative group cursor-pointer",
                                                    !notification.leida && "bg-blue-50/30"
                                                )}
                                            >
                                                <div className="flex gap-3">
                                                    <div className={cn(
                                                        "w-2 h-2 mt-1.5 rounded-full shrink-0",
                                                        notification.tipo === 'success' && "bg-green-500",
                                                        notification.tipo === 'warning' && "bg-yellow-500",
                                                        notification.tipo === 'error' && "bg-red-500",
                                                        notification.tipo === 'info' && "bg-blue-500",
                                                    )} />
                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex justify-between items-start">
                                                            <p className={cn(
                                                                "text-sm text-neutral-900 leading-none",
                                                                !notification.leida ? "font-semibold" : "font-medium"
                                                            )}>
                                                                {notification.titulo}
                                                            </p>
                                                            <span className="text-[10px] text-neutral-400 whitespace-nowrap ml-2">
                                                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: es })}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2">
                                                            {notification.mensaje}
                                                        </p>
                                                    </div>
                                                </div>
                                                {!notification.leida && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            markAsRead(notification.id);
                                                        }}
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-50 rounded-full"
                                                        title="Marcar como leída"
                                                    >
                                                        <Check className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="p-2 border-t border-neutral-100 bg-neutral-50/50 text-center">
                                <a
                                    href="/notificaciones"
                                    className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Ver todas las notificaciones
                                </a>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div >
    );
}

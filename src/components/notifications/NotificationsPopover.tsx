'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, Check, Trash2, BellOff, ExternalLink } from 'lucide-react';
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

const typeConfig = {
    success: { dot: 'bg-emerald-500', bg: 'bg-emerald-50', ring: 'ring-emerald-500/20' },
    warning: { dot: 'bg-amber-500', bg: 'bg-amber-50', ring: 'ring-amber-500/20' },
    error: { dot: 'bg-red-500', bg: 'bg-red-50', ring: 'ring-red-500/20' },
    info: { dot: 'bg-blue-500', bg: 'bg-blue-50', ring: 'ring-blue-500/20' },
};

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
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const markAsRead = async (id: string) => {
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
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "relative p-2 rounded-xl transition-all duration-200 outline-none",
                    isOpen
                        ? "bg-neutral-100 text-neutral-700"
                        : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100/80"
                )}
            >
                <Bell className={cn("w-[18px] h-[18px] transition-transform duration-200", isOpen && "scale-110")} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex items-center justify-center">
                        <span className="absolute w-2.5 h-2.5 bg-red-500 rounded-full animate-ping opacity-30" />
                        <span className="relative w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Popover */}
                        <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.96 }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                            className="absolute right-0 mt-2 w-80 sm:w-[380px] bg-white rounded-2xl shadow-xl shadow-neutral-200/50 border border-neutral-200/60 z-50 overflow-hidden"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-sm text-neutral-800">Notificaciones</h3>
                                    {unreadCount > 0 && (
                                        <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-md">
                                            {unreadCount}
                                        </span>
                                    )}
                                </div>
                                {notifications.length > 0 && (
                                    <button
                                        onClick={clearAll}
                                        className="text-[11px] text-neutral-400 hover:text-red-500 transition-colors flex items-center gap-1 font-medium px-2 py-1 rounded-lg hover:bg-red-50/80"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                        Borrar todo
                                    </button>
                                )}
                            </div>

                            {/* Content */}
                            <div className="max-h-[380px] overflow-y-auto notification-scrollbar">
                                {loading ? (
                                    <div className="p-10 text-center">
                                        <div className="w-5 h-5 border-2 border-neutral-200 border-t-red-500 rounded-full animate-spin mx-auto mb-3" />
                                        <p className="text-xs text-neutral-400">Cargando...</p>
                                    </div>
                                ) : notifications.length === 0 ? (
                                    <div className="py-12 px-6 text-center">
                                        <div className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                            <BellOff className="w-5 h-5 text-neutral-300" />
                                        </div>
                                        <p className="text-sm font-medium text-neutral-500">Sin notificaciones</p>
                                        <p className="text-xs text-neutral-400 mt-1">Estás al día</p>
                                    </div>
                                ) : (
                                    <div>
                                        {notifications.map((notification, index) => {
                                            const config = typeConfig[notification.tipo] || typeConfig.info;
                                            return (
                                                <motion.div
                                                    key={notification.id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: index * 0.03 }}
                                                    onClick={() => handleNotificationClick(notification)}
                                                    className={cn(
                                                        "px-4 py-3 transition-all duration-150 relative group cursor-pointer border-b border-neutral-50 last:border-b-0",
                                                        !notification.leida
                                                            ? "bg-neutral-50/50 hover:bg-neutral-100/60"
                                                            : "hover:bg-neutral-50"
                                                    )}
                                                >
                                                    <div className="flex gap-3">
                                                        {/* Type indicator */}
                                                        <div className="pt-0.5 flex-shrink-0">
                                                            <div className={cn(
                                                                "w-2 h-2 rounded-full ring-2",
                                                                config.dot,
                                                                !notification.leida ? config.ring : "ring-transparent opacity-50"
                                                            )} />
                                                        </div>

                                                        {/* Content */}
                                                        <div className="flex-1 min-w-0 space-y-0.5">
                                                            <div className="flex justify-between items-start gap-2">
                                                                <p className={cn(
                                                                    "text-[13px] text-neutral-800 leading-snug",
                                                                    !notification.leida ? "font-semibold" : "font-medium"
                                                                )}>
                                                                    {notification.titulo}
                                                                </p>
                                                                <span className="text-[10px] text-neutral-400 whitespace-nowrap flex-shrink-0 pt-0.5">
                                                                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: es })}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2">
                                                                {notification.mensaje}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Mark as read button */}
                                                    {!notification.leida && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                markAsRead(notification.id);
                                                            }}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-neutral-400 opacity-0 group-hover:opacity-100 transition-all duration-150 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg"
                                                            title="Marcar como leída"
                                                        >
                                                            <Check className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            {notifications.length > 0 && (
                                <div className="px-4 py-2.5 border-t border-neutral-100 text-center">
                                    <a
                                        href="/notificaciones"
                                        className="text-xs font-medium text-neutral-500 hover:text-red-500 transition-colors inline-flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-red-50/60"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Ver todas las notificaciones
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Custom scrollbar */}
            <style jsx global>{`
                .notification-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .notification-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .notification-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0, 0, 0, 0.08);
                    border-radius: 4px;
                }
                .notification-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(0, 0, 0, 0.15);
                }
            `}</style>
        </div>
    );
}

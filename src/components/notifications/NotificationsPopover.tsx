'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
    read: boolean;
    created_at: string;
    link?: string;
}

export default function NotificationsPopover() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const supabase = createClient();

    useEffect(() => {
        // Mock notifications for now, or fetch from DB if table exists
        // For now we'll just show a "System Ready" notification
        setNotifications([
            {
                id: '1',
                title: 'Sistema Actualizado',
                message: 'Las copias de seguridad y el historial de stock están activos.',
                type: 'success',
                read: false,
                created_at: new Date().toISOString(),
            }
        ]);
        setUnreadCount(1);
    }, []);

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const clearAll = () => {
        setNotifications([]);
        setUnreadCount(0);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors outline-none"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
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
                            className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-neutral-200 z-50 overflow-hidden"
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

                            <div className="max-h-[400px] overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-neutral-500">
                                        <Bell className="w-8 h-8 mx-auto mb-3 text-neutral-300" />
                                        <p className="text-sm">No tienes notificaciones</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-neutral-100">
                                        {notifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                className={cn(
                                                    "p-4 hover:bg-neutral-50 transition-colors relative group",
                                                    !notification.read && "bg-blue-50/30"
                                                )}
                                            >
                                                <div className="flex gap-3">
                                                    <div className={cn(
                                                        "w-2 h-2 mt-1.5 rounded-full shrink-0",
                                                        notification.type === 'success' && "bg-green-500",
                                                        notification.type === 'warning' && "bg-yellow-500",
                                                        notification.type === 'error' && "bg-red-500",
                                                        notification.type === 'info' && "bg-blue-500",
                                                    )} />
                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex justify-between items-start">
                                                            <p className="text-sm font-medium text-neutral-900 leading-none">
                                                                {notification.title}
                                                            </p>
                                                            <span className="text-[10px] text-neutral-400">
                                                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: es })}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-neutral-500 leading-relaxed">
                                                            {notification.message}
                                                        </p>
                                                    </div>
                                                </div>
                                                {!notification.read && (
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
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

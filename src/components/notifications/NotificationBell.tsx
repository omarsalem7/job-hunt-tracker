import React, { useState, useRef, useEffect } from 'react';
import {
    useNotificationsQuery,
    useMarkFollowedUp,
    useSnoozeFollowUp,
} from '../../hooks/useNotifications';
import {
    BellIcon,
    ClockIcon,
    CheckIcon,
    XIcon,
} from '../common/Icons';
import type { Application, FollowUpStatus } from '../../types';

interface NotificationBellProps {
    onSelectApplication?: (app: Application) => void;
}

function getDaysAgo(dateString?: string | null): string {
    if (!dateString) return '';
    const diff = Date.now() - new Date(dateString).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days <= 0) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
}

function getStatusBadge(status?: FollowUpStatus | null) {
    switch (status) {
        case 'NEEDS_FIRST_FOLLOW_UP':
            return {
                label: '1st Follow-Up Due',
                badgeClass:
                    'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
                dotClass: 'bg-blue-500',
            };
        case 'NEEDS_SECOND_FOLLOW_UP':
            return {
                label: '2nd Follow-Up Due',
                badgeClass:
                    'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
                dotClass: 'bg-amber-500',
            };
        case 'STALE_GHOSTED':
            return {
                label: 'Stale / Ghosted',
                badgeClass:
                    'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
                dotClass: 'bg-rose-500',
            };
        default:
            return {
                label: 'Follow-Up Needed',
                badgeClass:
                    'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700',
                dotClass: 'bg-gray-400',
            };
    }
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
    onSelectApplication,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const { data, isLoading } = useNotificationsQuery();
    const markFollowedUp = useMarkFollowedUp();
    const snoozeFollowUp = useSnoozeFollowUp();

    const count = data?.count ?? 0;
    const items = data?.items ?? [];

    // Close on click outside and escape key
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    const handleMarkDone = (e: React.MouseEvent, appId: string | number) => {
        e.stopPropagation();
        markFollowedUp.mutate(appId);
    };

    const handleSnooze = (e: React.MouseEvent, appId: string | number) => {
        e.stopPropagation();
        snoozeFollowUp.mutate({ id: appId, days: 7 });
    };

    const handleItemClick = (app: Application) => {
        if (onSelectApplication) {
            onSelectApplication(app);
            setIsOpen(false);
        }
    };

    return (
        <div ref={containerRef} className="relative inline-block text-left">
            {/* Bell Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className={`relative rounded-lg border border-(--border) p-2 text-xs font-medium cursor-pointer transition-all shadow-xs ${
                    isOpen
                        ? 'bg-blue-50 text-blue-600 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700'
                        : 'bg-(--card-bg) text-(--text-muted) hover:text-(--text) hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                title={count > 0 ? `${count} follow-up reminders` : 'Follow-up radar'}
                aria-label="Open follow-up notifications"
                aria-expanded={isOpen}
            >
                <BellIcon size={16} />

                {/* Badge Counter */}
                {count > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-xs animate-in fade-in zoom-in-75">
                        {count > 9 ? '9+' : count}
                    </span>
                )}
            </button>

            {/* Popover Flyout */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-(--border) bg-(--card-bg) shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-(--border) px-4 py-3 bg-(--bg)/50">
                        <div className="flex items-center gap-2">
                            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                            <h3 className="text-xs font-semibold text-(--text) tracking-wide">
                                Follow-Up Radar
                            </h3>
                            {count > 0 && (
                                <span className="rounded-full bg-rose-100 dark:bg-rose-900/50 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:text-rose-300">
                                    {count} pending
                                </span>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer p-0.5 rounded"
                            aria-label="Close notifications popover"
                        >
                            <XIcon size={14} />
                        </button>
                    </div>

                    {/* Notification Feed */}
                    <div className="max-h-[360px] overflow-y-auto divide-y divide-(--border)">
                        {isLoading ? (
                            <div className="p-6 text-center text-xs text-(--text-muted) flex flex-col items-center gap-2">
                                <div className="h-4 w-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                                <span>Scanning applied roles...</span>
                            </div>
                        ) : items.length === 0 ? (
                            <div className="p-8 text-center flex flex-col items-center justify-center gap-2 text-(--text-muted)">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                                    <CheckIcon size={20} />
                                </div>
                                <p className="text-xs font-medium text-(--text)">All caught up!</p>
                                <p className="text-[11px] max-w-[220px]">
                                    No pending applications require follow-up right now.
                                </p>
                            </div>
                        ) : (
                            items.map((app) => {
                                const badge = getStatusBadge(app.followUpStatus);
                                const isActioning =
                                    markFollowedUp.isPending || snoozeFollowUp.isPending;

                                return (
                                    <div
                                        key={app.id}
                                        onClick={() => handleItemClick(app)}
                                        className="p-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors cursor-pointer group"
                                    >
                                        <div className="flex items-start justify-between gap-2 mb-1.5">
                                            <div className="min-w-0">
                                                <h4 className="text-xs font-bold text-(--text) truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                    {app.company}
                                                </h4>
                                                <p className="text-[11px] text-(--text-muted) truncate">
                                                    {app.role}
                                                </p>
                                            </div>

                                            {/* Status Badge */}
                                            <span
                                                className={`inline-flex items-center gap-1 shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badge.badgeClass}`}
                                            >
                                                <span
                                                    className={`h-1.5 w-1.5 rounded-full ${badge.dotClass}`}
                                                />
                                                {badge.label}
                                            </span>
                                        </div>

                                        {/* Metadata Row */}
                                        <div className="flex items-center justify-between text-[10px] text-(--text-muted) mt-2 pt-2 border-t border-(--border)/50">
                                            <span>
                                                Applied {getDaysAgo(app.appliedDate)}
                                                {app.lastFollowUpAt &&
                                                    ` · Followed up ${getDaysAgo(app.lastFollowUpAt)}`}
                                            </span>

                                            {/* Quick Actions */}
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <button
                                                    type="button"
                                                    disabled={isActioning}
                                                    onClick={(e) => handleMarkDone(e, app.id)}
                                                    className="inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 cursor-pointer transition-colors"
                                                    title="Mark this role as followed-up today"
                                                >
                                                    <CheckIcon size={10} />
                                                    <span>Done</span>
                                                </button>

                                                <button
                                                    type="button"
                                                    disabled={isActioning}
                                                    onClick={(e) => handleSnooze(e, app.id)}
                                                    className="inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-(--border) cursor-pointer transition-colors"
                                                    title="Snooze reminder for 7 days"
                                                >
                                                    <ClockIcon size={10} />
                                                    <span>Snooze 7d</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer / Status Indicator */}
                    <div className="border-t border-(--border) bg-(--bg)/40 px-4 py-2 text-[10px] text-(--text-muted) flex items-center justify-between">
                        <span>Click card to inspect in drawer</span>
                        <span>Auto-updates in real time</span>
                    </div>
                </div>
            )}
        </div>
    );
};

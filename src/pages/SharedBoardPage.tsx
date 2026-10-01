import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSharedBoardQuery } from '../hooks/useShare';
import { useTheme } from '../hooks/useTheme';
import { TagBadge } from '../components/tags/TagBadge';
import {
  BriefcaseIcon,
  SunIcon,
  MoonIcon,
  ClockIcon,
  ShieldIcon,
  MailIcon,
  PhoneIcon,
  ExternalLinkIcon,
  FileTextIcon,
  UserIcon,
  XIcon,
} from '../components/common/Icons';
import type { SharedApplication } from '../types/share';

const STAGE_CONFIG = {
  applied: { label: 'Applied', dotColor: 'bg-blue-500' },
  interviewing: { label: 'Interviewing', dotColor: 'bg-amber-500' },
  offer: { label: 'Offer', dotColor: 'bg-emerald-500' },
  rejected: { label: 'Rejected', dotColor: 'bg-rose-500' },
};

export function SharedBoardPage() {
  const { token } = useParams<{ token: string }>();
  const { theme, toggleTheme } = useTheme();
  const { data, isLoading, isError, error } = useSharedBoardQuery(token);
  const [selectedApp, setSelectedApp] = useState<SharedApplication | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-(--bg) text-(--text) flex flex-col items-center justify-center p-6">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <span className="text-sm font-medium text-(--text-muted)">
            Loading shared job board...
          </span>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isExpired = errorMessage.toLowerCase().includes('expired') || errorMessage.includes('410');

    return (
      <div className="min-h-screen bg-(--bg) text-(--text) flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl border border-(--border) bg-(--card-bg) p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
            {isExpired ? <ClockIcon size={28} /> : <ShieldIcon size={28} />}
          </div>
          <h2 className="text-lg font-bold tracking-tight text-(--text) mb-2">
            {isExpired ? 'Share Link Expired' : 'Board Unavailable'}
          </h2>
          <p className="text-xs text-(--text-muted) leading-relaxed mb-6">
            {isExpired
              ? 'This shareable link has expired. Please reach out to the board owner to request a newly generated share link.'
              : 'This shared board could not be found or has been revoked by the owner.'}
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Go to Job Hunt Tracker
          </Link>
        </div>
      </div>
    );
  }

  const { sharedBy, settings, board } = data;
  const totalCount =
    board.applied.length +
    board.interviewing.length +
    board.offer.length +
    board.rejected.length;

  return (
    <div className="min-h-screen bg-(--bg) text-(--text)">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-(--border) bg-(--card-bg) px-6 py-3 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Logo & Shared Info */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <BriefcaseIcon size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold tracking-tight text-(--text)">
                  Job Hunt Board
                </h1>
                <span className="rounded-full bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:text-blue-300">
                  Read Only
                </span>
              </div>
              <p className="text-xs text-(--text-muted)">
                Shared by <span className="font-semibold text-(--text)">{sharedBy}</span>
              </p>
            </div>
          </div>

          {/* Privacy & Expiry Badges + Theme Toggle */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-(--border) bg-(--bg) px-2.5 py-1 text-[11px] text-(--text-muted)">
              <ShieldIcon size={12} className="text-blue-500" />
              <span>Notes: {settings.includeNotes ? 'Visible' : 'Hidden'}</span>
              <span>•</span>
              <span>Contacts: {settings.includeContacts ? 'Visible' : 'Hidden'}</span>
            </div>

            {settings.expiresAt && (
              <div className="flex items-center gap-1 rounded-lg border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/20 px-2.5 py-1 text-[11px] text-amber-700 dark:text-amber-300">
                <ClockIcon size={12} />
                <span>Expires {new Date(settings.expiresAt).toLocaleDateString()}</span>
              </div>
            )}

            <button
              onClick={toggleTheme}
              className="rounded-lg border border-(--border) bg-(--card-bg) p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors shadow-xs"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <MoonIcon size={15} /> : <SunIcon size={15} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Board */}
      <main className="p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between text-xs text-(--text-muted)">
          <span className="font-medium">Total Applications: {totalCount}</span>
          <span className="italic text-[11px]">Click any card to view details</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 items-start overflow-x-auto pb-4">
          {(['applied', 'interviewing', 'offer', 'rejected'] as const).map((stageKey) => {
            const config = STAGE_CONFIG[stageKey];
            const columnApplications = board[stageKey];

            return (
              <div
                key={stageKey}
                className="flex flex-1 min-w-[280px] w-full lg:max-w-[380px] flex-col rounded-2xl border border-(--border) bg-(--bg-column) p-3.5"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-1 mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${config.dotColor}`} />
                    <h2 className="text-sm font-bold text-(--text)">{config.label}</h2>
                  </div>
                  <span className="rounded-full bg-(--card-bg) px-2.5 py-0.5 text-xs font-semibold text-gray-500 dark:text-gray-400 border border-(--border) shadow-xs">
                    {columnApplications.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="flex flex-col gap-2.5 flex-1 min-h-[120px]">
                  {columnApplications.length === 0 ? (
                    <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-gray-300 dark:border-gray-700/60 p-6 text-center">
                      <p className="text-xs italic text-gray-400">No applications</p>
                    </div>
                  ) : (
                    columnApplications.map((app) => (
                      <div
                        key={app.id}
                        onClick={() => setSelectedApp(app)}
                        className="group relative rounded-xl border border-(--border) bg-(--card-bg) p-3.5 shadow-xs transition-all duration-200 hover:shadow-md hover:border-blue-400/80 dark:hover:border-blue-500 hover:-translate-y-0.5 cursor-pointer"
                      >
                        <p className="font-semibold text-sm text-(--text) leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {app.company}
                        </p>
                        <p className="text-xs text-(--text-muted) mt-1 font-medium">
                          {app.role}
                        </p>

                        {/* Tag Badges */}
                        {app.tags && app.tags.length > 0 && (
                          <div className="mt-2.5 flex flex-wrap gap-1.5">
                            {app.tags.map((tag) => (
                              <TagBadge key={tag.id} tag={tag} size="sm" />
                            ))}
                          </div>
                        )}

                        {/* Note preview if visible */}
                        {settings.includeNotes && app.notes && (
                          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1">
                            <FileTextIcon size={11} className="shrink-0" />
                            <span className="truncate">{app.notes}</span>
                          </div>
                        )}

                        {/* Contacts indicator if visible */}
                        {settings.includeContacts && Array.isArray(app.contacts) && app.contacts.length > 0 && (
                          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                            <UserIcon size={11} />
                            <span>{app.contacts.length} {app.contacts.length === 1 ? 'contact' : 'contacts'}</span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Read-Only Application Detail Modal */}
      {selectedApp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
          onClick={() => setSelectedApp(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-(--border) bg-(--card-bg) shadow-2xl text-(--text) overflow-hidden flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-(--border) p-5">
              <div>
                <span className="rounded-full bg-blue-100 dark:bg-blue-900/50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                  {selectedApp.stage}
                </span>
                <h2 className="text-base font-bold text-(--text) mt-1.5">
                  {selectedApp.company}
                </h2>
                <p className="text-xs text-(--text-muted)">{selectedApp.role}</p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <XIcon size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Applied Date */}
              {selectedApp.appliedDate && (
                <div>
                  <span className="font-semibold text-(--text-muted) block mb-1">
                    Applied Date
                  </span>
                  <p className="text-(--text)">
                    {new Date(selectedApp.appliedDate).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}

              {/* Tags */}
              {selectedApp.tags && selectedApp.tags.length > 0 && (
                <div>
                  <span className="font-semibold text-(--text-muted) block mb-1.5">
                    Tags
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedApp.tags.map((tag) => (
                      <TagBadge key={tag.id} tag={tag} size="md" />
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <span className="font-semibold text-(--text-muted) block mb-1">
                  Notes
                </span>
                {settings.includeNotes ? (
                  selectedApp.notes ? (
                    <div className="rounded-xl border border-(--border) bg-(--bg) p-3 text-(--text) whitespace-pre-wrap leading-relaxed">
                      {selectedApp.notes}
                    </div>
                  ) : (
                    <p className="italic text-gray-400">No notes recorded.</p>
                  )
                ) : (
                  <p className="italic text-gray-400">
                    Application notes kept private by owner.
                  </p>
                )}
              </div>

              {/* Recruiter Contacts */}
              <div>
                <span className="font-semibold text-(--text-muted) block mb-1.5">
                  Contacts & Recruiters
                </span>
                {settings.includeContacts ? (
                  Array.isArray(selectedApp.contacts) && selectedApp.contacts.length > 0 ? (
                    <div className="space-y-2">
                      {selectedApp.contacts.map((contact) => (
                        <div
                          key={contact.id}
                          className="rounded-xl border border-(--border) bg-(--bg) p-3 space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-(--text)">
                              {contact.name}
                            </span>
                            {contact.role && (
                              <span className="text-[11px] text-(--text-muted)">
                                {contact.role}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-(--text-muted)">
                            {contact.email && (
                              <a
                                href={`mailto:${contact.email}`}
                                className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                              >
                                <MailIcon size={12} />
                                <span>{contact.email}</span>
                              </a>
                            )}
                            {contact.phone && (
                              <a
                                href={`tel:${contact.phone}`}
                                className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                              >
                                <PhoneIcon size={12} />
                                <span>{contact.phone}</span>
                              </a>
                            )}
                            {contact.linkedInUrl && (
                              <a
                                href={contact.linkedInUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 text-blue-600 hover:underline"
                              >
                                <ExternalLinkIcon size={12} />
                                <span>LinkedIn</span>
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="italic text-gray-400">No contacts listed.</p>
                  )
                ) : (
                  <p className="italic text-gray-400">
                    Contacts kept private by owner.
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-(--border) p-4 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

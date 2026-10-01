import React, { useState } from 'react';
import {
  useShareLinksQuery,
  useCreateShareLinkMutation,
  useRevokeShareLinkMutation,
} from '../../hooks/useShare';
import {
  ShareIcon,
  CopyIcon,
  CheckIcon,
  XIcon,
  TrashIcon,
  ClockIcon,
  ShieldIcon,
  ExternalLinkIcon,
} from '../common/Icons';
import type { ShareLink } from '../../types/share';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShareModal({ isOpen, onClose }: ShareModalProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'links'>('create');
  const [includeNotes, setIncludeNotes] = useState(false);
  const [includeContacts, setIncludeContacts] = useState(false);
  const [expiresInDays, setExpiresInDays] = useState<number | undefined>(7);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [newlyCreatedLink, setNewlyCreatedLink] = useState<ShareLink | null>(null);

  const { data: links = [], isLoading: isLoadingLinks } = useShareLinksQuery();
  const createMutation = useCreateShareLinkMutation();
  const revokeMutation = useRevokeShareLinkMutation();

  if (!isOpen) return null;

  const getFullShareUrl = (token: string) => {
    return `${window.location.origin}/share/${token}`;
  };

  const handleCopy = async (token: string) => {
    const url = getFullShareUrl(token);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2500);
    } catch {
      // Fallback
      prompt('Copy this link:', url);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createMutation.mutateAsync({
        includeNotes,
        includeContacts,
        expiresInDays: expiresInDays ? Number(expiresInDays) : undefined,
      });
      setNewlyCreatedLink(result);
    } catch (err) {
      console.error('Failed to create share link:', err);
    }
  };

  const handleRevoke = async (id: number) => {
    if (confirm('Are you sure you want to revoke this link? Anyone with this link will immediately lose access.')) {
      await revokeMutation.mutateAsync(id);
      if (newlyCreatedLink?.id === id) {
        setNewlyCreatedLink(null);
      }
    }
  };

  const isLinkExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-(--border) bg-(--card-bg) shadow-2xl text-(--text) overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-(--border) px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <ShareIcon size={18} />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-(--text)">
                Share Your Job Board
              </h2>
              <p className="text-xs text-(--text-muted)">
                Generate secure, read-only access for mentors or recruiters
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <XIcon size={16} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-(--border) bg-(--bg) px-6 text-xs font-medium">
          <button
            onClick={() => setActiveTab('create')}
            className={`border-b-2 py-3 px-3 transition-colors cursor-pointer ${
              activeTab === 'create'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-transparent text-(--text-muted) hover:text-(--text)'
            }`}
          >
            Create New Link
          </button>
          <button
            onClick={() => setActiveTab('links')}
            className={`flex items-center gap-1.5 border-b-2 py-3 px-3 transition-colors cursor-pointer ${
              activeTab === 'links'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-transparent text-(--text-muted) hover:text-(--text)'
            }`}
          >
            <span>Active Links</span>
            {links.length > 0 && (
              <span className="rounded-full bg-blue-100 dark:bg-blue-900/60 px-1.5 py-0.2 text-[10px] font-bold text-blue-700 dark:text-blue-300">
                {links.length}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {activeTab === 'create' ? (
            <div>
              {newlyCreatedLink ? (
                <div className="space-y-4">
                  <div className="rounded-xl border border-green-200 dark:border-green-850/60 bg-green-50 dark:bg-green-950/20 p-4">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-300 font-semibold text-xs mb-1.5">
                      <CheckIcon size={16} />
                      <span>Share link created successfully!</span>
                    </div>
                    <p className="text-xs text-green-600 dark:text-green-400 mb-3">
                      Anyone with this link can now view your sanitized Kanban board.
                    </p>

                    {/* Link display & copy input */}
                    <div className="flex items-center gap-2">
                      <input
                        readOnly
                        value={getFullShareUrl(newlyCreatedLink.token)}
                        className="w-full rounded-lg border border-green-300 dark:border-green-800 bg-(--card-bg) px-3 py-2 text-xs font-mono text-(--text) select-all focus:outline-none"
                      />
                      <button
                        onClick={() => handleCopy(newlyCreatedLink.token)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-green-700 cursor-pointer transition-colors shadow-xs shrink-0"
                      >
                        {copiedToken === newlyCreatedLink.token ? (
                          <>
                            <CheckIcon size={14} />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <CopyIcon size={14} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-(--text-muted)">
                      <div className="flex items-center gap-2">
                        <span>Notes: {newlyCreatedLink.includeNotes ? 'Visible' : 'Hidden'}</span>
                        <span>•</span>
                        <span>Contacts: {newlyCreatedLink.includeContacts ? 'Visible' : 'Hidden'}</span>
                      </div>
                      <a
                        href={`/share/${newlyCreatedLink.token}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <span>Preview view</span>
                        <ExternalLinkIcon size={12} />
                      </a>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setNewlyCreatedLink(null)}
                      className="rounded-lg border border-(--border) px-3.5 py-1.5 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                    >
                      Create Another Link
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 cursor-pointer transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreate} className="space-y-5">
                  {/* Privacy Controls */}
                  <div className="space-y-3">
                    <label className="text-xs font-semibold uppercase tracking-wider text-(--text-muted) flex items-center gap-1.5">
                      <ShieldIcon size={14} className="text-blue-500" />
                      <span>Privacy & Visibility</span>
                    </label>

                    {/* Toggle: Include Notes */}
                    <label className="flex items-start justify-between gap-3 p-3 rounded-xl border border-(--border) hover:bg-gray-50 dark:hover:bg-gray-800/40 cursor-pointer transition-colors">
                      <div>
                        <div className="text-xs font-semibold text-(--text)">
                          Include application notes
                        </div>
                        <div className="text-[11px] text-(--text-muted)">
                          If turned off, personal notes & interview thoughts are completely hidden
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={includeNotes}
                        onChange={(e) => setIncludeNotes(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </label>

                    {/* Toggle: Include Contacts */}
                    <label className="flex items-start justify-between gap-3 p-3 rounded-xl border border-(--border) hover:bg-gray-50 dark:hover:bg-gray-800/40 cursor-pointer transition-colors">
                      <div>
                        <div className="text-xs font-semibold text-(--text)">
                          Include recruiter contacts
                        </div>
                        <div className="text-[11px] text-(--text-muted)">
                          If turned off, recruiter names, emails, and phone numbers are excluded
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={includeContacts}
                        onChange={(e) => setIncludeContacts(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </label>
                  </div>

                  {/* Expiration Controls */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-(--text-muted) flex items-center gap-1.5">
                      <ClockIcon size={14} className="text-blue-500" />
                      <span>Link Expiration</span>
                    </label>
                    <select
                      value={expiresInDays ?? ''}
                      onChange={(e) =>
                        setExpiresInDays(e.target.value ? Number(e.target.value) : undefined)
                      }
                      className="w-full rounded-lg border border-(--border) bg-(--bg) px-3 py-2 text-xs text-(--text) focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="1">Expires in 24 hours</option>
                      <option value="7">Expires in 7 days (Recommended)</option>
                      <option value="30">Expires in 30 days</option>
                      <option value="">Never expires (Indefinite)</option>
                    </select>
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-(--border)">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-lg border border-(--border) px-4 py-2 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createMutation.isPending}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 cursor-pointer shadow-xs disabled:opacity-50 transition-colors"
                    >
                      {createMutation.isPending ? (
                        <span>Generating...</span>
                      ) : (
                        <>
                          <ShareIcon size={14} />
                          <span>Generate Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* Tab: Active Links */
            <div className="space-y-3">
              {isLoadingLinks ? (
                <div className="py-8 text-center text-xs text-(--text-muted)">
                  Loading links...
                </div>
              ) : links.length === 0 ? (
                <div className="py-10 text-center text-xs text-(--text-muted)">
                  <ShareIcon size={28} className="mx-auto mb-2 text-gray-400 opacity-60" />
                  <p className="font-semibold text-(--text)">No share links yet</p>
                  <p className="text-[11px] mt-1">
                    Create a link to share your board with others.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {links.map((link) => {
                    const expired = isLinkExpired(link.expiresAt);
                    return (
                      <div
                        key={link.id}
                        className={`rounded-xl border p-3.5 transition-all ${
                          expired
                            ? 'border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 opacity-70'
                            : 'border-(--border) bg-(--card-bg) shadow-xs'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-(--text)">
                            <span>...{link.token.slice(-8)}</span>
                            {expired ? (
                              <span className="rounded-full bg-red-100 dark:bg-red-950/60 px-2 py-0.5 text-[10px] font-semibold text-red-600 dark:text-red-400">
                                Expired
                              </span>
                            ) : (
                              <span className="rounded-full bg-green-100 dark:bg-green-950/60 px-2 py-0.5 text-[10px] font-semibold text-green-700 dark:text-green-300">
                                Active
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleCopy(link.token)}
                              title="Copy link"
                              className="rounded-md p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                            >
                              {copiedToken === link.token ? (
                                <CheckIcon size={14} className="text-green-600" />
                              ) : (
                                <CopyIcon size={14} />
                              )}
                            </button>
                            <a
                              href={`/share/${link.token}`}
                              target="_blank"
                              rel="noreferrer"
                              title="Open public board"
                              className="rounded-md p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                            >
                              <ExternalLinkIcon size={14} />
                            </a>
                            <button
                              onClick={() => handleRevoke(link.id)}
                              disabled={revokeMutation.isPending}
                              title="Revoke link"
                              className="rounded-md p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer transition-colors"
                            >
                              <TrashIcon size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Badges & Meta */}
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-(--text-muted)">
                          <span className="rounded-md bg-(--bg) border border-(--border) px-2 py-0.5">
                            Notes: {link.includeNotes ? 'Visible' : 'Hidden'}
                          </span>
                          <span className="rounded-md bg-(--bg) border border-(--border) px-2 py-0.5">
                            Contacts: {link.includeContacts ? 'Visible' : 'Hidden'}
                          </span>
                          <span className="ml-auto text-[10px]">
                            {link.expiresAt
                              ? `Expires: ${new Date(link.expiresAt).toLocaleDateString()}`
                              : 'No expiration'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

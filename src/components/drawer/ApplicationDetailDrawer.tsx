import React, { useState, useEffect } from "react";
import type { Application, Contact, Stage } from "../../types";
import { TagSelector } from "../tags/TagSelector";
import { useSetApplicationTags, useUpdateStage } from "../../hooks/useApplications";
import { useContactsQuery, useDeleteContact } from "../../hooks/useContacts";
import { useMarkFollowedUp, useSnoozeFollowUp } from "../../hooks/useNotifications";
import { ContactFormModal } from "../contacts/ContactFormModal";
import {
  TagIcon,
  UsersIcon,
  FileTextIcon,
  MailIcon,
  PhoneIcon,
  ExternalLinkIcon,
  PlusIcon,
  XIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  CheckIcon,
  BellIcon,
} from "../common/Icons";

interface ApplicationDetailDrawerProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenTagManager?: () => void;
}

const STAGES: {
  value: Stage;
  label: string;
  activeBg: string;
}[] = [
  {
    value: "applied",
    label: "Applied",
    activeBg: "bg-blue-600 text-white shadow-xs font-semibold",
  },
  {
    value: "interview",
    label: "Interview",
    activeBg: "bg-amber-500 text-white shadow-xs font-semibold",
  },
  {
    value: "offer",
    label: "Offer",
    activeBg: "bg-emerald-600 text-white shadow-xs font-semibold",
  },
  {
    value: "rejected",
    label: "Rejected",
    activeBg: "bg-rose-600 text-white shadow-xs font-semibold",
  },
];

export const ApplicationDetailDrawer: React.FC<ApplicationDetailDrawerProps> = ({
  application,
  isOpen,
  onClose,
  onOpenTagManager,
}) => {
  const { mutate: setApplicationTags } = useSetApplicationTags();
  const { mutate: updateStage } = useUpdateStage();
  const { data: allContacts = [], isLoading: isLoadingContacts } = useContactsQuery();
  const { mutateAsync: deleteContact } = useDeleteContact();
  const markFollowedUp = useMarkFollowedUp();
  const snoozeFollowUp = useSnoozeFollowUp();

  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isContactModalOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isContactModalOpen, onClose]);

  if (!application) return null;

  const needsFollowUp = Boolean(application.followUpStatus);
  const currentTagIds = (application.tags ?? []).map((t) => t.id);

  const linkedContacts = Array.isArray(allContacts)
    ? allContacts.filter(
        (c) =>
          c.applicationId != null &&
          String(c.applicationId) === String(application.id)
      )
    : [];

  const handleTagsChange = (newTagIds: number[]) => {
    setApplicationTags({ id: application.id, tagIds: newTagIds });
  };

  const handleStageChange = (newStage: Stage) => {
    updateStage({ id: application.id, stage: newStage });
  };

  const handleAddContact = () => {
    setEditingContact(null);
    setIsContactModalOpen(true);
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setIsContactModalOpen(true);
  };

  const handleDeleteContact = async (id: string | number, name: string) => {
    if (window.confirm(`Delete contact "${name}"?`)) {
      await deleteContact(id);
    }
  };

  return (
    <>
      {/* Backdrop with smooth blur */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Slide-over Drawer Panel */}
      <aside
        aria-label="Application details"
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col text-slate-900 dark:text-slate-100 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="border-b border-slate-100 dark:border-slate-800 p-6 bg-white dark:bg-slate-900">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white truncate">
                {application.company}
              </h2>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                {application.role}
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-colors shrink-0"
              title="Close drawer (Esc)"
            >
              <XIcon size={16} />
            </button>
          </div>

          {/* Interactive Stage Segmented Selector */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Application Stage
            </span>
            <div className="grid grid-cols-4 gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-1 text-xs">
              {STAGES.map((s) => {
                const isActive = application.stage === s.value;
                return (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => handleStageChange(s.value)}
                    className={`rounded-lg py-1.5 text-center text-xs font-medium cursor-pointer transition-all ${
                      isActive
                        ? s.activeBg
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Drawer Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 dark:bg-slate-900/50">
          {/* Metadata Card */}
          <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-4 shadow-xs">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Date Applied
              </span>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {new Date(application.appliedDate).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Application ID
              </span>
              <span className="font-mono text-xs font-medium text-slate-500 dark:text-slate-400">
                #{application.id}
              </span>
            </div>
          </div>

          {/* Follow-Up Quick Actions Section */}
          <section className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <BellIcon size={15} className="text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Follow-Up Radar
                </h3>
              </div>

              {/* Status Pill Badge */}
              {application.followUpStatus === "NEEDS_FIRST_FOLLOW_UP" && (
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  1st Follow-Up Due
                </span>
              )}
              {application.followUpStatus === "NEEDS_SECOND_FOLLOW_UP" && (
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  2nd Follow-Up Due
                </span>
              )}
              {application.followUpStatus === "STALE_GHOSTED" && (
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                  Stale / Ghosted
                </span>
              )}
              {!application.followUpStatus &&
                application.snoozeFollowUpUntil &&
                new Date(application.snoozeFollowUpUntil) > new Date() && (
                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    <ClockIcon size={11} />
                    Snoozed
                  </span>
                )}
              {!application.followUpStatus &&
                (!application.snoozeFollowUpUntil ||
                  new Date(application.snoozeFollowUpUntil) <= new Date()) && (
                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Up to date
                  </span>
                )}
            </div>

            {/* Follow-up Timestamp Details */}
            <div className="grid grid-cols-2 gap-2 text-xs py-1">
              <div>
                <span className="text-[11px] text-slate-400 block">Last Followed Up</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {application.lastFollowUpAt
                    ? new Date(application.lastFollowUpAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "None recorded"}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Snooze Status</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {application.snoozeFollowUpUntil &&
                  new Date(application.snoozeFollowUpUntil) > new Date()
                    ? `Until ${new Date(application.snoozeFollowUpUntil).toLocaleDateString(
                        undefined,
                        {
                          month: "short",
                          day: "numeric",
                        }
                      )}`
                    : "Active (not snoozed)"}
                </span>
              </div>
            </div>

            {/* Quick Action Buttons - Only appear if this role needs follow-up */}
            {needsFollowUp && (
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  disabled={markFollowedUp.isPending}
                  onClick={() => markFollowedUp.mutate(application.id)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  title="Mark this role as followed-up today"
                >
                  <CheckIcon size={14} />
                  <span>
                    {markFollowedUp.isPending ? "Updating..." : "Mark Followed Up"}
                  </span>
                </button>

                <button
                  type="button"
                  disabled={snoozeFollowUp.isPending}
                  onClick={() => snoozeFollowUp.mutate({ id: application.id, days: 7 })}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-2 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                  title="Snooze notifications for 7 days"
                >
                  <ClockIcon size={14} />
                  <span>
                    {snoozeFollowUp.isPending ? "Snoozing..." : "Snooze 7 Days"}
                  </span>
                </button>
              </div>
            )}
          </section>

          {/* Tags Section */}
          <section className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TagIcon size={15} className="text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Tags
                </h3>
                <span className="rounded-full bg-slate-100 dark:bg-slate-700/60 px-2 py-0.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {application.tags?.length ?? 0}
                </span>
              </div>
              {onOpenTagManager && (
                <button
                  type="button"
                  onClick={onOpenTagManager}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Manage Tags
                </button>
              )}
            </div>

            {/* Tag Selector (Includes Chips + Dropdown Add) */}
            <TagSelector
              selectedTagIds={currentTagIds}
              onChange={handleTagsChange}
              onOpenManager={onOpenTagManager}
              placeholder="Select or create tags..."
            />
          </section>

          {/* Contacts Section */}
          <section className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UsersIcon size={16} className="text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Contacts & Networking
                </h3>
                <span className="rounded-full bg-slate-100 dark:bg-slate-700/60 px-2 py-0.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {linkedContacts.length}
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddContact}
                className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 cursor-pointer shadow-xs transition-colors"
              >
                <PlusIcon size={12} />
                <span>Add Contact</span>
              </button>
            </div>

            {isLoadingContacts ? (
              <div className="py-6 text-center text-xs text-slate-400">
                Loading contacts...
              </div>
            ) : linkedContacts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 p-6 text-center bg-slate-50/50 dark:bg-slate-900/40">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No contacts linked to this application yet.
                </p>
                <button
                  type="button"
                  onClick={handleAddContact}
                  className="mt-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  + Add recruiter, referrer, or interviewer
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {linkedContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800 p-3.5 shadow-xs space-y-2.5 transition-all hover:border-slate-300 dark:hover:border-slate-600"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-bold text-xs uppercase shadow-xs">
                          {contact.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                            {contact.name}
                          </h4>
                          {contact.role && (
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                              {contact.role}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Contact Action Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleEditContact(contact)}
                          className="rounded-lg p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 cursor-pointer transition-colors"
                          title="Edit contact"
                        >
                          <PencilIcon size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteContact(contact.id, contact.name)}
                          className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 cursor-pointer transition-colors"
                          title="Delete contact"
                        >
                          <TrashIcon size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Contact Communication Channels */}
                    <div className="flex flex-wrap gap-2 text-xs">
                      {contact.email && (
                        <a
                          href={`mailto:${contact.email}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 px-2.5 py-1 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 transition-colors"
                        >
                          <MailIcon size={12} className="text-blue-500" />
                          <span className="truncate max-w-[200px]">{contact.email}</span>
                        </a>
                      )}
                      {contact.phone && (
                        <a
                          href={`tel:${contact.phone}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 px-2.5 py-1 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 transition-colors"
                        >
                          <PhoneIcon size={12} className="text-slate-400" />
                          <span>{contact.phone}</span>
                        </a>
                      )}
                      {contact.linkedInUrl && (
                        <a
                          href={contact.linkedInUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/40 px-2.5 py-1 text-blue-600 dark:text-blue-400 hover:underline transition-colors"
                        >
                          <ExternalLinkIcon size={12} />
                          <span>LinkedIn</span>
                        </a>
                      )}
                    </div>

                    {contact.notes && (
                      <p className="rounded-lg bg-slate-50 dark:bg-slate-900/80 p-2.5 text-xs text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-750 italic leading-relaxed">
                        {contact.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Notes Section */}
          <section className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-4 shadow-xs space-y-2">
            <div className="flex items-center gap-2">
              <FileTextIcon size={15} className="text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Application Notes
              </h3>
            </div>
            {application.notes ? (
              <div className="rounded-lg border border-slate-200 dark:border-slate-700/60 p-3 bg-slate-50/70 dark:bg-slate-900/50 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {application.notes}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No notes provided for this application.</p>
            )}
          </section>
        </div>

        {/* Drawer Footer */}
        <div className="border-t border-slate-100 dark:border-slate-800 p-4 flex justify-end bg-white dark:bg-slate-900">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 dark:border-slate-700 px-5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors shadow-xs"
          >
            Close
          </button>
        </div>
      </aside>

      {/* Add / Edit Contact Modal */}
      <ContactFormModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        contactToEdit={editingContact}
        defaultApplicationId={Number(application.id)}
      />
    </>
  );
};

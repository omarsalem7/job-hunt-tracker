import React, { useState, useEffect } from "react";
import type { Application, Contact, Stage } from "../../types";
import { TagBadge } from "../tags/TagBadge";
import { TagSelector } from "../tags/TagSelector";
import { useSetApplicationTags, useUpdateStage } from "../../hooks/useApplications";
import { useContactsQuery, useDeleteContact } from "../../hooks/useContacts";
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
} from "../common/Icons";

interface ApplicationDetailDrawerProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenTagManager?: () => void;
}

const STAGES: { value: Stage; label: string }[] = [
  { value: "applied", label: "Applied" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
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
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Slide-over Drawer Panel */}
      <aside
        aria-label="Application details"
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-(--bg) border-l border-(--border) shadow-2xl flex flex-col text-(--text) transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-start justify-between border-b border-(--border) p-5 bg-gray-50/50 dark:bg-gray-800/40">
          <div className="min-w-0 flex-1 mr-4">
            <h2 className="text-xl font-bold truncate text-(--text)">
              {application.company}
            </h2>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5">
              {application.role}
            </p>

            {/* Stage Selector */}
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs font-semibold uppercase text-gray-400">Stage:</span>
              <select
                value={application.stage}
                onChange={(e) => handleStageChange(e.target.value as Stage)}
                className="rounded-lg border border-(--border) bg-(--bg) px-2.5 py-1 text-xs font-semibold capitalize cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {STAGES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
            title="Close drawer"
          >
            <XIcon size={18} />
          </button>
        </div>

        {/* Drawer Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Metadata Card */}
          <div className="flex items-center justify-between rounded-lg border border-(--border) p-3 bg-(--bg) text-xs">
            <div>
              <span className="text-gray-400 block mb-0.5">Date Applied</span>
              <span className="font-semibold text-(--text)">
                {new Date(application.appliedDate).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block mb-0.5">Application ID</span>
              <span className="font-mono text-gray-500">#{application.id}</span>
            </div>
          </div>

          {/* Tags Section */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TagIcon size={16} className="text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-semibold text-(--text)">Tags</h3>
                <span className="text-xs text-gray-400">
                  ({application.tags?.length ?? 0})
                </span>
              </div>
              {onOpenTagManager && (
                <button
                  type="button"
                  onClick={onOpenTagManager}
                  className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Manage Tags
                </button>
              )}
            </div>

            {/* Currently assigned tags */}
            {application.tags && application.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {application.tags.map((tag) => (
                  <TagBadge
                    key={tag.id}
                    tag={tag}
                    size="md"
                    onRemove={() =>
                      handleTagsChange(currentTagIds.filter((id) => id !== tag.id))
                    }
                  />
                ))}
              </div>
            )}

            {/* Tag Selector */}
            <TagSelector
              selectedTagIds={currentTagIds}
              onChange={handleTagsChange}
              onOpenManager={onOpenTagManager}
              placeholder="Assign or create tags..."
            />
          </section>

          {/* Contacts Section */}
          <section className="space-y-3 pt-4 border-t border-(--border)">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UsersIcon size={16} className="text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-semibold text-(--text)">Contacts & Networking</h3>
                <span className="text-xs text-gray-400">
                  ({linkedContacts.length})
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddContact}
                className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700 cursor-pointer transition-colors"
              >
                <PlusIcon size={12} />
                <span>Add Contact</span>
              </button>
            </div>

            {isLoadingContacts ? (
              <div className="py-6 text-center text-xs text-gray-400">
                Loading contacts...
              </div>
            ) : linkedContacts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-(--border) p-5 text-center">
                <p className="text-xs text-gray-500">
                  No contacts linked to this application yet.
                </p>
                <button
                  type="button"
                  onClick={handleAddContact}
                  className="mt-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Add recruiter, referrer, or interviewer
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {linkedContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="rounded-lg border border-(--border) p-3 bg-gray-50/60 dark:bg-gray-800/40 text-xs space-y-1.5 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-sm text-(--text)">
                          {contact.name}
                        </h4>
                        {contact.role && (
                          <p className="text-gray-500 dark:text-gray-400">
                            {contact.role}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditContact(contact)}
                          className="text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteContact(contact.id, contact.name)}
                          className="text-red-500 hover:underline cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Contact Channels */}
                    <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1 text-gray-600 dark:text-gray-300">
                      {contact.email && (
                        <a
                          href={`mailto:${contact.email}`}
                          className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"
                        >
                          <MailIcon size={13} />
                          <span>{contact.email}</span>
                        </a>
                      )}
                      {contact.phone && (
                        <a
                          href={`tel:${contact.phone}`}
                          className="hover:underline flex items-center gap-1.5"
                        >
                          <PhoneIcon size={13} />
                          <span>{contact.phone}</span>
                        </a>
                      )}
                      {contact.linkedInUrl && (
                        <a
                          href={contact.linkedInUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"
                        >
                          <ExternalLinkIcon size={13} />
                          <span>LinkedIn</span>
                        </a>
                      )}
                    </div>

                    {contact.notes && (
                      <p className="mt-1 rounded bg-(--bg) p-2 text-gray-600 dark:text-gray-300 border border-(--border) italic">
                        {contact.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Notes Section */}
          <section className="space-y-2 pt-4 border-t border-(--border)">
            <div className="flex items-center gap-2">
              <FileTextIcon size={16} className="text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-semibold text-(--text)">Notes</h3>
            </div>
            {application.notes ? (
              <div className="rounded-lg border border-(--border) p-3 bg-gray-50/50 dark:bg-gray-800/30 text-xs text-(--text) whitespace-pre-wrap leading-relaxed">
                {application.notes}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">No notes provided.</p>
            )}
          </section>
        </div>

        {/* Drawer Footer */}
        <div className="border-t border-(--border) p-4 flex justify-end bg-gray-50/50 dark:bg-gray-800/40">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-(--border) px-4 py-2 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
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

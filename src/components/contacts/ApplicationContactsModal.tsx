import { useState } from "react";
import type { Application, Contact } from "../../types";
import { useContactsQuery, useDeleteContact } from "../../hooks/useContacts";
import { ContactFormModal } from "./ContactFormModal";
import { MailIcon, PhoneIcon, ExternalLinkIcon, XIcon } from "../common/Icons";

interface ApplicationContactsModalProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ApplicationContactsModal({
  application,
  isOpen,
  onClose,
}: ApplicationContactsModalProps) {
  const { data: allContacts = [], isLoading } = useContactsQuery();
  const { mutateAsync: deleteContact } = useDeleteContact();

  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  if (!isOpen || !application) return null;

  const contacts = Array.isArray(allContacts)
    ? allContacts.filter(
        (c) =>
          c.applicationId != null &&
          String(c.applicationId) === String(application.id),
      )
    : [];

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setIsAddEditOpen(true);
  };

  const handleAddNew = () => {
    setEditingContact(null);
    setIsAddEditOpen(true);
  };

  const handleDelete = async (id: string | number) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      await deleteContact(id);
    }
  };

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg rounded-xl border border-(--border) bg-(--bg) p-6 shadow-2xl text-(--text)"
        >
          <div className="flex items-center justify-between border-b border-(--border) pb-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold">Contacts & Networking</h2>
              <p className="text-xs text-gray-500">
                {application.company} — {application.role}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
            >
              <XIcon size={18} />
            </button>
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-gray-500">
              {contacts.length} {contacts.length === 1 ? "contact" : "contacts"}{" "}
              linked
            </span>
            <button
              onClick={handleAddNew}
              className="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 cursor-pointer"
            >
              + Add Contact
            </button>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-sm text-gray-400">
              Loading contacts...
            </div>
          ) : contacts.length === 0 ? (
            <div className="rounded-lg border border-dashed border-(--border) p-6 text-center">
              <p className="text-sm text-gray-500">
                No contacts associated with this job application yet.
              </p>
              <button
                onClick={handleAddNew}
                className="mt-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Add recruiters, referrers, or interviewers
              </button>
            </div>
          ) : (
            <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="rounded-lg border border-(--border) p-3 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col gap-1.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-(--text)">
                        {contact.name}
                      </h3>
                      {contact.role && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {contact.role}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(contact)}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(contact.id)}
                        className="text-xs text-red-600 hover:underline cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 dark:text-gray-300">
                    {contact.email && (
                      <a
                        href={`mailto:${contact.email}`}
                        className="hover:underline flex items-center gap-1.5 text-blue-600 dark:text-blue-400"
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
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic bg-white dark:bg-gray-800 p-2 rounded border border-(--border) mt-1">
                      {contact.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="rounded-lg border border-(--border) px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <ContactFormModal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        contactToEdit={editingContact}
        defaultApplicationId={application ? Number(application.id) : null}
      />
    </>
  );
}

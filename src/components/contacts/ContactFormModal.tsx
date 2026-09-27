import { useState, useEffect, type FormEvent } from "react";
import type { Contact, CreateContactDto } from "../../types";
import { useCreateContact, useUpdateContact } from "../../hooks/useContacts";
import { useApplicationsQuery } from "../../hooks/useApplications";

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactToEdit?: Contact | null;
  defaultApplicationId?: number | null;
}

export function ContactFormModal({
  isOpen,
  onClose,
  contactToEdit,
  defaultApplicationId,
}: ContactFormModalProps) {
  const { data: applications = [] } = useApplicationsQuery();
  const { mutateAsync: createContact, isPending: isCreating } =
    useCreateContact();
  const { mutateAsync: updateContact, isPending: isUpdating } =
    useUpdateContact();

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [applicationId, setApplicationId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (contactToEdit) {
      setName(contactToEdit.name || "");
      setRole(contactToEdit.role || "");
      setEmail(contactToEdit.email || "");
      setPhone(contactToEdit.phone || "");
      setLinkedInUrl(contactToEdit.linkedInUrl || "");
      setApplicationId(
        contactToEdit.applicationId != null
          ? String(contactToEdit.applicationId)
          : "",
      );
      setNotes(contactToEdit.notes || "");
    } else {
      setName("");
      setRole("");
      setEmail("");
      setPhone("");
      setLinkedInUrl("");
      setApplicationId(
        defaultApplicationId != null ? String(defaultApplicationId) : "",
      );
      setNotes("");
    }
    setError(null);
  }, [contactToEdit, defaultApplicationId, isOpen]);

  if (!isOpen) return null;

  const isSubmitting = isCreating || isUpdating;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const dto: CreateContactDto = {
      name: name.trim(),
      role: role.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      linkedInUrl: linkedInUrl.trim() || undefined,
      notes: notes.trim() || undefined,
      applicationId: applicationId ? Number(applicationId) : null,
    };

    try {
      if (contactToEdit) {
        await updateContact({ id: contactToEdit.id, data: dto });
      } else {
        await createContact(dto);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save contact");
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-xl border border-(--border) bg-(--bg) p-6 shadow-2xl text-(--text)"
      >
        <div className="flex items-center justify-between border-b border-(--border) pb-3 mb-4">
          <h2 className="text-lg font-semibold">
            {contactToEdit ? "Edit Contact" : "Add New Contact"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold cursor-pointer"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jane Doe"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600  px-3 py-2 text-sm text-(--text) focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Role / Title
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Recruiter, Hiring Manager"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600  px-3 py-2 text-sm text-(--text) focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. jane@company.com"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600  px-3 py-2 text-sm text-(--text) focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +1 555-0199"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600  px-3 py-2 text-sm text-(--text) focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              LinkedIn Profile URL
            </label>
            <input
              type="url"
              value={linkedInUrl}
              onChange={(e) => setLinkedInUrl(e.target.value)}
              placeholder="https://linkedin.com/in/..."
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600  px-3 py-2 text-sm text-(--text) focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Associated Job Application
            </label>
            <select
              value={applicationId}
              onChange={(e) => setApplicationId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600  px-3 py-2 text-sm text-(--text) focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">None (General Contact / Network)</option>
              {Array.isArray(applications) &&
                applications.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.company} — {app.role} ({app.stage})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Met at tech meetup, referred by colleague, interview feedback..."
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600  px-3 py-2 text-sm text-(--text) focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-(--border)">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-(--border) px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting
                ? "Saving..."
                : contactToEdit
                  ? "Update Contact"
                  : "Create Contact"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

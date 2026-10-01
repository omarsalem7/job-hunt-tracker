import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useContactsQuery, useDeleteContact } from "../hooks/useContacts";
import { useApplicationsQuery } from "../hooks/useApplications";
import { ContactFormModal } from "../components/contacts/ContactFormModal";
import type { Contact } from "../types";
import { UsersIcon, MailIcon, PhoneIcon, ExternalLinkIcon, MoonIcon, SunIcon } from "../components/common/Icons";
import { useTheme } from "../hooks/useTheme";
import { useAuth } from "../hooks/useAuth";

export function ContactsPage() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const { data: contacts = [], isLoading, isError, error } = useContactsQuery();
  const { data: applications = [] } = useApplicationsQuery();
  const { mutateAsync: deleteContact } = useDeleteContact();

  const [search, setSearch] = useState("");
  const [selectedAppFilter, setSelectedAppFilter] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [contactToEdit, setContactToEdit] = useState<Contact | null>(null);

  const contactList = Array.isArray(contacts) ? contacts : [];

  const filteredContacts = useMemo(() => {
    return contactList.filter((c) => {
      const query = search.toLowerCase();
      const matchesSearch =
        c.name.toLowerCase().includes(query) ||
        (c.role && c.role.toLowerCase().includes(query)) ||
        (c.email && c.email.toLowerCase().includes(query)) ||
        (c.application?.company &&
          c.application.company.toLowerCase().includes(query));

      const matchesApp =
        selectedAppFilter === "all"
          ? true
          : selectedAppFilter === "unassigned"
            ? c.applicationId == null
            : String(c.applicationId) === selectedAppFilter;

      return matchesSearch && matchesApp;
    });
  }, [contactList, search, selectedAppFilter]);

  const handleEdit = (contact: Contact) => {
    setContactToEdit(contact);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setContactToEdit(null);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string | number) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      await deleteContact(id);
    }
  };

  return (
    <div className="min-h-screen bg-(--bg) text-(--text)">
      {/* Top Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-(--border) px-6 py-4">
        <div className="flex items-center gap-6">
          <h1 className="text-lg font-bold">Job Hunt Command Center</h1>
          <nav className="flex items-center gap-2">
            <Link
              to="/"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white"
            >
              Applications
            </Link>
            <Link
              to="/contacts"
              className="rounded-lg bg-gray-100 dark:bg-gray-800 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400"
            >
              Contacts
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="rounded border border-(--border) px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? <MoonIcon size={16} /> : <SunIcon size={16} />}
          </button>
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-(--border)">
              <span className="text-xs text-gray-500 font-medium">
                {user.email}
              </span>
              <button
                onClick={logout}
                className="rounded border border-red-300 text-red-600 px-3 py-1.5 text-xs hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search contacts, roles, companies..."
              className="w-72 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-(--text) focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={selectedAppFilter}
              onChange={(e) => setSelectedAppFilter(e.target.value)}
              className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-(--text) focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">All Applications</option>
              <option value="unassigned">Unassigned / General</option>
              {Array.isArray(applications) &&
                applications.map((app) => (
                  <option key={app.id} value={String(app.id)}>
                    {app.company} ({app.role})
                  </option>
                ))}
            </select>
          </div>

          <button
            onClick={handleAddNew}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 shadow-sm transition cursor-pointer"
          >
            + Add Contact
          </button>
        </div>

        {/* Status / List View */}
        {isLoading ? (
          <div className="flex items-center justify-center p-12 text-gray-500">
            Loading contacts...
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center p-12 text-red-500">
            Failed to load contacts:{" "}
            {error instanceof Error ? error.message : "Unknown error"}
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-(--border) p-12 text-center">
            <UsersIcon size={36} className="text-gray-400 mx-auto mb-2" />
            <h3 className="text-base font-medium">No contacts found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {search || selectedAppFilter !== "all"
                ? "Try adjusting your search or filters."
                : "Build your network by adding recruiters, interviewers, and referrals."}
            </p>
            <button
              onClick={handleAddNew}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700 cursor-pointer"
            >
              + Add Your First Contact
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className="group relative rounded-xl border border-(--border) bg-(--bg) p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-base text-(--text)">
                        {contact.name}
                      </h3>
                      {contact.role && (
                        <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                          {contact.role}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(contact)}
                        className="text-xs text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                        title="Edit Contact"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(contact.id)}
                        className="text-xs text-gray-500 hover:text-red-600 cursor-pointer"
                        title="Delete Contact"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Connected Application Tag */}
                  <div className="mt-3">
                    {contact.application ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full  px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        💼 {contact.application.company} •{" "}
                        {contact.application.role}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs text-gray-600 dark:text-gray-400">
                        General Network
                      </span>
                    )}
                  </div>

                  {/* Contact Links */}
                  <div className="mt-4 space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
                    {contact.email && (
                      <div className="flex items-center gap-2 truncate">
                        <MailIcon size={14} className="text-gray-400 shrink-0" />
                        <a
                          href={`mailto:${contact.email}`}
                          className="hover:underline text-blue-600 dark:text-blue-400 truncate"
                        >
                          {contact.email}
                        </a>
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center gap-2">
                        <PhoneIcon size={14} className="text-gray-400 shrink-0" />
                        <a
                          href={`tel:${contact.phone}`}
                          className="hover:underline"
                        >
                          {contact.phone}
                        </a>
                      </div>
                    )}
                    {contact.linkedInUrl && (
                      <div className="flex items-center gap-2">
                        <ExternalLinkIcon size={14} className="text-gray-400 shrink-0" />
                        <a
                          href={contact.linkedInUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline truncate"
                        >
                          LinkedIn Profile
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {contact.notes && (
                    <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 italic  p-2.5 rounded-lg border border-(--border)">
                      {contact.notes}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-(--border) text-[11px] text-gray-400 flex items-center justify-between">
                  <span>
                    Added{" "}
                    {contact.createdAt
                      ? new Date(contact.createdAt).toLocaleDateString()
                      : "Recently"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <ContactFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        contactToEdit={contactToEdit}
      />
    </div>
  );
}

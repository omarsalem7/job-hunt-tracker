import { useDeferredValue, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { KanbanBoard } from "../components/kanban/KanbanBoard";
import { AddApplicationForm } from "../components/forms/AddApplicationForm";
import { CommandPalette } from "../components/command-palette/CommandPalette";
import { useCommandPalette } from "../hooks/useCommandPalette";
import { MatchScorer } from "../components/match-scorer/MatchScorer";
import { useApplicationsQuery } from "../hooks/useApplications";
import { useTagsQuery } from "../hooks/useTags";
import { ApplicationListView } from "../components/list-view/ApplicationListView";
import { TagManagerModal, TagBadge } from "../components/tags";
import { ApplicationDetailDrawer } from "../components/drawer/ApplicationDetailDrawer";
import { TagIcon, MoonIcon, SunIcon } from "../components/common/Icons";
import { useTheme } from "../hooks/useTheme";
import { ErrorBoundary } from "../components/ErrorBoundary/ErrorBoundary";
import { useAuth } from "../hooks/useAuth";
import type { Application } from "../types";

export function DashboardPage() {
  const { user, logout } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [showTagManager, setShowTagManager] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string | number | null>(null);
  const [search, setSearch] = useState("");
  const [selectedTagFilterIds, setSelectedTagFilterIds] = useState<number[]>([]);
  const deferredSearch = useDeferredValue(search);
  const palette = useCommandPalette();

  const [view, setView] = useState<"board" | "list">("board");
  const {
    data: applications = [],
    isLoading,
    isError,
    error,
  } = useApplicationsQuery();
  const { data: allTags = [] } = useTagsQuery();
  const { theme, toggleTheme } = useTheme();

  const [showScorer, setShowScorer] = useState(false);

  // Compute search & tag filtering once at the parent level
  const filteredApplications = useMemo(() => {
    const list = Array.isArray(applications) ? applications : [];
    return list.filter((a) => {
      const matchesSearch =
        a.company.toLowerCase().includes(deferredSearch.toLowerCase()) ||
        a.role.toLowerCase().includes(deferredSearch.toLowerCase());
      if (!matchesSearch) return false;

      if (selectedTagFilterIds.length > 0) {
        const appTagIds = (a.tags || []).map((t) => t.id);
        const hasSelectedTag = selectedTagFilterIds.some((id) =>
          appTagIds.includes(id)
        );
        if (!hasSelectedTag) return false;
      }

      return true;
    });
  }, [applications, deferredSearch, selectedTagFilterIds]);

  // Keep drawer's application always in sync with fresh React Query cache
  const selectedApplication = useMemo(() => {
    if (!selectedAppId) return null;
    return applications.find((a) => String(a.id) === String(selectedAppId)) ?? null;
  }, [applications, selectedAppId]);

  const toggleTagFilter = (tagId: number) => {
    setSelectedTagFilterIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const clearTagFilters = () => {
    setSelectedTagFilterIds([]);
  };

  const handleSelectApplication = (app: Application) => {
    setSelectedAppId(app.id);
  };

  const commands = [
    { id: "add", label: "Add application", action: () => setShowForm(true) },
    {
      id: "manage-tags",
      label: "Manage tags",
      action: () => setShowTagManager(true),
    },
    {
      id: "focus-search",
      label: "Focus search",
      action: () => document.getElementById("search-input")?.focus(),
    },
    { id: "clear-search", label: "Clear search", action: () => setSearch("") },
  ];

  return (
    <div className="min-h-screen bg-(--bg) text-(--text)">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-(--border) px-6 py-4">
        <div className="flex items-center gap-6">
          <h1 className="text-lg font-bold">Job Hunt Command Center</h1>
          <nav className="flex items-center gap-2">
            <Link
              to="/"
              className="rounded-lg bg-gray-100 dark:bg-gray-800 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400"
            >
              Applications
            </Link>
            <Link
              to="/contacts"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white"
            >
              Contacts
            </Link>
          </nav>
        </div>

        <input
          id="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search companies or roles... (⌘K for commands)"
          className="w-72 rounded border border-gray-300 dark:border-gray-600 bg-(--bg) p-2 text-sm text-(--text) focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTagManager(true)}
            className="flex items-center gap-1.5 rounded border border-(--border) px-3 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
            title="Manage custom tags"
          >
            <TagIcon size={15} className="text-blue-600 dark:text-blue-400" />
            <span>Tags</span>
            {allTags.length > 0 && (
              <span className="ml-1 rounded-full bg-blue-100 dark:bg-blue-900/50 px-1.5 py-0.2 text-xs font-semibold text-blue-600 dark:text-blue-300">
                {allTags.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setView(view === "board" ? "list" : "board")}
            className="rounded border border-(--border) px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {view === "board" ? "List view" : "Board view"}
          </button>

          <button
            onClick={() => setShowScorer(true)}
            className="rounded border border-(--border) px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Match score
          </button>

          <button
            onClick={() => setShowForm(true)}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 cursor-pointer"
          >
            Add application
          </button>

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

      {/* Filter Bar (Tags & Fast Filters) */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-b border-(--border) bg-gray-50/50 dark:bg-gray-900/40 px-6 py-2.5 text-xs">
          <span className="font-semibold text-gray-500 mr-1">Filter by tag:</span>

          <button
            onClick={clearTagFilters}
            className={`rounded-full px-2.5 py-1 font-medium transition-colors cursor-pointer ${
              selectedTagFilterIds.length === 0
                ? "bg-(--text) text-(--bg)"
                : "border border-(--border) bg-(--bg) text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            All ({applications.length})
          </button>

          {allTags.map((tag) => {
            const isSelected = selectedTagFilterIds.includes(tag.id);
            return (
              <TagBadge
                key={tag.id}
                tag={tag}
                size="md"
                selected={isSelected}
                onClick={() => toggleTagFilter(tag.id)}
                className={isSelected ? "scale-105" : "opacity-75 hover:opacity-100"}
              />
            );
          })}

          {selectedTagFilterIds.length > 0 && (
            <button
              onClick={clearTagFilters}
              className="ml-2 text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Main Content */}
      {isLoading ? (
        <div className="flex items-center justify-center p-12 text-gray-500">
          Loading applications...
        </div>
      ) : isError ? (
        <div className="flex items-center justify-center p-12 text-red-500">
          Failed to load applications:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </div>
      ) : view === "board" ? (
        <KanbanBoard
          applications={filteredApplications}
          onSelectApplication={handleSelectApplication}
        />
      ) : (
        <ApplicationListView
          applications={filteredApplications}
          onSelectApplication={handleSelectApplication}
        />
      )}

      {/* Side Drawer for Application Details, Tags, & Contacts */}
      <ApplicationDetailDrawer
        application={selectedApplication}
        isOpen={Boolean(selectedApplication)}
        onClose={() => setSelectedAppId(null)}
        onOpenTagManager={() => setShowTagManager(true)}
      />

      {/* Add Application Modal */}
      {showForm && (
        <div
          onClick={() => setShowForm(false)}
          className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-xl bg-(--bg) p-6 shadow-2xl border border-(--border)"
          >
            <AddApplicationForm
              onDone={() => setShowForm(false)}
              onOpenTagManager={() => {
                setShowForm(false);
                setShowTagManager(true);
              }}
            />
          </div>
        </div>
      )}

      {/* Tag Manager Modal */}
      <TagManagerModal
        isOpen={showTagManager}
        onClose={() => setShowTagManager(false)}
      />

      {/* Match Scorer Modal */}
      {showScorer && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4"
          onClick={() => setShowScorer(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-xl bg-(--bg) p-6 shadow-2xl border border-(--border)"
          >
            <ErrorBoundary>
              <MatchScorer />
            </ErrorBoundary>
          </div>
        </div>
      )}

      {/* Command Palette */}
      <CommandPalette
        isOpen={palette.isOpen}
        onClose={palette.close}
        commands={commands}
      />
    </div>
  );
}

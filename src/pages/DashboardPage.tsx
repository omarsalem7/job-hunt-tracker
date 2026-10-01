import { useDeferredValue, useState, useMemo } from "react";
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
import {
  TagIcon,
  MoonIcon,
  SunIcon,
  SearchIcon,
  PlusIcon,
  BriefcaseIcon,
  ShareIcon,
} from "../components/common/Icons";
import { ShareModal } from "../components/share/ShareModal";
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
  const [showShareModal, setShowShareModal] = useState(false);

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
      id: "share-board",
      label: "Share board",
      action: () => setShowShareModal(true),
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
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-(--border) bg-(--card-bg) px-6 py-3 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
              <BriefcaseIcon size={16} />
            </div>
            <h1 className="text-base font-bold tracking-tight text-(--text)">
              Job Hunt Command Center
            </h1>
          </div>

          {/* Search Box */}
          <div className="relative">
            <SearchIcon
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              id="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search companies or roles... (⌘K)"
              className="w-80 rounded-lg border border-(--border) bg-(--bg) pl-9 pr-3 py-1.5 text-xs text-(--text) placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2.5">
            {/* Manage Tags Button */}
            <button
              onClick={() => setShowTagManager(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-(--border) bg-(--card-bg) px-3 py-1.5 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors shadow-xs"
              title="Manage custom tags"
            >
              <TagIcon size={13} className="text-blue-600 dark:text-blue-400" />
              <span>Tags</span>
              {allTags.length > 0 && (
                <span className="rounded-full bg-blue-100 dark:bg-blue-900/60 px-1.5 py-0.2 text-[10px] font-bold text-blue-700 dark:text-blue-300">
                  {allTags.length}
                </span>
              )}
            </button>

            {/* Match Score Button */}
            <button
              onClick={() => setShowScorer(true)}
              className="rounded-lg border border-(--border) bg-(--card-bg) px-3 py-1.5 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors shadow-xs"
            >
              Match score
            </button>

            {/* Share Board Button */}
            <button
              onClick={() => setShowShareModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-(--border) bg-(--card-bg) px-3 py-1.5 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors shadow-xs"
              title="Share board with recruiters or mentors"
            >
              <ShareIcon size={13} className="text-blue-600 dark:text-blue-400" />
              <span>Share</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="rounded-lg border border-(--border) bg-(--card-bg) p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors shadow-xs"
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? <MoonIcon size={15} /> : <SunIcon size={15} />}
            </button>

            {/* User Session */}
            {user && (
              <div className="flex items-center gap-2 pl-2 border-l border-(--border)">
                <span className="text-xs text-(--text-muted) font-medium truncate max-w-[140px]">
                  {user.email}
                </span>
                <button
                  onClick={logout}
                  className="rounded-md border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 px-2 py-1 text-[11px] font-medium hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer transition-colors"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Action & Filter Toolbar */}
      <div className="border-b border-(--border) bg-(--card-bg) px-6 py-2.5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* Left: Filter by Tag */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-(--text-muted) mr-1 text-[11px] uppercase tracking-wider">
              Filter by tag:
            </span>

            <button
              onClick={clearTagFilters}
              className={`rounded-full px-3 py-1 font-medium transition-all cursor-pointer ${
                selectedTagFilterIds.length === 0
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold shadow-xs"
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
                  className={isSelected ? "scale-105" : "hover:scale-102"}
                />
              );
            })}

            {selectedTagFilterIds.length > 0 && (
              <button
                onClick={clearTagFilters}
                className="ml-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Right: Board/List View Toggle + Add Application Button */}
          <div className="flex items-center gap-2.5">
            {/* View Toggle */}
            <div className="flex items-center rounded-lg border border-(--border) bg-(--bg) p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setView("board")}
                className={`rounded-md px-2.5 py-1 font-medium cursor-pointer transition-all ${
                  view === "board"
                    ? "bg-(--card-bg) text-blue-600 dark:text-blue-400 shadow-xs font-semibold"
                    : "text-(--text-muted) hover:text-(--text)"
                }`}
              >
                Board
              </button>
              <button
                type="button"
                onClick={() => setView("list")}
                className={`rounded-md px-2.5 py-1 font-medium cursor-pointer transition-all ${
                  view === "list"
                    ? "bg-(--card-bg) text-blue-600 dark:text-blue-400 shadow-xs font-semibold"
                    : "text-(--text-muted) hover:text-(--text)"
                }`}
              >
                List
              </button>
            </div>

            {/* Add Application Primary Button */}
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 cursor-pointer shadow-xs transition-colors"
            >
              <PlusIcon size={13} />
              <span>Add application</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-4 sm:p-6">
        {isLoading ? (
          <div className="flex items-center justify-center p-16 text-gray-400 text-sm">
            Loading applications...
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center p-16 text-red-500 text-sm">
            Failed to load applications:{" "}
            {error instanceof Error ? error.message : "Unknown error"}
          </div>
        ) : view === "board" ? (
          <KanbanBoard
            applications={filteredApplications}
            onSelectApplication={handleSelectApplication}
          />
        ) : (
          <div className="max-w-6xl mx-auto rounded-xl border border-(--border) bg-(--card-bg) shadow-xs overflow-hidden">
            <ApplicationListView
              applications={filteredApplications}
              onSelectApplication={handleSelectApplication}
            />
          </div>
        )}
      </main>

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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-xl border border-(--border) bg-(--bg) p-6 shadow-2xl text-(--text) max-h-[90vh] flex flex-col"
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

      {/* Share Board Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />

      {/* Match Scorer Modal */}
      {showScorer && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4 backdrop-blur-xs"
          onClick={() => setShowScorer(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl bg-(--card-bg) p-6 shadow-2xl border border-(--border)"
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

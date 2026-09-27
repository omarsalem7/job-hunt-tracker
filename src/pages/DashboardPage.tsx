import { useDeferredValue, useState, useMemo } from "react";
import { KanbanBoard } from "../components/kanban/KanbanBoard";
import { AddApplicationForm } from "../components/forms/AddApplicationForm";
import { CommandPalette } from "../components/command-palette/CommandPalette";
import { useCommandPalette } from "../hooks/useCommandPalette";
import { MatchScorer } from "../components/match-scorer/MatchScorer";
import { useApplicationsQuery } from "../hooks/useApplications";
import { ApplicationListView } from "../components/list-view/ApplicationListView";
import { useTheme } from "../hooks/useTheme";
import { ErrorBoundary } from "../components/ErrorBoundary/ErrorBoundary";
import { useAuth } from "../hooks/useAuth";

export function DashboardPage() {
  const { user, logout } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const palette = useCommandPalette();

  const [view, setView] = useState<"board" | "list">("board");
  const {
    data: applications = [],
    isLoading,
    isError,
    error,
  } = useApplicationsQuery();
  const { theme, toggleTheme } = useTheme();

  const [showScorer, setShowScorer] = useState(false);

  // Compute search filtering once at the parent level
  const filteredApplications = useMemo(() => {
    const list = Array.isArray(applications) ? applications : [];
    return list.filter(
      (a) =>
        a.company.toLowerCase().includes(deferredSearch.toLowerCase()) ||
        a.role.toLowerCase().includes(deferredSearch.toLowerCase()),
    );
  }, [applications, deferredSearch]);

  const commands = [
    { id: "add", label: "Add application", action: () => setShowForm(true) },
    {
      id: "focus-search",
      label: "Focus search",
      action: () => document.getElementById("search-input")?.focus(),
    },
    { id: "clear-search", label: "Clear search", action: () => setSearch("") },
  ];

  return (
    <div className="min-h-screen bg-(--bg) text-(--text)">
      <header className="flex items-center justify-between gap-4 border-b border-(--border) px-6 py-4">
        <h1 className="text-lg font-medium text-gray-900 dark:text-white">
          Job Hunt Command Center
        </h1>
        <input
          id="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search companies or roles... (⌘K for commands)"
          className="w-72 rounded border border-gray-300 p-2 text-sm"
        />
        <div className="flex items-center gap-4">
          <button
            onClick={() => setView(view === "board" ? "list" : "board")}
            className="rounded border px-4 py-2 text-sm cursor-pointer"
          >
            {view === "board" ? "List view" : "Board view"}
          </button>
          <button
            onClick={() => setShowScorer(true)}
            className="rounded border px-4 py-2 text-sm cursor-pointer"
          >
            Match score
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="rounded bg-(--text) px-4 py-2 text-sm text-(--bg) cursor-pointer"
          >
            Add application
          </button>
          <button
            onClick={toggleTheme}
            className="rounded border px-3 py-2 text-sm cursor-pointer"
          >
            {theme === "light" ? "🌙" : "☀️"}
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
        <KanbanBoard applications={filteredApplications} />
      ) : (
        <ApplicationListView applications={filteredApplications} />
      )}

      {showForm && (
        <div
          onClick={() => setShowForm(false)}
          className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-96 rounded-xl bg-(--bg) p-6 shadow-2xl"
          >
            <AddApplicationForm onDone={() => setShowForm(false)} />
          </div>
        </div>
      )}

      {showScorer && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
          onClick={() => setShowScorer(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-lg rounded-xl bg-(--bg) p-6 shadow-2xl"
          >
            <ErrorBoundary>
              <MatchScorer />
            </ErrorBoundary>
          </div>
        </div>
      )}

      <CommandPalette
        isOpen={palette.isOpen}
        onClose={palette.close}
        commands={commands}
      />
    </div>
  );
}

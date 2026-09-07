import { useDeferredValue, useState } from "react";
import { KanbanBoard } from "./components/kanban/KanbanBoard";
import { AddApplicationForm } from "./components/forms/AddApplicationForm";
import { CommandPalette } from "./components/command-palette/CommandPalette";
import { useCommandPalette } from "./hooks/useCommandPalette";
import { MatchScorer } from "./components/match-scorer/MatchScorer";
import { useAppStore } from "./store/appStore";
import { ApplicationListView } from "./components/list-view/ApplicationListView";
import { useTheme } from "./hooks/useTheme";
import { ErrorBoundary } from "./components/ErrorBoundary/ErrorBoundary";

function App() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const palette = useCommandPalette();

  const [view, setView] = useState<"board" | "list">("board");
  const applications = useAppStore((s) => s.applications);
  const { theme, toggleTheme } = useTheme();

  const [showScorer, setShowScorer] = useState(false);

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
    <div className="min-h-screen  bg-(--bg) text-(--text)">
      <header className="flex items-center justify-between gap-4 border-b border-(--border) px-6 py-4">
        <h1 className="text-lg font-medium text-gray-900">
          Job Hunt Command Center
        </h1>
        <input
          id="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search companies or roles... (⌘K for commands)"
          className="w-72 rounded border border-gray-300 p-2 text-sm"
        />
        <div className="flex gap-4">
          <button
            onClick={() => setView(view === "board" ? "list" : "board")}
            className="rounded border px-4 py-2 text-sm"
          >
            {view === "board" ? "List view" : "Board view"}
          </button>
          <button
            onClick={() => setShowScorer(true)}
            className="rounded border px-4 py-2 text-sm"
          >
            Match score
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="rounded bg-(--text) px-4 py-2 text-sm text-(--bg)"
          >
            Add application
          </button>
          <button
            onClick={toggleTheme}
            className="rounded border px-3 py-2 text-sm"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>
      </header>

      {view === "board" ? (
        <KanbanBoard searchQuery={deferredSearch} />
      ) : (
        <ApplicationListView applications={applications} />
      )}
      {showForm && (
        <div
          onClick={() => setShowForm(false)}
          className="fixed inset-0 flex items-center justify-center bg-black/40"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-96 rounded-xl bg-(--bg) p-6"
          >
            <AddApplicationForm onDone={() => setShowForm(false)} />
          </div>
        </div>
      )}

      {showScorer && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/40"
          onClick={() => setShowScorer(false)}
        >
          <div
            className="w-lg rounded-xl bg-(--bg) p-6"
            onClick={(e) => e.stopPropagation()}
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

export default App;

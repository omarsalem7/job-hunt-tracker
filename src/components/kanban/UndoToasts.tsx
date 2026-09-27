import type { Application } from "../../types";

export function UndoToasts({
  pendingIds,
  applications,
  onUndo,
}: {
  pendingIds: (string | number)[];
  applications: Application[];
  onUndo: (id: string | number) => void;
}) {
  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2">
      {pendingIds.map((id) => {
        const app = applications.find((a) => a.id === id);
        if (!app) return null;
        return (
          <div
            key={id}
            className="flex items-center gap-3 rounded-lg bg-gray-900 px-4 py-2 text-sm text-white shadow-lg"
          >
            <span>Deleted {app.company}</span>
            <button
              onClick={() => onUndo(id)}
              className="font-medium underline"
            >
              Undo
            </button>
          </div>
        );
      })}
    </div>
  );
}

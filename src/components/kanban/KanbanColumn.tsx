import { useDroppable } from "@dnd-kit/core";
import type { Application, Stage } from "../../types";
import { ApplicationCard } from "./ApplicationCard";

const STAGE_CONFIG: Record<
  Stage,
  { label: string; dotColor: string; accentColor: string }
> = {
  applied: {
    label: "Applied",
    dotColor: "bg-blue-500",
    accentColor: "border-t-blue-500",
  },
  interview: {
    label: "Interview",
    dotColor: "bg-amber-500",
    accentColor: "border-t-amber-500",
  },
  offer: {
    label: "Offer",
    dotColor: "bg-emerald-500",
    accentColor: "border-t-emerald-500",
  },
  rejected: {
    label: "Rejected",
    dotColor: "bg-rose-500",
    accentColor: "border-t-rose-500",
  },
};

export function KanbanColumn({
  stage,
  applications,
  onDelete,
  onSelect,
}: {
  stage: Stage;
  applications: Application[];
  onDelete: (id: string | number) => void;
  onSelect: (application: Application) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const config = STAGE_CONFIG[stage];

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-1 min-w-[280px] max-w-[380px] flex-col rounded-2xl border border-(--border) p-3.5 transition-colors ${
        isOver
          ? "bg-(--bg-column-hover) ring-2 ring-blue-400/50"
          : "bg-(--bg-column)"
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-1 mb-3">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${config.dotColor}`} />
          <h2 className="text-sm font-bold text-(--text)">{config.label}</h2>
        </div>
        <span className="rounded-full bg-(--card-bg) px-2.5 py-0.5 text-xs font-semibold text-gray-500 dark:text-gray-400 border border-(--border) shadow-xs">
          {applications.length}
        </span>
      </div>

      {/* Cards Container */}
      <div className="flex flex-col gap-2.5 flex-1 min-h-[150px]">
        {applications.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-gray-300 dark:border-gray-700/60 p-6 text-center">
            <p className="text-xs italic text-gray-400">No applications</p>
          </div>
        ) : (
          applications.map((app) => (
            <ApplicationCard
              key={app.id}
              application={app}
              onDelete={onDelete}
              onClick={onSelect}
            />
          ))
        )}
      </div>
    </div>
  );
}

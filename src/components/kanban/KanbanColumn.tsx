import { useDroppable } from "@dnd-kit/core";
import type { Application, Stage } from "../../types";
import { ApplicationCard } from "./ApplicationCard";

const STAGE_CONFIG: Record<
  Stage,
  {
    label: string;
    dotColor: string;
  }
> = {
  applied: {
    label: "Applied",
    dotColor: "bg-blue-500",
  },
  interview: {
    label: "Interview",
    dotColor: "bg-amber-500",
  },
  offer: {
    label: "Offer",
    dotColor: "bg-emerald-500",
  },
  rejected: {
    label: "Rejected",
    dotColor: "bg-rose-500",
  },
};

export function KanbanColumn({
  stage,
  applications,
  onDelete,
  onSelect,
  isJustDropped = false,
}: {
  stage: Stage;
  applications: Application[];
  onDelete: (id: string | number) => void;
  onSelect: (application: Application) => void;
  isJustDropped?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const config = STAGE_CONFIG[stage];

  const hasOutline = isOver || isJustDropped;

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-1 min-w-[280px] max-w-[380px] flex-col rounded-2xl border-2 border-(--border) bg-transparent p-3.5 transition-shadow duration-200 ${
        hasOutline
          ? "shadow-[0_0_0_2px_rgba(148,163,184,0.6),0_4px_12px_rgba(0,0,0,0.05)] dark:shadow-[0_0_0_2px_rgba(100,116,139,0.6),0_4px_12px_rgba(0,0,0,0.25)]"
          : "shadow-none"
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-1 mb-3">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${config.dotColor}`} />
          <h2 className="text-sm font-bold text-(--text)">{config.label}</h2>
        </div>
        <span className="rounded-full px-2 py-0.5 text-xs font-semibold bg-transparent text-(--text-muted) border border-(--border)">
          {applications.length}
        </span>
      </div>

      {/* Cards Container */}
      <div className="flex flex-col gap-2.5 flex-1 min-h-[160px]">
        {applications.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-xl border-2 border-dashed border-(--border) p-6 text-center">
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

import { useDroppable } from "@dnd-kit/core";
import type { Application, Stage } from "../../types";
import { ApplicationCard } from "./ApplicationCard";

const STAGE_LABELS: Record<Stage, string> = {
  applied: "Applied",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
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

  return (
    <div
      ref={setNodeRef}
      className={`flex w-64 shrink-0 flex-col gap-2 rounded-xl p-3 transition-colors ${
        isOver ? "bg-(--bg-column-hover)" : "bg-(--bg-column)"
      }`}
    >
      <div className="flex items-center justify-between px-1 mb-1">
        <h2 className="text-sm font-semibold text-(--text)">
          {STAGE_LABELS[stage]}
        </h2>
        <span className="rounded-full bg-(--bg) px-2 py-0.5 text-xs font-semibold text-gray-500 shadow-xs border border-(--border)">
          {applications.length}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {applications.map((app) => (
          <ApplicationCard
            key={app.id}
            application={app}
            onDelete={onDelete}
            onClick={onSelect}
          />
        ))}
      </div>
    </div>
  );
}

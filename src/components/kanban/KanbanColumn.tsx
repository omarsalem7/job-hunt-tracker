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
  onViewContacts,
}: {
  stage: Stage;
  applications: Application[];
  onDelete: (id: string | number) => void;
  onViewContacts?: (application: Application) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  return (
    <div
      ref={setNodeRef}
      className={`flex w-64 flex-col gap-2 rounded-xl p-3 transition-colors ${
        isOver ? "bg-(--bg-column-hover)" : "bg-(--bg-column)"
      }`}
    >
      <h2 className="text-sm font-medium text-(--text)">
        {STAGE_LABELS[stage]}
      </h2>
      <div className="flex flex-col gap-2">
        {applications.map((app) => (
          <ApplicationCard
            key={app.id}
            application={app}
            onDelete={onDelete}
            onViewContacts={onViewContacts}
          />
        ))}
      </div>
    </div>
  );
}

import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import type { Stage } from "../../lib/types";
import { useAppStore } from "../../store/appStore";
import { useOptimisticApplications } from "../../hooks/useOptimisticApplications";
import { KanbanColumn } from "./KanbanColumn";
import { UndoToasts } from "./UndoToasts";
import { useMemo } from "react";

const STAGES: Stage[] = ["applied", "interview", "offer", "rejected"];

export function KanbanBoard({ searchQuery = "" }: { searchQuery?: string }) {
  const updateStage = useAppStore((s) => s.updateStage);
  const {
    applications,
    optimisticApplications,
    pendingIds,
    removeWithUndo,
    undoRemoval,
  } = useOptimisticApplications();

  const filtered = useMemo(
    () =>
      optimisticApplications.filter(
        (a) =>
          a.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.role.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [optimisticApplications, searchQuery],
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    updateStage(active.id as string, over.id as Stage);
  };

  return (
    <>
      <DndContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 p-6">
          {STAGES.map((stage) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              applications={filtered.filter((a) => a.stage === stage)}
              onDelete={removeWithUndo}
            />
          ))}
        </div>
      </DndContext>

      <UndoToasts
        pendingIds={pendingIds}
        applications={applications}
        onUndo={undoRemoval}
      />
    </>
  );
}

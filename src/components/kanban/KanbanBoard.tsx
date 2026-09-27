import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import type { Application, Stage } from "../../lib/types";
import {
  useUpdateStage,
  useDeleteApplication,
} from "../../hooks/useApplications";
import { KanbanColumn } from "./KanbanColumn";

const STAGES: Stage[] = ["applied", "interview", "offer", "rejected"];

interface KanbanBoardProps {
  applications: Application[];
}

export function KanbanBoard({ applications }: KanbanBoardProps) {
  const { mutate: updateStage } = useUpdateStage();
  const { mutate: deleteApplication } = useDeleteApplication();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    updateStage({
      id: active.id as string,
      stage: over.id as Stage,
    });
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 p-6 overflow-x-auto">
        {STAGES.map((stage) => (
          <KanbanColumn
            key={stage}
            stage={stage}
            applications={applications.filter((a) => a.stage === stage)}
            onDelete={(id) => deleteApplication(id)}
          />
        ))}
      </div>
    </DndContext>
  );
}

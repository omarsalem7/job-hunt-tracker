import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { Application, Stage } from "../../types";
import {
  useUpdateStage,
  useDeleteApplication,
} from "../../hooks/useApplications";
import { KanbanColumn } from "./KanbanColumn";

const STAGES: Stage[] = ["applied", "interview", "offer", "rejected"];

interface KanbanBoardProps {
  applications: Application[];
  onSelectApplication: (application: Application) => void;
}

export function KanbanBoard({
  applications,
  onSelectApplication,
}: KanbanBoardProps) {
  const { mutate: updateStage } = useUpdateStage();
  const { mutate: deleteApplication } = useDeleteApplication();

  // Require 8px drag movement before initiating drag
  // This allows clean card click interactions without accidental drag
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    updateStage({
      id: active.id as string,
      stage: over.id as Stage,
    });
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex gap-5 overflow-x-auto pb-8 w-full max-w-[1600px] mx-auto items-start">
        {STAGES.map((stage) => (
          <KanbanColumn
            key={stage}
            stage={stage}
            applications={applications.filter((a) => a.stage === stage)}
            onDelete={(id) => deleteApplication(id)}
            onSelect={onSelectApplication}
          />
        ))}
      </div>
    </DndContext>
  );
}

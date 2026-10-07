import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  pointerWithin,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useState, useMemo } from "react";
import type { Application, Stage } from "../../types";
import {
  useUpdateStage,
  useDeleteApplication,
} from "../../hooks/useApplications";
import { KanbanColumn } from "./KanbanColumn";
import { ApplicationCard } from "./ApplicationCard";

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
  const [activeId, setActiveId] = useState<string | number | null>(null);
  const [justDroppedStage, setJustDroppedStage] = useState<Stage | null>(null);

  // MouseSensor provides direct 60fps native mouse response with zero lag
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 4,
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 200,
      tolerance: 5,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  const activeApplication = useMemo(
    () => applications.find((a) => String(a.id) === String(activeId)) ?? null,
    [applications, activeId]
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const targetStage = over.id as Stage;
    setJustDroppedStage(targetStage);
    setTimeout(() => setJustDroppedStage(null), 600);

    updateStage({
      id: active.id as string,
      stage: targetStage,
    });
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {/* pt-4 provides top clearance ensuring the top border is never cut off */}
      <div className="flex gap-5 overflow-x-auto pt-4 pb-8 px-2 w-full max-w-[1600px] mx-auto items-start">
        {STAGES.map((stage) => (
          <KanbanColumn
            key={stage}
            stage={stage}
            applications={applications.filter((a) => a.stage === stage)}
            isJustDropped={justDroppedStage === stage}
            onDelete={(id) => deleteApplication(id)}
            onSelect={onSelectApplication}
          />
        ))}
      </div>

      <DragOverlay
        dropAnimation={{
          duration: 150,
          easing: "cubic-bezier(0.2, 0, 0, 1)",
        }}
      >
        {activeApplication ? (
          <ApplicationCard
            application={activeApplication}
            isOverlay
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

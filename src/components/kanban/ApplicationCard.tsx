import { useDraggable } from "@dnd-kit/core";
import { memo } from "react";
import type { Application } from "../../types";

export const ApplicationCard = memo(function ApplicationCard({
  application,
  onDelete,
}: {
  application: Application;
  onDelete: (id: string | number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: application.id });
  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-lg border border-(--border) bg-(--bg) p-3 shadow-sm ${isDragging ? "z-10 opacity-50" : ""}`}
    >
      <div
        {...listeners}
        {...attributes}
        className="cursor-grab active:cursor-grabbing"
      >
        <p className="font-medium text-(--text)">{application.company}</p>
        <p className="text-sm text-(--text)">{application.role}</p>
      </div>
      <button
        onClick={() => onDelete(application.id)}
        className="absolute right-2 top-2 hidden text-(--text) hover:text-red-600 group-hover:block"
      >
        ×
      </button>
    </div>
  );
});

import { useDraggable } from "@dnd-kit/core";
import { memo } from "react";
import type { Application } from "../../types";

export const ApplicationCard = memo(function ApplicationCard({
  application,
  onDelete,
  onViewContacts,
}: {
  application: Application;
  onDelete: (id: string | number) => void;
  onViewContacts?: (application: Application) => void;
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

      <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-(--border)/60 text-xs">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onViewContacts?.(application);
          }}
          className="inline-flex items-center gap-1 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer font-medium"
        >
          <span>👤</span>
          <span>Contacts</span>
        </button>
      </div>

      <button
        onClick={() => onDelete(application.id)}
        className="absolute right-2 top-2 hidden text-(--text) hover:text-red-600 group-hover:block cursor-pointer font-bold"
      >
        ×
      </button>
    </div>
  );
});

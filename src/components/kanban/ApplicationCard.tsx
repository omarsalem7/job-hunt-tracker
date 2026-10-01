import { useDraggable } from "@dnd-kit/core";
import { memo } from "react";
import type { Application } from "../../types";
import { TagBadge } from "../tags/TagBadge";
import { TrashIcon } from "../common/Icons";

export const ApplicationCard = memo(function ApplicationCard({
  application,
  onDelete,
  onClick,
}: {
  application: Application;
  onDelete: (id: string | number) => void;
  onClick: (application: Application) => void;
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
      onClick={() => onClick(application)}
      className={`group relative rounded-xl border border-(--border) bg-(--bg) p-3.5 shadow-xs transition-all duration-150 hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer ${
        isDragging ? "z-20 opacity-50 shadow-lg scale-102" : ""
      }`}
    >
      <div
        {...listeners}
        {...attributes}
        className="cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-sm text-(--text) leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {application.company}
          </p>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {application.role}
        </p>

        {/* Tag Badges */}
        {application.tags && application.tags.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1">
            {application.tags.map((tag) => (
              <TagBadge key={tag.id} tag={tag} size="sm" />
            ))}
          </div>
        )}
      </div>

      {/* Delete Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(application.id);
        }}
        className="absolute right-2 top-2 hidden text-gray-400 hover:text-red-600 dark:hover:text-red-400 group-hover:flex h-6 w-6 items-center justify-center rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 cursor-pointer transition-colors"
        title="Delete application"
      >
        <TrashIcon size={12} />
      </button>
    </div>
  );
});

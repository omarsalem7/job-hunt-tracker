import { useDraggable } from "@dnd-kit/core";
import { memo } from "react";
import type { Application, FollowUpStatus } from "../../types";
import { TagBadge } from "../tags/TagBadge";
import { TrashIcon } from "../common/Icons";

const FOLLOW_UP_CONFIG: Record<
  FollowUpStatus,
  { label: string; badgeClass: string; dotClass: string; tooltip: string }
> = {
  NEEDS_FIRST_FOLLOW_UP: {
    label: "1st Follow-Up",
    badgeClass:
      "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60",
    dotClass: "bg-blue-500",
    tooltip: "7+ days since applied without follow-up",
  },
  NEEDS_SECOND_FOLLOW_UP: {
    label: "2nd Follow-Up",
    badgeClass:
      "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60",
    dotClass: "bg-amber-500",
    tooltip: "7+ days since first follow-up",
  },
  STALE_GHOSTED: {
    label: "Stale / Ghosted",
    badgeClass:
      "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60",
    dotClass: "bg-rose-500",
    tooltip: "21+ days without follow-up or 30+ days total",
  },
};

export const ApplicationCard = memo(function ApplicationCard({
  application,
  onDelete,
  onClick,
  isOverlay = false,
}: {
  application: Application;
  onDelete?: (id: string | number) => void;
  onClick?: (application: Application) => void;
  isOverlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } =
    useDraggable({ id: application.id, disabled: isOverlay });

  // When being dragged and rendered inside the source column, render a clean ghost slot
  if (isDragging && !isOverlay) {
    return (
      <div
        ref={setNodeRef}
        className="rounded-xl border-2 border-dashed border-gray-300/50 dark:border-gray-700/50 bg-transparent p-3.5 min-h-[80px] opacity-30"
      />
    );
  }

  const followUpBadge =
    application.followUpStatus && FOLLOW_UP_CONFIG[application.followUpStatus];

  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      onClick={() => onClick?.(application)}
      className={`group relative rounded-xl border bg-(--card-bg) p-3.5 cursor-pointer select-none touch-none ${
        isOverlay
          ? "border-blue-500 shadow-2xl scale-102 rotate-1 cursor-grabbing z-50 ring-2 ring-blue-500/20"
          : "border-(--border) shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-[box-shadow,border-color] duration-150 hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500"
      }`}
    >
      <div
        {...(isOverlay ? {} : listeners)}
        {...(isOverlay ? {} : attributes)}
        className={isOverlay ? "cursor-grabbing" : "cursor-grab active:cursor-grabbing"}
      >
        <div className="flex items-start justify-between gap-2 pr-5">
          <p className="font-semibold text-sm text-(--text) leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {application.company}
          </p>
        </div>
        <p className="text-xs text-(--text-muted) mt-1 font-medium">
          {application.role}
        </p>

        {/* Badges & Tags Row */}
        {(followUpBadge || (application.tags && application.tags.length > 0)) && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {/* Follow-up Status Tag */}
            {followUpBadge && (
              <span
                className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold shadow-2xs ${followUpBadge.badgeClass}`}
                title={followUpBadge.tooltip}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${followUpBadge.dotClass}`} />
                {followUpBadge.label}
              </span>
            )}

            {/* Custom Tag Badges */}
            {application.tags &&
              application.tags.map((tag) => (
                <TagBadge key={tag.id} tag={tag} size="sm" />
              ))}
          </div>
        )}
      </div>

      {/* Delete Button */}
      {onDelete && !isOverlay && (
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
      )}
    </div>
  );
});

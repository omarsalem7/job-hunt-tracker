import React from "react";
import type { Tag } from "../../types";
import { getContrastTextColor } from "../../lib/tagColors";
import { XIcon } from "../common/Icons";

interface TagBadgeProps {
  tag: Tag | { name: string; color?: string; id?: number };
  size?: "sm" | "md";
  onRemove?: () => void;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}

export const TagBadge: React.FC<TagBadgeProps> = ({
  tag,
  size = "sm",
  onRemove,
  onClick,
  selected,
  className = "",
}) => {
  const color = tag.color || "#3B82F6";
  const textColor = getContrastTextColor(color);

  const sizeClasses =
    size === "sm"
      ? "text-[11px] px-2 py-0.5 font-medium"
      : "text-xs px-2.5 py-1 font-medium";

  return (
    <span
      onClick={onClick}
      style={{
        backgroundColor: color,
        color: textColor,
      }}
      className={`inline-flex items-center gap-1 rounded-full transition-all shadow-xs ${sizeClasses} ${
        onClick ? "cursor-pointer hover:opacity-90 active:scale-95" : ""
      } ${selected ? "ring-2 ring-offset-1 ring-blue-500 font-semibold" : ""} ${className}`}
    >
      <span className="truncate max-w-30">{tag.name}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full hover:bg-black/20 focus:outline-none cursor-pointer"
          aria-label={`Remove tag ${tag.name}`}
        >
          <XIcon size={10} />
        </button>
      )}
    </span>
  );
};

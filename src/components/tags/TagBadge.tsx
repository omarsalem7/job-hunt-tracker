import React from "react";
import type { Tag } from "../../types";
import { getTagColorStyles } from "../../lib/tagColors";
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
  const styles = getTagColorStyles(tag.color);

  const sizeClasses =
    size === "sm"
      ? "text-[11px] px-2 py-0.5 gap-1.5 font-medium"
      : "text-xs px-2.5 py-1 gap-1.5 font-medium";

  return (
    <span
      onClick={onClick}
      style={{
        backgroundColor: selected ? styles.border : styles.bg,
        borderColor: styles.border,
        color: styles.text,
      }}
      className={`inline-flex items-center rounded-full border transition-all duration-150 select-none ${sizeClasses} ${
        onClick ? "cursor-pointer hover:brightness-95 active:scale-95" : ""
      } ${
        selected ? "ring-2 ring-blue-500 ring-offset-1 font-semibold shadow-xs" : ""
      } ${className}`}
    >
      <span
        className="h-1.5 w-1.5 rounded-full shrink-0"
        style={{ backgroundColor: styles.dot }}
      />
      <span className="truncate max-w-32">{tag.name}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10 focus:outline-none cursor-pointer text-gray-500 hover:text-gray-700"
          aria-label={`Remove tag ${tag.name}`}
        >
          <XIcon size={10} />
        </button>
      )}
    </span>
  );
};

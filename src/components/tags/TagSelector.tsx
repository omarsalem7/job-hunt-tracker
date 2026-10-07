import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTagsQuery, useCreateTag } from "../../hooks/useTags";
import { TagBadge } from "./TagBadge";
import { PRESET_TAG_COLORS } from "../../lib/tagColors";
import { CheckIcon, PlusIcon } from "../common/Icons";

interface TagSelectorProps {
  selectedTagIds: number[];
  onChange: (ids: number[]) => void;
  onOpenManager?: () => void;
  label?: string;
  placeholder?: string;
}

export const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTagIds,
  onChange,
  onOpenManager,
  label,
  placeholder = "Add tags...",
}) => {
  const { data: allTags = [] } = useTagsQuery();
  const { mutateAsync: createTag, isPending: isCreating } = useCreateTag();

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) {
      setIsOpen(false);
      return;
    }

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const placeAbove = spaceBelow < 230 && spaceAbove > spaceBelow;

    if (placeAbove) {
      setDropdownStyle({
        position: "fixed",
        bottom: `${window.innerHeight - rect.top + 4}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        maxHeight: `${Math.min(280, spaceAbove - 16)}px`,
      });
    } else {
      setDropdownStyle({
        position: "fixed",
        top: `${rect.bottom + 4}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        maxHeight: `${Math.min(280, spaceBelow - 16)}px`,
      });
    }
  };

  const toggleOpen = () => {
    if (!isOpen) {
      updatePosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  // Recompute position on resize or scroll of any ancestor
  useEffect(() => {
    if (!isOpen) return;

    updatePosition();

    const handleScrollOrResize = () => {
      updatePosition();
    };

    window.addEventListener("resize", handleScrollOrResize);
    window.addEventListener("scroll", handleScrollOrResize, true);

    return () => {
      window.removeEventListener("resize", handleScrollOrResize);
      window.removeEventListener("scroll", handleScrollOrResize, true);
    };
  }, [isOpen]);

  // Close on click outside or escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (dropdownRef.current?.contains(target)) return;
      setIsOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [isOpen]);

  const selectedTags = allTags.filter((t) => selectedTagIds.includes(t.id));

  const filteredTags = allTags.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleToggle = (tagId: number) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter((id) => id !== tagId));
    } else {
      onChange([...selectedTagIds, tagId]);
    }
  };

  const handleRemove = (tagId: number) => {
    onChange(selectedTagIds.filter((id) => id !== tagId));
  };

  const handleQuickCreate = async () => {
    const trimmed = search.trim();
    if (!trimmed) return;

    try {
      const color =
        PRESET_TAG_COLORS[trimmed.length % PRESET_TAG_COLORS.length];
      const created = await createTag({ name: trimmed, color });
      onChange([...selectedTagIds, created.id]);
      setSearch("");
    } catch {
      // Error handling
    }
  };

  const hasExactMatch = allTags.some(
    (t) => t.name.toLowerCase() === search.trim().toLowerCase(),
  );

  return (
    <div className="relative">
      {label && (
        <div className="flex items-center justify-between mb-1">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {label}
          </label>
          {onOpenManager && (
            <button
              type="button"
              onClick={onOpenManager}
              className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold cursor-pointer"
            >
              Manage Tags
            </button>
          )}
        </div>
      )}

      {/* Selected Tags Display & Trigger */}
      <div
        ref={triggerRef}
        onClick={toggleOpen}
        className="flex flex-wrap items-center gap-1.5 min-h-[38px] w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5 cursor-pointer focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 transition-colors"
      >
        {selectedTags.length === 0 ? (
          <span className="text-xs text-gray-400 px-1.5">{placeholder}</span>
        ) : (
          selectedTags.map((tag) => (
            <TagBadge
              key={tag.id}
              tag={tag}
              onRemove={() => handleRemove(tag.id)}
            />
          ))
        )}
        <span className="ml-auto text-xs text-gray-400 px-1">▾</span>
      </div>

      {/* Dropdown Popover Portaled to document.body */}
      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={dropdownRef}
            style={dropdownStyle}
            className="z-9999 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 shadow-2xl text-slate-900 dark:text-slate-100 flex flex-col animate-in fade-in zoom-in-95 duration-100"
          >
            <div className="mb-2 shrink-0">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter or create tag..."
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            <div className="overflow-y-auto space-y-1 flex-1 min-h-0">
              {filteredTags.length === 0 && !search.trim() ? (
                <p className="text-xs text-slate-400 py-3 text-center">
                  No tags yet.
                </p>
              ) : (
                filteredTags.map((tag) => {
                  const isSelected = selectedTagIds.includes(tag.id);
                  return (
                    <div
                      key={tag.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggle(tag.id);
                      }}
                      className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                        isSelected
                          ? "bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: tag.color }}
                        />
                        <span className="font-medium truncate">{tag.name}</span>
                      </div>
                      {isSelected && (
                        <CheckIcon
                          size={14}
                          className="text-blue-600 dark:text-blue-400 font-bold shrink-0"
                        />
                      )}
                    </div>
                  );
                })
              )}

              {/* Quick Create Option */}
              {search.trim() && !hasExactMatch && (
                <button
                  type="button"
                  disabled={isCreating}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickCreate();
                  }}
                  className="w-full text-left flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer font-medium"
                >
                  <PlusIcon size={13} />
                  <span>Create &ldquo;{search.trim()}&rdquo;</span>
                </button>
              )}
            </div>

            {onOpenManager && (
              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs shrink-0">
                <span className="text-slate-400">
                  {allTags.length} tags available
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                    onOpenManager();
                  }}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
                >
                  Manage Tags...
                </button>
              </div>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
};

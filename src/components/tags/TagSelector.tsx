import React, { useState, useRef, useEffect } from 'react';
import { useTagsQuery, useCreateTag } from '../../hooks/useTags';
import { TagBadge } from './TagBadge';
import { PRESET_TAG_COLORS } from '../../lib/tagColors';
import { CheckIcon, PlusIcon } from '../common/Icons';

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
    placeholder = 'Add tags...',
}) => {
    const { data: allTags = [] } = useTagsQuery();
    const { mutateAsync: createTag, isPending: isCreating } = useCreateTag();

    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedTags = allTags.filter((t) => selectedTagIds.includes(t.id));

    const filteredTags = allTags.filter((t) =>
        t.name.toLowerCase().includes(search.toLowerCase())
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
            // Pick a color from presets based on length
            const color = PRESET_TAG_COLORS[trimmed.length % PRESET_TAG_COLORS.length];
            const created = await createTag({ name: trimmed, color });
            onChange([...selectedTagIds, created.id]);
            setSearch('');
        } catch {
            // Error handling can fail quietly or show in manager
        }
    };

    const hasExactMatch = allTags.some(
        (t) => t.name.toLowerCase() === search.trim().toLowerCase()
    );

    return (
        <div className="relative" ref={containerRef}>
            {label && (
                <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-gray-500">{label}</label>
                    {onOpenManager && (
                        <button
                            type="button"
                            onClick={onOpenManager}
                            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium cursor-pointer"
                        >
                            Manage Tags
                        </button>
                    )}
                </div>
            )}

            {/* Selected Tags Display & Trigger */}
            <div
                onClick={() => setIsOpen((prev) => !prev)}
                className="flex flex-wrap items-center gap-1.5 min-h-[38px] w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-(--bg) p-1.5 cursor-pointer focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"
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

            {/* Dropdown Popover */}
            {isOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 z-30 rounded-lg border border-(--border) bg-(--bg) p-2 shadow-xl text-(--text)">
                    <div className="mb-2">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Filter or create tag..."
                            className="w-full rounded border border-gray-300 dark:border-gray-600 bg-(--bg) px-2.5 py-1 text-xs text-(--text) focus:outline-none focus:ring-1 focus:ring-blue-500"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-1">
                        {filteredTags.length === 0 && !search.trim() ? (
                            <p className="text-xs text-gray-400 py-2 text-center">No tags yet.</p>
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
                                        className={`flex items-center justify-between rounded px-2 py-1.5 text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                                            isSelected ? 'bg-blue-50/70 dark:bg-blue-900/20' : ''
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="h-2.5 w-2.5 rounded-full"
                                                style={{ backgroundColor: tag.color }}
                                            />
                                            <span className="font-medium">{tag.name}</span>
                                        </div>
                                        {isSelected && (
                                            <CheckIcon size={14} className="text-blue-600 font-bold shrink-0" />
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
                                className="w-full text-left flex items-center gap-1.5 rounded px-2 py-1.5 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer font-medium"
                            >
                                <PlusIcon size={13} />
                                <span>Create &ldquo;{search.trim()}&rdquo;</span>
                            </button>
                        )}
                    </div>

                    {onOpenManager && (
                        <div className="mt-2 pt-2 border-t border-(--border) flex justify-between items-center text-xs">
                            <span className="text-gray-400">{allTags.length} tags available</span>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsOpen(false);
                                    onOpenManager();
                                }}
                                className="text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
                            >
                                Manage Tags...
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

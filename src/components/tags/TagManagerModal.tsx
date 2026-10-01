import React, { useState } from 'react';
import { useTagsQuery, useCreateTag, useUpdateTag, useDeleteTag } from '../../hooks/useTags';
import { PRESET_TAG_COLORS } from '../../lib/tagColors';
import { TagBadge } from './TagBadge';
import { TagIcon, PencilIcon, TrashIcon, XIcon } from '../common/Icons';
import type { Tag } from '../../types';

interface TagManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const TagManagerModal: React.FC<TagManagerModalProps> = ({ isOpen, onClose }) => {
    const { data: tags = [], isLoading } = useTagsQuery();
    const { mutateAsync: createTag, isPending: isCreating } = useCreateTag();
    const { mutateAsync: updateTag, isPending: isUpdating } = useUpdateTag();
    const { mutateAsync: deleteTag, isPending: isDeleting } = useDeleteTag();

    const [newName, setNewName] = useState('');
    const [newColor, setNewColor] = useState(PRESET_TAG_COLORS[0]);
    const [editingTagId, setEditingTagId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [editColor, setEditColor] = useState('');
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const trimmed = newName.trim();
        if (!trimmed) return;

        try {
            await createTag({ name: trimmed, color: newColor });
            setNewName('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create tag');
        }
    };

    const handleStartEdit = (tag: Tag) => {
        setEditingTagId(tag.id);
        setEditName(tag.name);
        setEditColor(tag.color);
        setError(null);
    };

    const handleSaveEdit = async (id: number) => {
        setError(null);
        const trimmed = editName.trim();
        if (!trimmed) return;

        try {
            await updateTag({ id, data: { name: trimmed, color: editColor } });
            setEditingTagId(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update tag');
        }
    };

    const handleDelete = async (tag: Tag) => {
        const appCount = tag._count?.applications ?? 0;
        const confirmMsg =
            appCount > 0
                ? `Tag "${tag.name}" is attached to ${appCount} application(s). Deleting it will detach it from them. Continue?`
                : `Delete tag "${tag.name}"?`;

        if (!window.confirm(confirmMsg)) return;

        setError(null);
        try {
            await deleteTag(tag.id);
            if (editingTagId === tag.id) {
                setEditingTagId(null);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete tag');
        }
    };

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg rounded-xl border border-(--border) bg-(--bg) p-6 shadow-2xl text-(--text) max-h-[90vh] flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-(--border) pb-3 mb-4">
                    <div className="flex items-center gap-2">
                        <TagIcon size={20} className="text-blue-600 dark:text-blue-400" />
                        <h2 className="text-lg font-semibold">Manage Tags</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                    >
                        <XIcon size={18} />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-900/30 dark:text-red-400">
                        {error}
                    </div>
                )}

                {/* Create Tag Section */}
                <form onSubmit={handleCreate} className="mb-5 rounded-lg border border-(--border) p-3 bg-gray-50/50 dark:bg-gray-800/40">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Create New Tag</p>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Tag name (e.g. Remote, Referral, High Salary)..."
                            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-(--bg) px-3 py-1.5 text-sm text-(--text) focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="submit"
                            disabled={isCreating || !newName.trim()}
                            className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer transition-colors"
                        >
                            {isCreating ? 'Adding...' : 'Add Tag'}
                        </button>
                    </div>

                    {/* Color Presets */}
                    <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs text-gray-500 mr-1">Color:</span>
                        {PRESET_TAG_COLORS.map((c) => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setNewColor(c)}
                                style={{ backgroundColor: c }}
                                className={`h-6 w-6 rounded-full cursor-pointer transition-transform ${
                                    newColor.toLowerCase() === c.toLowerCase()
                                        ? 'scale-125 ring-2 ring-offset-2 ring-blue-500'
                                        : 'hover:scale-110'
                                }`}
                                aria-label={`Select color ${c}`}
                            />
                        ))}
                        <input
                            type="color"
                            value={newColor}
                            onChange={(e) => setNewColor(e.target.value)}
                            className="h-6 w-6 rounded border-0 bg-transparent cursor-pointer p-0 ml-1"
                            title="Custom color"
                        />
                    </div>
                </form>

                {/* Existing Tags List */}
                <div className="flex-1 overflow-y-auto pr-1">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Your Tags ({tags.length})
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="py-8 text-center text-sm text-gray-500">Loading tags...</div>
                    ) : tags.length === 0 ? (
                        <div className="py-8 text-center text-sm text-gray-400">
                            No tags created yet. Create your first tag above!
                        </div>
                    ) : (
                        <ul className="space-y-2">
                            {tags.map((tag) => {
                                const isEditing = editingTagId === tag.id;

                                return (
                                    <li
                                        key={tag.id}
                                        className="flex items-center justify-between gap-2 rounded-lg border border-(--border) p-2.5 bg-(--bg) hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                                    >
                                        {isEditing ? (
                                            <div className="flex flex-1 flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                        className="flex-1 rounded border border-gray-300 dark:border-gray-600 bg-(--bg) px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <input
                                                        type="color"
                                                        value={editColor}
                                                        onChange={(e) => setEditColor(e.target.value)}
                                                        className="h-7 w-7 rounded cursor-pointer border-0 bg-transparent p-0"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        disabled={isUpdating}
                                                        onClick={() => handleSaveEdit(tag.id)}
                                                        className="rounded bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingTagId(null)}
                                                        className="rounded border border-(--border) px-2.5 py-1 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <TagBadge tag={tag} size="md" />
                                                    <span className="text-xs text-gray-400">
                                                        {tag._count?.applications ?? 0} {tag._count?.applications === 1 ? 'app' : 'apps'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleStartEdit(tag)}
                                                        className="rounded p-1 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                                                        title="Edit tag"
                                                    >
                                                        <PencilIcon size={14} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={isDeleting}
                                                        onClick={() => handleDelete(tag)}
                                                        className="rounded p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer transition-colors"
                                                        title="Delete tag"
                                                    >
                                                        <TrashIcon size={14} />
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-4 pt-3 border-t border-(--border) flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-(--border) px-4 py-1.5 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

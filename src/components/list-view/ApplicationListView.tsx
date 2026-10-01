import { List, type RowComponentProps } from "react-window";
import type { Application } from "../../types";
import { TagBadge } from "../tags/TagBadge";

interface RowData {
  applications: Application[];
  onSelectApplication?: (app: Application) => void;
}

function Row({
  index,
  applications,
  onSelectApplication,
  style,
}: RowComponentProps<RowData>) {
  const app = applications[index];
  return (
    <div
      style={style}
      onClick={() => onSelectApplication?.(app)}
      className="flex items-center justify-between border-b border-(--border) px-4 text-sm hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors cursor-pointer"
    >
      <div className="flex items-center gap-3 min-w-[200px]">
        <span className="font-semibold text-(--text) hover:text-blue-600 transition-colors">
          {app.company}
        </span>
        <span className="text-gray-500 dark:text-gray-400 text-xs">{app.role}</span>
      </div>

      {/* Tags column */}
      <div className="flex items-center gap-1.5 flex-1 mx-4 overflow-hidden">
        {app.tags && app.tags.length > 0 ? (
          app.tags.map((tag) => (
            <TagBadge key={tag.id} tag={tag} size="sm" />
          ))
        ) : (
          <span className="text-xs text-gray-300 dark:text-gray-600 italic">No tags</span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <span className="text-xs text-gray-400">
          {new Date(app.appliedDate).toLocaleDateString()}
        </span>
        <span className="capitalize px-2.5 py-0.5 rounded-full text-xs font-medium border border-(--border) bg-gray-100 dark:bg-gray-800 text-(--text)">
          {app.stage}
        </span>
      </div>
    </div>
  );
}

export function ApplicationListView({
  applications,
  onSelectApplication,
}: {
  applications: Application[];
  onSelectApplication?: (app: Application) => void;
}) {
  return (
    <List
      rowComponent={Row}
      rowCount={applications.length}
      rowHeight={56}
      rowProps={{ applications, onSelectApplication }}
      style={{ height: 800 }}
    />
  );
}

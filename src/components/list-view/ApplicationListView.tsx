import { List, type RowComponentProps } from "react-window";
import type { Application } from "../../types";

function Row({
  index,
  applications,
  style,
}: RowComponentProps<{ applications: Application[] }>) {
  const app = applications[index];
  return (
    <div
      style={style}
      className="flex items-center justify-between border-b border-(--border) px-4 text-sm"
    >
      <span className="font-medium text-(--text)">{app.company}</span>
      <span className="text-(--text)">{app.role}</span>
      <span className="capitalize text-(--text)">{app.stage}</span>
    </div>
  );
}

export function ApplicationListView({
  applications,
}: {
  applications: Application[];
}) {
  return (
    <List
      rowComponent={Row}
      rowCount={applications.length}
      rowHeight={56}
      rowProps={{ applications }}
      style={{ height: 800 }}
    />
  );
}

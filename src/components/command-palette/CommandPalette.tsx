import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface Command {
  id: string;
  label: string;
  action: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  commands,
}: {
  isOpen: boolean;
  onClose: () => void;
  commands: Command[];
}) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      filtered[activeIndex]?.action();
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-24"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Type a command..."
          className="w-full border-b border-gray-200 p-3 outline-none"
        />
        <ul className="max-h-64 overflow-y-auto p-2">
          {filtered.length === 0 && (
            <li className="p-2 text-sm text-gray-400">No commands found</li>
          )}
          {filtered.map((cmd, i) => (
            <li
              key={cmd.id}
              onMouseEnter={() => setActiveIndex(i)}
              onClick={() => {
                cmd.action();
                onClose();
              }}
              className={`cursor-pointer rounded p-2 text-sm ${
                i === activeIndex ? "bg-gray-900 text-white" : "text-gray-700"
              }`}
            >
              {cmd.label}
            </li>
          ))}
        </ul>
      </div>
    </div>,
    document.body,
  );
}

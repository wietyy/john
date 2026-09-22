import { useState } from "react";

const TITLE_STORAGE_KEY = "documentTitle";
const DEFAULT_TITLE = "Untitled";

type ActionBarProps = {
  onNewTransaction?: () => void;
};

export function ActionBar({ onNewTransaction }: ActionBarProps) {
  const [title, setTitle] = useState(
    () => localStorage.getItem(TITLE_STORAGE_KEY) ?? DEFAULT_TITLE,
  );
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  function editTitle() {
    setIsEditingTitle(true);
  }

  function saveTitle() {
    localStorage.setItem(TITLE_STORAGE_KEY, title);
    setIsEditingTitle(false);
  }

  return (
    <div className="flex items-center justify-between gap-4 bg-gray-900 px-4 py-2 text-white">
      {isEditingTitle ? (
        <input
          autoFocus
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onBlur={saveTitle}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
          }}
          className="rounded bg-gray-800 px-2 py-0.5 text-lg font-semibold text-white outline-none"
        />
      ) : (
        <h1
          onClick={editTitle}
          className="cursor-pointer rounded px-2 py-0.5 text-lg font-semibold"
        >
          {title}
        </h1>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onNewTransaction}
          className="rounded bg-gray-700 px-3 py-1 text-sm font-medium text-white hover:bg-gray-600"
        >
          New Transaction
        </button>
      </div>
    </div>
  );
}
